import { atom, ExtractAtomValue, Getter, Root, Setter } from "../deps.ts";
import {
  pageScrollStateAtom,
  scrollElementAtom,
  transferViewerScrollToWindowAtom,
} from "../features/navigation/atoms.ts";
import { getPageScroll } from "../features/navigation/helpers.ts";
import {
  fullscreenNoticeCountPromiseAtom,
  isFullscreenPreferredAtom,
} from "../features/preferences/atoms.ts";
import { i18nAtom } from "../modules/i18n/atoms.ts";
import { toast } from "../modules/toast.ts";
import { timeout } from "../utils.ts";
import { PageAtom, pageAtomsAtom, refreshMediaSourceAtom } from "./create_page_atom.ts";
import { focusWithoutScroll, getUrlImgs, isUserGesturePermissionError } from "./dom/dom_helpers.ts";
import {
  isFullscreenPreferredSettingsAtom,
  isViewerImmersiveAtom,
  scrollBarStyleFactorAtom,
  transitionLockAtom,
  viewerFullscreenAtom,
} from "./fullscreen_atom.ts";
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

  const ratio = getPageScroll(originalImgs);
  if (!ratio) {
    return;
  }

  const viewerPage = urlToViewerPages.get(originalImgs[Math.floor(ratio)]?.src ?? "");
  if (!viewerPage) {
    return;
  }

  const pageRatio = ratio - Math.floor(ratio);
  const snappedRatio = Math.abs(pageRatio - 0.5) < 0.1 ? 0.5 : pageRatio;
  set(pageScrollStateAtom, {
    page: viewerPage.div,
    ratio: snappedRatio,
    middle: ratio,
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
    const noticeCount = (await get(fullscreenNoticeCountPromiseAtom)) ?? 0;
    if (shouldShowF11Guide({ error, noticeCount })) {
      showF11Guide();
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

  function showF11Guide() {
    toast(get(i18nAtom).fullScreenRestorationGuide, {
      type: "info",
      onClose: () => {
        set(fullscreenNoticeCountPromiseAtom, (count) => (count ?? 0) + 1);
      },
    });
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

export const setViewerElementAtom = atom(null, (_get, set, element: HTMLDivElement | null) => {
  set(scrollBarStyleFactorAtom, { viewerElement: element });
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

function shouldShowF11Guide({ error, noticeCount }: { error: unknown; noticeCount: number }) {
  const isUserFullscreen = innerHeight === screen.height || innerWidth === screen.width;
  return isUserGesturePermissionError(error) && noticeCount < 3 && !isUserFullscreen;
}
