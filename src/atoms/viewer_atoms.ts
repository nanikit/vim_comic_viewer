import { atom, ExtractAtomValue, Getter, Root, Setter, toast } from "../deps.ts";
import {
  fullscreenNoticeCountAtom,
  isFullscreenPreferredAtom,
  wasImmersiveAtom,
} from "../features/preferences/atoms.ts";
import { timeout } from "../utils.ts";
import { PageAtom, pageAtomsAtom, refreshMediaSourceAtom } from "./create_page_atom.ts";
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
  scrollElementAtom,
  transferViewerScrollToWindowAtom,
} from "./navigation_atoms.ts";
import {
  type ViewerOptions,
  viewerOptionsAtom,
  viewerStateAtom,
  viewerStatusAtom,
} from "./viewer_base_atoms.ts";

export const rootAtom = atom<Root | null>(null);

const transferWindowScrollToViewerAtom = atom(null, (get, set) => {
  type Page = ExtractAtomValue<PageAtom>;

  const pages = get(pageAtomsAtom).map(get);
  if (!pages.length) {
    return;
  }

  const urlToViewerPages = new Map<string, Page>();
  for (const page of pages) {
    if (page.state.source?.src) {
      urlToViewerPages.set(page.state.source.src, page);
    }
  }

  const urls = [...urlToViewerPages.keys()];
  const imgs = getUrlImgs(urls);
  const viewerImgs = new Set(pages.flatMap((page) => page.div?.querySelector("img") ?? []));
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
    set(fullscreenNoticeCountAtom, (count) => (count ?? 0) + 1);
  }
}

const isBeforeUnloadAtom = atom(false);
const beforeUnloadAtom = atom(null, async (_get, set) => {
  set(isBeforeUnloadAtom, true);
  await waitUnloadFinishRoughly();
  set(isBeforeUnloadAtom, false);
});
beforeUnloadAtom.onMount = (set) => {
  addEventListener("beforeunload", set);
  return () => removeEventListener("beforeunload", set);
};

export const fullscreenSynchronizationAtom = atom(
  (get) => {
    get(isBeforeUnloadAtom);
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
    const previousOptions = get(viewerOptionsAtom);
    const shouldLoadSource = source && source !== previousOptions.source;
    if (!shouldLoadSource) {
      return;
    }

    set(viewerStatusAtom, (previous) => previous === "complete" ? "complete" : "loading");
    set(viewerOptionsAtom, options);

    await set(refreshMediaSourceAtom, { cause: "load" });

    set(viewerStatusAtom, "complete");
  } catch (error) {
    set(viewerStatusAtom, "error");
    throw error;
  }
});

export const reloadErroredAtom = atom(null, (get, set) => {
  stop();

  for (const page of get(pageAtomsAtom).map(get)) {
    if (page.state.status !== "complete") {
      set(page.reloadAtom, "load");
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

/** There is no cancelunload event. Wait for 500ms including debugger pause. */
async function waitUnloadFinishRoughly() {
  for (let i = 0; i < 5; i++) {
    await timeout(100);
  }
}
