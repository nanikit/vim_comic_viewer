import { atom, ExtractAtomValue, Root, selectAtom, toast } from "../deps.ts";
import { ImageSource, ViewerOptions } from "../types.ts";
import { timeout } from "../utils.ts";
import { createPageAtom, PageAtom } from "./create_page_atom.ts";
import {
  focusWithoutScroll,
  getCurrentScroll,
  getUrlImgs,
  isUserGesturePermissionError,
} from "./dom/dom_helpers.ts";
import {
  isFullscreenPreferredSettingsAtom,
  scrollBarStyleFactorAtom,
  viewerFullscreenAtom,
} from "./fullscreen_atom.ts";
import { i18nAtom } from "./i18n_atom.ts";
import {
  pageScrollStateAtom,
  restoreScrollAtom,
  scrollElementAtom,
  transferViewerScrollToWindowAtom,
} from "./navigation_atoms.ts";
import { fullscreenNoticeCountAtom, isFullscreenPreferredAtom } from "./persistent_atoms.ts";

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
export const rootAtom = atom<Root | null>(null);

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
  const imgs = getUrlImgs(urls);
  const viewerImgs = new Set(viewerPages.flatMap((page) => page.div?.querySelector("img") ?? []));
  const originalImgs = imgs.filter((img) => !viewerImgs.has(img));
  const { page, ratio, fullyVisiblePages: fullyVisibleWindowPages } = getCurrentScroll(
    originalImgs,
  );
  if (!page) {
    return;
  }

  const viewerPage = urlToViewerPages.get(page.src);
  if (!viewerPage) {
    return;
  }

  const fullyVisiblePages = fullyVisibleWindowPages.flatMap((img) => {
    return urlToViewerPages.get(img.src)?.div ?? [];
  });

  const snappedRatio = Math.abs(ratio - 0.5) < 0.1 ? 0.5 : ratio;
  set(pageScrollStateAtom, {
    page: viewerPage.div,
    ratio: snappedRatio,
    fullyVisiblePages,
  });
});

export const isViewerImmersiveAtom = atom(
  (get) => get(scrollBarStyleFactorAtom).isImmersive,
  async (get, set, value: boolean) => {
    if (!get(viewerStateAtom).options.noSyncScroll && value) {
      set(transferWindowScrollToViewerAtom);
    }
    set(scrollBarStyleFactorAtom, { isImmersive: value });

    const scrollable = get(scrollElementAtom);
    if (!scrollable) {
      return;
    }

    if (value) {
      focusWithoutScroll(scrollable);
    }

    try {
      if (get(isFullscreenPreferredAtom)) {
        await set(viewerFullscreenAtom, value);
        if (value) {
          // HACK: have to wait reflow uncertain times.
          await timeout(1);
        }
      }
    } finally {
      if (value) {
        set(restoreScrollAtom);
      } else if (!get(viewerStateAtom).options.noSyncScroll) {
        set(transferViewerScrollToWindowAtom);
      }
    }
  },
);

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
    return get(scrollBarStyleFactorAtom).fullscreenElement;
  },
  (get, set, element: Element | null) => {
    const isFullscreenPreferred = get(isFullscreenPreferredAtom);
    const isFullscreen = element === get(scrollBarStyleFactorAtom).viewerElement;
    const wasImmersive = get(isViewerImmersiveAtom);
    const isViewerFullscreenExit = wasImmersive && !isFullscreen;
    const isNavigationExit = get(isBeforeUnloadAtom);
    const shouldExitImmersive = isFullscreenPreferred && isViewerFullscreenExit &&
      !isNavigationExit;
    set(scrollBarStyleFactorAtom, {
      fullscreenElement: element,
      isImmersive: shouldExitImmersive ? false : undefined,
    });
  },
);
fullscreenSynchronizationAtom.onMount = (set) => {
  const notify = () => set(document.fullscreenElement ?? null);
  document.addEventListener("fullscreenchange", notify);
  return () => document.removeEventListener("fullscreenchange", notify);
};

export const setViewerElementAtom = atom(
  null,
  async (get, set, element: HTMLDivElement | null) => {
    set(scrollBarStyleFactorAtom, { viewerElement: element });

    const scrollable = get(scrollElementAtom);
    if (scrollable) {
      focusWithoutScroll(scrollable);
    }

    const isViewerFullscreen = get(viewerFullscreenAtom);
    const isFullscreenPreferred = get(isFullscreenPreferredAtom);
    const isImmersive = get(isViewerImmersiveAtom);
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
      if (isUserGesturePermissionError(error)) {
        if (get(fullscreenNoticeCountAtom) >= 3) {
          return;
        }
        toast(get(i18nAtom).fullScreenRestorationGuide, { type: "info" });
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
  const isImmersive = get(isViewerImmersiveAtom);
  return isFullscreen ? "fullscreen" : isImmersive ? "window" : "normal";
});

export const setViewerOptionsAtom = atom(
  null,
  async (get, set, options: ViewerOptions) => {
    try {
      const { source } = options;
      const previousOptions = get(viewerStateAtom).options;
      set(viewerStateAtom, (state) => ({ ...state, options }));
      if (!source || source === previousOptions.source) {
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
    if (page.state.status !== "complete") {
      set(page.reloadAtom);
    }
  }
});

export const toggleImmersiveAtom = atom(null, async (get, set) => {
  const hasPermissionIssue = get(viewerModeAtom) === "window" &&
    get(isFullscreenPreferredAtom);
  if (hasPermissionIssue) {
    await set(viewerFullscreenAtom, true);
    return;
  }

  await set(isViewerImmersiveAtom, !get(isViewerImmersiveAtom));
});

export const toggleFullscreenAtom = atom(null, async (get, set) => {
  set(isFullscreenPreferredSettingsAtom, !get(isFullscreenPreferredSettingsAtom));

  if (get(viewerModeAtom) === "normal") {
    await set(isViewerImmersiveAtom, true);
  }
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
