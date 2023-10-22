import { atom, selectAtom } from "../deps.ts";
import { pagesAtom, viewerElementAtom } from "./viewer_state_atoms.ts";

const scrollElementStateAtom = atom<
  {
    div: HTMLDivElement;
    intersectionObserver: IntersectionObserver;
    resizeObserver: ResizeObserver;
  } | null
>(null);
export const scrollObserverAtom = selectAtom(
  scrollElementStateAtom,
  (state) => state?.intersectionObserver,
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

export const scrollElementAtom = atom(
  (get) => get(scrollElementStateAtom)?.div ?? null,
  (get, set, div: HTMLDivElement | null) => {
    set(scrollElementStateAtom, (previous) => {
      if (previous?.div === div) {
        return previous;
      }

      previous?.intersectionObserver.disconnect();
      previous?.resizeObserver.disconnect();

      if (div === null) {
        return null;
      }

      const resizeObserver = new ResizeObserver(() => {
        set(restoreScrollAtom);
      });
      resizeObserver.observe(div);
      const intersectionObserver = new IntersectionObserver(
        (entries) => set(resetAnchorAtom, entries),
        { threshold: [0.01, 0.5, 1] },
      );
      for (const pageAtom of get(pagesAtom) ?? []) {
        const page = get(pageAtom);
        const element = get(page.elementAtom);
        if (!element) {
          continue;
        }
        intersectionObserver.observe(element);
      }
      return { div, intersectionObserver, resizeObserver };
    });
  },
);
scrollElementAtom.onMount = (set) => () => set(null);

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

export const navigateAtom = atom(null, (get, set, event: React.MouseEvent) => {
  const height = get(viewerElementAtom)?.clientHeight;
  if (!height || event.button !== 0) {
    return;
  }
  event.preventDefault();

  const isTop = event.clientY < height / 2;
  if (isTop) {
    set(goPreviousAtom);
  } else {
    set(goNextAtom);
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
