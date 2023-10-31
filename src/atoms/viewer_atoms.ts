import { atom, ExtractAtomValue, RESET, selectAtom, toast } from "../deps.ts";
import { ImageSource, ViewerOptions } from "../types.ts";
import { timeout } from "../utils.ts";
import { createPageAtom, PageAtom } from "./create_page_atom.ts";
import { focusWithoutScroll, getCurrentWindowScroll } from "./dom/dom_helpers.ts";
import {
  doubleScrollBarHidingAtom,
  fullscreenElementAtom,
  viewerElementAtom,
  viewerFullscreenAtom,
} from "./fullscreen_atom.ts";
import { i18nAtom } from "./i18n_atom.ts";
import { pageScrollStateAtom } from "./navigation_atoms.ts";
import {
  fullscreenNoticeCountAtom,
  isFullscreenPreferredAtom,
  isImmersiveAtom,
} from "./persistent_atoms.ts";

type ViewerState =
  & { options: ViewerOptions }
  & ({
    status: "loading" | "error";
  } | {
    status: "complete";
    images: ImageSource[];
    pages: PageAtom[];
  });
export const viewerStateAtom = atom<ViewerState>({
  options: {},
  status: "loading",
});
export const pagesAtom = selectAtom(
  viewerStateAtom,
  (state) => (state as { pages?: PageAtom[] }).pages,
);

const transferViewerScrollToWindowAtom = atom(null, (get) => {
  const { page, ratio } = get(pageScrollStateAtom);
  const src = page?.querySelector("img")?.src;
  if (!src) {
    return;
  }

  const fileName = src.split("/").pop()?.split("?")[0];
  const candidates = document.querySelectorAll<HTMLImageElement>(`img[src*="${fileName}"]`);
  const original = [...candidates].find((img) => img.src === src);
  const isViewerImage = original?.parentElement === page;
  if (!original || isViewerImage) {
    return;
  }

  const rect = original.getBoundingClientRect();
  const top = window.scrollY + rect.y + rect.height * ratio - window.innerHeight / 2;
  scroll({ behavior: "instant", top });
});

const transferWindowScrollToViewerAtom = atom(null, (get, set) => {
  const viewerPages = get(pagesAtom)?.map(get);
  if (!viewerPages || !viewerPages.length) {
    return;
  }

  const urlToViewerPages = new Map<string, ExtractAtomValue<PageAtom>>();
  for (const viewerPage of viewerPages) {
    if (viewerPage.imageProps.src) {
      urlToViewerPages.set(viewerPage.imageProps.src, viewerPage);
    }
  }
  const urls = [...urlToViewerPages.keys()];
  const { page, ratio, fullyVisiblePages: fullyVisibleWindowPages } = getCurrentWindowScroll(urls);
  if (!page) {
    return;
  }

  const viewerPage = urlToViewerPages.get(page.src);
  if (!viewerPage) {
    return;
  }

  const fullyVisiblePages = fullyVisibleWindowPages.flatMap((img) => {
    const divAtom = urlToViewerPages.get(img.src)?.divAtom;
    if (!divAtom) {
      return [];
    }
    return get(divAtom) ?? [];
  });

  set(pageScrollStateAtom, {
    page: get(viewerPage.divAtom),
    ratio,
    fullyVisiblePages,
  });
});

export const isViewerImmersiveAtom = atom(
  (get) => {
    get(doubleScrollBarHidingAtom);
    return get(isImmersiveAtom);
  },
  (get, set, value: boolean | typeof RESET) => {
    if (value !== RESET) {
      set(isImmersiveAtom, value);
    }
    set(doubleScrollBarHidingAtom);

    const viewer = get(viewerElementAtom);
    if (!viewer) {
      return;
    }

    if (value !== false) {
      focusWithoutScroll(viewer);
    }
    if (value === RESET) {
      return;
    }

    if (!get(viewerStateAtom).options.noSyncScroll) {
      set(value ? transferWindowScrollToViewerAtom : transferViewerScrollToWindowAtom);
    }
  },
);
isViewerImmersiveAtom.onMount = (set) => void set(RESET);

const isBeforeUnloadAtom = atom(false);
const beforeUnloadAtom = atom(null, async (_get, set) => {
  set(isBeforeUnloadAtom, true);
  for (let i = 0; i < 5; i++) {
    await timeout(100);
  }
  set(isBeforeUnloadAtom, false);
});
beforeUnloadAtom.onMount = (set) => {
  addEventListener("beforeunload", set);
  return () => removeEventListener("beforeunload", set);
};

export const fullscreenSynchronizationAtom = atom(
  (get) => {
    get(beforeUnloadAtom);
    return get(fullscreenElementAtom);
  },
  (get, set, element: Element | null) => {
    set(fullscreenElementAtom, element);
    if (!get(isFullscreenPreferredAtom)) {
      return;
    }

    const isFullscreen = get(viewerElementAtom) === element;
    const wasImmersive = get(isViewerImmersiveAtom);
    const isViewerFullscreenExit = wasImmersive && !isFullscreen;
    const isNavigationExit = get(isBeforeUnloadAtom);
    if (isViewerFullscreenExit && !isNavigationExit) {
      set(isViewerImmersiveAtom, false);
    }
  },
);

export const fullscreenAwareImmersiveAtom = atom(
  (get) => get(isViewerImmersiveAtom),
  async (get, set, value: boolean) => {
    set(isViewerImmersiveAtom, value);

    if (get(isFullscreenPreferredAtom)) {
      await set(viewerFullscreenAtom, value);
    }
  },
);

export const fullscreenSyncWithWindowScrollAtom = atom(
  (get) => get(fullscreenSynchronizationAtom),
  (_get, set, element: Element | null) => {
    set(fullscreenSynchronizationAtom, element);
  },
);
fullscreenSyncWithWindowScrollAtom.onMount = (set) => {
  const notify = () => set(document.fullscreenElement ?? null);
  document.addEventListener("fullscreenchange", notify);
  return () => document.removeEventListener("fullscreenchange", notify);
};

export const setViewerElementAtom = atom(
  null,
  async (get, set, element: HTMLDivElement | null) => {
    set(viewerElementAtom, element);

    const isViewerFullscreen = get(viewerFullscreenAtom);
    const isFullscreenPreferred = get(isFullscreenPreferredAtom);
    const isImmersive = get(fullscreenAwareImmersiveAtom);
    const shouldEnterFullscreen = isFullscreenPreferred && isImmersive;
    if (isViewerFullscreen === shouldEnterFullscreen || !element) {
      return;
    }

    const isUserFullscreen = window.innerHeight === screen.height ||
      window.innerWidth === screen.width;
    if (isUserFullscreen) {
      return;
    }

    try {
      if (shouldEnterFullscreen) {
        await set(viewerFullscreenAtom, true);
      }
    } catch (error) {
      // Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.
      if (error?.message === "Permissions check failed") {
        if (get(fullscreenNoticeCountAtom) >= 3) {
          return;
        }
        toast(get(i18nAtom).fullScreenRestorationGuide);
        await timeout(5000);
        set(fullscreenNoticeCountAtom, (count) => count + 1);
        return;
      }
      throw error;
    }
  },
);

export const viewerModeAtom = atom((get) => {
  const isFullscreen = get(viewerFullscreenAtom);
  const isImmersive = get(fullscreenAwareImmersiveAtom);
  return isFullscreen ? "fullscreen" : isImmersive ? "window" : "normal";
});

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
        pages: images.map((source, index) => createPageAtom({ source, index })),
      }));
    } catch (error) {
      set(viewerStateAtom, (state) => ({ ...state, status: "error" }));
      console.error(error);
      throw error;
    }
  },
);

export const reloadErroredAtom = atom(null, (get, set) => {
  window.stop();

  const pages = get(pagesAtom);
  for (const atom of pages ?? []) {
    const page = get(atom);
    if (page.state.state !== "complete") {
      set(page.reloadAtom);
    }
  }
});

export const toggleImmersiveAtom = atom(null, async (get, set) => {
  await set(fullscreenAwareImmersiveAtom, !get(fullscreenAwareImmersiveAtom));
});

export const blockSelectionAtom = atom(null, (_get, set, event: React.MouseEvent) => {
  if (event.detail >= 2) {
    event.preventDefault();
  }

  if (event.buttons === 3) {
    set(toggleImmersiveAtom);
    event.preventDefault();
  }
});
