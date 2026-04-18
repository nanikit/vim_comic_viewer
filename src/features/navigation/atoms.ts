import { pageAtomsAtom } from "../../atoms/create_page_atom.ts";
import { beginNavigationTraceAtom, recordDebugEventAtom } from "../../atoms/logger_atom.ts";
import type { DebugPageRect, NavigationDebugInput } from "../../atoms/debug_log.ts";
import { viewerOptionsAtom } from "../../atoms/viewer_base_atoms.ts";
import { atom, type Getter, RESET } from "../../deps.ts";
import { beforeRepaintAtom } from "../../modules/use_before_repaint.ts";
import { singlePageCountStorageAtom } from "../preferences/atoms.ts";
import {
  getAbovePageIndex,
  getCurrentMiddleFromScrollElement,
  getNewSizeIfResized,
  getPagesFromScrollElement,
  getYDifferenceFromPrevious,
  goToNextArea,
  goToPreviousArea,
  toWindowScroll,
} from "./helpers/others.ts";
import { toViewerScroll } from "./helpers/to_viewer_scroll.ts";

export const scrollElementStateAtom = atom<
  {
    div: HTMLDivElement;
    resizeObserver: ResizeObserver;
  } | null
>(null);
export const scrollElementAtom = atom((get) => get(scrollElementStateAtom)?.div ?? null);

export const scrollElementSizeAtom = atom({ width: 0, height: 0, scrollHeight: 0 });
export const pageScrollMiddleAtom = atom(0.5);

export const lastViewerToWindowMiddleAtom = atom(-1);
/**
 * 'notFound' means the same image is not found in the DOM.
 * 'reset' means the setOptions is called.
 */
export const lastWindowToViewerMiddleAtom = atom<number | "notFound" | "reset">("reset");

export const transferWindowScrollToViewerAtom = atom(null, (get, set) => {
  const scrollable = get(scrollElementAtom);
  const lastWindowToViewerMiddle = get(lastWindowToViewerMiddleAtom);
  const noSyncScroll = get(viewerOptionsAtom).noSyncScroll ?? false;
  const mediaElements = get(pageAtomsAtom).map((atom) => get(atom).sourceElement).filter((x) =>
    x !== null
  );

  const middle = toViewerScroll({
    scrollable,
    lastWindowToViewerMiddle,
    noSyncScroll,
    mediaElements,
  });
  set(lastWindowToViewerMiddleAtom, middle ?? "notFound");
  if (typeof middle === "number") {
    set(pageScrollMiddleAtom, middle);
    set(recordDebugEventAtom, {
      event: "navigation:window-to-viewer-sync",
      middle,
      scrollTop: scrollable?.scrollTop ?? 0,
      snapshot: getNavigationSnapshot(get),
    });
  } else {
    set(recordDebugEventAtom, {
      event: "navigation:window-to-viewer-sync-skipped",
      lastWindowToViewerMiddle,
      snapshot: getNavigationSnapshot(get),
    });
  }
});

export const transferViewerScrollToWindowAtom = atom(
  null,
  (get, set, { forFullscreen }: { forFullscreen?: boolean } = {}) => {
    const middle = get(pageScrollMiddleAtom);
    const scrollElement = get(scrollElementAtom);
    const lastMiddle = get(lastViewerToWindowMiddleAtom);
    const noSyncScroll = get(viewerOptionsAtom).noSyncScroll ?? false;

    const top = toWindowScroll({ middle, lastMiddle, scrollElement, noSyncScroll, forFullscreen });
    if (top !== undefined) {
      set(lastViewerToWindowMiddleAtom, middle);
      set(recordDebugEventAtom, {
        event: "navigation:viewer-to-window-sync",
        middle,
        top,
        forFullscreen: !!forFullscreen,
        snapshot: getNavigationSnapshot(get),
      });
      scroll({ behavior: "instant", top });
    }
  },
);

export const synchronizeScrollAtom = atom(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);
  if (!scrollElement) {
    return;
  }

  if (set(correctScrollAtom)) {
    return;
  }

  const middle = getCurrentMiddleFromScrollElement({
    scrollElement,
    previousMiddle: get(pageScrollMiddleAtom),
  });
  if (middle) {
    set(pageScrollMiddleAtom, middle);
    set(recordDebugEventAtom, {
      event: "navigation:scroll-sync",
      middle,
      scrollTop: scrollElement.scrollTop,
      snapshot: getNavigationSnapshot(get),
    });
    set(transferViewerScrollToWindowAtom);
  } else {
    set(recordDebugEventAtom, {
      event: "navigation:scroll-sync-skipped",
      scrollTop: scrollElement.scrollTop,
      snapshot: getNavigationSnapshot(get),
    });
  }
});

export const correctScrollAtom = atom(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);
  const previousSize = get(scrollElementSizeAtom);

  const newSize = getNewSizeIfResized({ scrollElement, previousSize });
  if (!newSize) {
    set(recordDebugEventAtom, {
      event: "navigation:resize-skipped",
      snapshot: getNavigationSnapshot(get),
    });
    return false;
  }

  set(scrollElementSizeAtom, newSize);
  set(recordDebugEventAtom, {
    event: "navigation:resize",
    size: newSize,
    snapshot: getNavigationSnapshot(get),
  });
  set(restoreScrollAtom);
  return true;
});

export const restoreScrollAtom = atom(null, (_get, set) => {
  const isRestored = set(restoreScrollWithLogAtom);

  if (isRestored) {
    // It handles shouldBeOriginalSize change.
    set(beforeRepaintAtom, { task: () => set(correctScrollAtom) });
  }
});

export const goNextAtom = atom(
  null,
  (get, set, input: NavigationDebugInput = { source: "api", action: "nextPage" }) => {
    set(beginNavigationTraceAtom, {
      source: input.source,
      input,
      before: getNavigationSnapshot(get),
    });
    const decision = goToNextArea(get(scrollElementAtom));
    set(recordDebugEventAtom, {
      event: "navigation:decision",
      decision,
      after: getNavigationSnapshot(get),
    });
    set(recordDebugEventAtom, { event: "navigation:end" });
  },
);

export const goPreviousAtom = atom(
  null,
  (get, set, input: NavigationDebugInput = { source: "api", action: "previousPage" }) => {
    set(beginNavigationTraceAtom, {
      source: input.source,
      input,
      before: getNavigationSnapshot(get),
    });
    const decision = goToPreviousArea(get(scrollElementAtom));
    set(recordDebugEventAtom, {
      event: "navigation:decision",
      decision,
      after: getNavigationSnapshot(get),
    });
    set(recordDebugEventAtom, { event: "navigation:end" });
  },
);

export const navigateAtom = atom(null, (get, set, event: React.MouseEvent) => {
  const scrollElement = get(scrollElementAtom);
  const viewerHeight = scrollElement?.clientHeight;
  if (!viewerHeight || event.button !== 0) {
    return;
  }

  event.preventDefault();
  const isTop = event.clientY < viewerHeight / 2;
  const input = {
    source: "click",
    action: isTop ? "previousPage" : "nextPage",
    clientY: event.clientY,
    viewerHeight,
    isTop,
  } satisfies NavigationDebugInput;
  if (isTop) {
    set(goPreviousAtom, input);
  } else {
    set(goNextAtom, input);
  }
});

export const singlePageCountAtom = atom(
  (get) => get(singlePageCountStorageAtom),
  async (get, set, value: number | typeof RESET) => {
    const clampedValue = typeof value === "number" ? Math.max(0, value) : value;
    const middle = get(pageScrollMiddleAtom);

    await set(singlePageCountStorageAtom, clampedValue);

    set(beforeRepaintAtom, {
      task: () => {
        // If separated page fill the last row, resize event won't fire.
        // If mutation is above of the current page, scroll event is fired.
        // So, restore scroll position.
        set(restoreScrollWithLogAtom);
        // synchronizeScroll can't preserve index among multiple pages of row. So restore.
        set(pageScrollMiddleAtom, middle);
      },
    });
  },
);

export const anchorSinglePageCountAtom = atom(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);

  const abovePageIndex = getAbovePageIndex(scrollElement);

  if (abovePageIndex !== undefined) {
    set(singlePageCountAtom, abovePageIndex);
  }
});

const restoreScrollWithLogAtom = atom(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);
  const middle = get(pageScrollMiddleAtom);
  const yDifference = getYDifferenceFromPrevious({ scrollable: scrollElement, middle });

  if (yDifference != null && scrollElement) {
    const scrollTopBefore = scrollElement.scrollTop;
    scrollElement.scrollBy({ top: yDifference });
    set(recordDebugEventAtom, {
      event: "navigation:restore",
      yDiff: yDifference,
      scrollTopBefore,
      scrollTopAfter: scrollElement.scrollTop,
      snapshot: getNavigationSnapshot(get),
    });
    return true;
  }

  set(recordDebugEventAtom, {
    event: "navigation:restore-skipped",
    middle,
    scrollTop: scrollElement?.scrollTop,
    snapshot: getNavigationSnapshot(get),
  });
  return false;
});

function getNavigationSnapshot(get: Getter) {
  const scrollElement = get(scrollElementAtom);
  const viewer = get(scrollElementSizeAtom);
  const middle = get(pageScrollMiddleAtom);
  return {
    scrollTop: scrollElement?.scrollTop ?? 0,
    viewer,
    middle,
    pageRects: getPageRects(scrollElement),
  };
}

function getPageRects(scrollElement: HTMLElement | null): DebugPageRect[] | undefined {
  const pages = getPagesFromScrollElement(scrollElement);
  if (!pages) {
    return;
  }

  return [...pages].map((page, index) => {
    const { top, bottom, height } = page.getBoundingClientRect();
    return { index, top, bottom, height };
  });
}
