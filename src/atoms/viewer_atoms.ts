import { atom, ExtractAtomValue, Getter, Root, selectAtom, Setter, toast } from "../deps.ts";
import {
  fullscreenNoticeCountAtom,
  isFullscreenPreferredAtom,
  wasImmersiveAtom,
} from "../features/preferences/atoms.ts";
import { type ComicSource } from "../helpers/comic_source.ts";
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
  isViewerImmersiveAtom,
  scrollBarStyleFactorAtom,
  transitionLockAtom,
  viewerFullscreenAtom,
} from "./fullscreen_atom.ts";
import { i18nAtom } from "./i18n_atom.ts";
import {
  pageScrollStateAtom,
  restoreScrollAtom,
  scrollElementAtom,
  transferViewerScrollToWindowAtom,
} from "./navigation_atoms.ts";

export type ViewerOptions = {
  source?: ComicSource;
  imageProps?: Record<string, string>;
  /** do not synchronize scroll position if true. */
  noSyncScroll?: boolean;
  /** do not bind predefined keyboard shortcut if true. */
  noDefaultBinding?: boolean;
};

type ViewerState =
  & { options: ViewerOptions }
  & ({
    status: "loading" | "error";
  } | {
    status: "complete";
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

const transferWindowScrollToViewerAtom = atom(null, async (get, set) => {
  const urlToViewerPages = new Map<string, ExtractAtomValue<PageAtom>>();

  let viewerPages = get(pagesAtom)?.map(get);
  if (!viewerPages || viewerPages?.some((page) => !page.imageProps.src)) {
    await timeout(1);
    viewerPages = get(pagesAtom)?.map(get);
    // TODO: monkey patch. Change to synchronous way.
    (async () => {
      await timeout(1);
      set(restoreScrollAtom);
    })();
  }
  if (!viewerPages || !viewerPages.length) {
    return;
  }
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

const externalFocusElementAtom = atom<Element | null>(null);
export const setViewerImmersiveAtom = atom(null, async (get, set, value: boolean) => {
  const lock = await set(transitionLockAtom);
  try {
    await transactImmersive(get, set, value);
  } finally {
    lock.deferred.resolve();
  }
});

async function transactImmersive(get: Getter, set: Setter, value: boolean) {
  if (get(isViewerImmersiveAtom) === value) {
    return;
  }

  if (value) {
    set(externalFocusElementAtom, (previous) => previous ? previous : document.activeElement);
    if (!get(viewerStateAtom).options.noSyncScroll) {
      set(transferWindowScrollToViewerAtom);
    }
  }

  const scrollable = get(scrollElementAtom);
  if (!scrollable) {
    return;
  }

  try {
    if (get(isFullscreenPreferredAtom)) {
      await set(viewerFullscreenAtom, value);
    }
  } catch (error) {
    if (isUserGesturePermissionError(error)) {
      showF11GuideGently();
      return;
    }
    throw error;
  } finally {
    set(scrollBarStyleFactorAtom, { isImmersive: value });

    if (value) {
      focusWithoutScroll(scrollable);
    } else {
      if (!get(viewerStateAtom).options.noSyncScroll) {
        set(transferViewerScrollToWindowAtom);
      }
      const externalFocusElement = get(externalFocusElementAtom) as HTMLElement;
      focusWithoutScroll(externalFocusElement);
    }
  }

  async function showF11GuideGently() {
    if (get(fullscreenNoticeCountAtom) >= 3) {
      return;
    }

    const isUserFullscreen = innerHeight === screen.height || innerWidth === screen.width;
    if (isUserFullscreen) {
      return;
    }

    toast(get(i18nAtom).fullScreenRestorationGuide, { type: "info" });
    await timeout(5000);
    set(fullscreenNoticeCountAtom, (count) => count + 1);
  }
}

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

export const setViewerElementAtom = atom(null, async (get, set, element: HTMLDivElement | null) => {
  set(scrollBarStyleFactorAtom, { viewerElement: element });
  await set(setViewerImmersiveAtom, get(wasImmersiveAtom));
});

export const viewerModeAtom = atom((get) => {
  const isFullscreen = get(viewerFullscreenAtom);
  const isImmersive = get(isViewerImmersiveAtom);
  return isFullscreen ? "fullscreen" : isImmersive ? "window" : "normal";
});

export const setViewerOptionsAtom = atom(null, async (get, set, options: ViewerOptions) => {
  try {
    const { source } = options;
    const previousOptions = get(viewerStateAtom).options;
    set(viewerStateAtom, (state) => ({ ...state, options }));
    if (!source || source === previousOptions.source) {
      return;
    }

    set(viewerStateAtom, (state) => ({ ...state, status: "loading" }));
    const images = await source({ cause: "load" });

    if (!Array.isArray(images)) {
      throw new Error(`Invalid comic source type: ${typeof images}`);
    }

    set(viewerStateAtom, (state) => ({
      ...state,
      status: "complete",
      pages: images.map((source, index) => createPageAtom({ source, index })),
    }));
  } catch (error) {
    set(viewerStateAtom, (state) => ({ ...state, status: "error" }));
    console.error(error);
    throw error;
  }
});

export const reloadErroredAtom = atom(null, (get, set) => {
  stop();

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

  await set(setViewerImmersiveAtom, !get(isViewerImmersiveAtom));
});

export const toggleFullscreenAtom = atom(null, async (get, set) => {
  set(isFullscreenPreferredSettingsAtom, !get(isFullscreenPreferredSettingsAtom));

  if (get(viewerModeAtom) === "normal") {
    await set(setViewerImmersiveAtom, true);
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
