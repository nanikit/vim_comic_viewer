import { atom } from "jotai";
import { selectAtom } from "jotai/utils";
import { createPageAtom } from "../hooks/create_page_atom.ts";
import { ImageSource, ViewerOptions } from "../types.ts";
import { gmValueAtom } from "./helper/gm_value_atom.ts";

export const viewerElementAtom = atom<HTMLDivElement | null>(null);
const scrollElementStateAtom = atom<
  {
    div: HTMLDivElement;
    intersectionObserver: IntersectionObserver;
    resizeObserver: ResizeObserver;
  } | null
>(null);

export const backgroundColorAtom = gmValueAtom("vim_comic_viewer.background_color", "#eeeeee");
export const compactWidthIndexAtom = gmValueAtom("vim_comic_viewer.single_page_count", 1);

type ViewerState =
  & { options: ViewerOptions }
  & ({
    status: "loading" | "error";
  } | {
    status: "complete";
    images: ImageSource[];
    pages: ReturnType<typeof createPageAtom>[];
  });
export const viewerStateAtom = atom<ViewerState>({ options: {}, status: "loading" });
export const setViewerOptionsAtom = atom(
  null,
  async (get, set, options: ViewerOptions) => {
    try {
      const { source } = options;
      if (source === get(viewerStateAtom).options.source) {
        return;
      }

      if (!source) {
        set(viewerStateAtom, (state) => ({
          ...state,
          status: "complete",
          images: [],
          pages: [],
        }));
        return;
      }

      set(viewerStateAtom, (state) => ({ ...state, status: "loading" }));
      const images = await source();

      if (!Array.isArray(images)) {
        throw new Error(`Invalid comic source type: ${typeof images}`);
      }

      set(viewerStateAtom, (state) => ({
        ...state,
        status: "complete",
        images,
        pages: images.map((source) => createPageAtom({ source })),
      }));
    } catch (error) {
      set(viewerStateAtom, (state) => ({ ...state, status: "error" }));
      console.error(error);
      throw error;
    }
  },
);

type PageScrollState = {
  currentPage?: HTMLElement;
  ratio?: number;
  ignoreIntersection: boolean;
};
const pageScrollStateAtom = atom<PageScrollState>({
  ignoreIntersection: false,
});

const resetAnchorAtom = atom(null, (get, set, entries: IntersectionObserverEntry[]) => {
  const element = get(scrollElementAtom);
  if (!element?.clientHeight || entries.length === 0) {
    return;
  }

  const state = get(pageScrollStateAtom);
  if (state.ignoreIntersection) {
    set(pageScrollStateAtom, (prev) => ({ ...prev, ignoreIntersection: false }));
    return;
  }

  const page = getCurrentPage(element, entries) as HTMLElement;
  const y = element.scrollTop + element.clientHeight / 2;
  set(pageScrollStateAtom, (prev) => ({
    ...prev,
    currentPage: page,
    ratio: (y - page.offsetTop) / page.clientHeight,
  }));
});

export const goNextAtom = atom(null, (get, set) => {
  const state = get(pageScrollStateAtom);
  set(pageScrollStateAtom, (prev) => ({ ...prev, ignoreIntersection: false }));
  if (!state.currentPage) {
    return;
  }

  const originBound = state.currentPage.getBoundingClientRect();
  let cursor = state.currentPage as Element;
  while (cursor.nextElementSibling) {
    const next = cursor.nextElementSibling;
    const nextBound = next.getBoundingClientRect();
    if (originBound.bottom < nextBound.top) {
      next.scrollIntoView({ block: "center" });
      break;
    }
    cursor = next;
  }
});

export const goPreviousAtom = atom(null, (get, set) => {
  const state = get(pageScrollStateAtom);
  set(pageScrollStateAtom, (prev) => ({ ...prev, ignoreIntersection: false }));
  if (!state.currentPage) {
    return;
  }

  const originBound = state.currentPage.getBoundingClientRect();
  let cursor = state.currentPage as Element;
  while (cursor.previousElementSibling) {
    const previous = cursor.previousElementSibling;
    const previousBound = previous.getBoundingClientRect();
    if (previousBound.bottom < originBound.top) {
      previous.scrollIntoView({ block: "center" });
      break;
    }
    cursor = previous;
  }
});

const restoreScrollAtom = atom(null, (get, set) => {
  const state = get(pageScrollStateAtom);
  const element = get(scrollElementAtom);
  if (!element || state.ratio === undefined || state.currentPage === undefined) {
    return;
  }

  const restoredY = state.currentPage.offsetTop +
    state.currentPage.clientHeight * (state.ratio - 0.5);
  element.scroll({ top: restoredY });
  set(pageScrollStateAtom, (prev) => ({ ...prev, ignoreIntersection: true }));
});

export const scrollObserverAtom = selectAtom(
  scrollElementStateAtom,
  (state) => state?.intersectionObserver,
);
export const scrollElementAtom = atom(
  (get) => get(scrollElementStateAtom)?.div ?? null,
  (_get, set, div: HTMLDivElement | null) => {
    set(scrollElementStateAtom, (state) => {
      if (state?.div === div) {
        return state;
      }

      state?.intersectionObserver.disconnect();
      state?.resizeObserver.disconnect();
      if (div === null) {
        return null;
      }
      const resizeObserver = new ResizeObserver(() => {
        set(restoreScrollAtom);
      });
      resizeObserver.observe(div);
      return {
        div,
        intersectionObserver: new IntersectionObserver((entries) => set(resetAnchorAtom, entries), {
          threshold: [0.01, 0.5, 1],
        }),
        resizeObserver,
      };
    });
  },
);
scrollElementAtom.onMount = (set) => () => set(null);

export type MaybePages = { pages?: ReturnType<typeof createPageAtom>[] };
export const reloadErroredAtom = atom(null, (get, set) => {
  window.stop();

  const viewer = get(viewerStateAtom) as MaybePages;
  for (const atom of viewer?.pages ?? []) {
    const page = get(atom);
    if (page.state.state !== "complete") {
      set(page.reloadAtom);
    }
  }
});

function getCurrentPage(container: HTMLElement, entries: IntersectionObserverEntry[]) {
  if (!entries.length) {
    return container.firstElementChild || undefined;
  }

  const children = [...((container.children as unknown) as Iterable<Element>)];
  const fullyVisiblePages = entries.filter((x) => x.intersectionRatio === 1);
  if (fullyVisiblePages.length) {
    fullyVisiblePages.sort((a, b) => {
      return children.indexOf(a.target) - children.indexOf(b.target);
    });
    return fullyVisiblePages[Math.floor(fullyVisiblePages.length / 2)].target;
  }

  return entries.sort((a, b) => {
    const ratio = {
      a: a.intersectionRatio,
      b: b.intersectionRatio,
    };
    const index = {
      a: children.indexOf(a.target),
      b: children.indexOf(b.target),
    };
    return (ratio.b - ratio.a) * 10000 + (index.a - index.b);
  })[0].target;
}
