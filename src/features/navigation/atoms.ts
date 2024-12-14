import { loggerAtom } from "../../atoms/logger_atom.ts";
import { viewerOptionsAtom } from "../../atoms/viewer_base_atoms.ts";
import { atom, RESET } from "../../deps.ts";
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
  navigateByPointer,
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

const lastViewerToWindowMiddleAtom = atom(-1);
const lastWindowToViewerMiddleAtom = atom(-1);

export const transferWindowScrollToViewerAtom = atom(null, (get, set) => {
  const scrollable = get(scrollElementAtom);
  const lastWindowToViewerMiddle = get(lastWindowToViewerMiddleAtom);
  const noSyncScroll = get(viewerOptionsAtom).noSyncScroll ?? false;

  const middle = toViewerScroll({ scrollable, lastWindowToViewerMiddle, noSyncScroll });
  if (!middle) {
    set(loggerAtom, { event: "transferWindowScrollToViewer: no change", lastWindowToViewerMiddle });
    return;
  }

  set(loggerAtom, { event: "transferWindowScrollToViewer: new middle", middle });
  set(pageScrollMiddleAtom, middle);
  set(lastWindowToViewerMiddleAtom, middle);
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
      set(loggerAtom, {
        event: "transferViewerScrollToWindow",
        middle,
        innerHeight,
        top,
        pageHeight: scrollElement?.clientHeight,
      });
      set(lastViewerToWindowMiddleAtom, middle);
      scroll({ behavior: "instant", top });
    }
  },
);

export const synchronizeScrollAtom = atom(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);
  if (!scrollElement) {
    set(loggerAtom, { event: "synchronizeScroll: no scrollElement" });
    return;
  }

  set(scrollTopAtom, scrollElement.scrollTop);
  set(loggerAtom, {
    event: "scrolled",
    scrollTop: scrollElement.scrollTop,
    pageRects: get(pageRectsAtom),
  });

  const previousSize = get(scrollElementSizeAtom);
  if (set(correctScrollAtom)) {
    set(loggerAtom, {
      event: "synchronizeScroll: corrected scroll",
      previousSize,
      currentSize: get(scrollElementSizeAtom),
      scrollTop: scrollElement?.scrollTop,
    });
    return;
  }

  const middle = getCurrentMiddleFromScrollElement({
    scrollElement,
    previousMiddle: get(pageScrollMiddleAtom),
  });
  if (middle) {
    set(loggerAtom, {
      event: "synchronizeScroll: new middle",
      middle,
      scrollTop: scrollElement.scrollTop,
    });
    set(pageScrollMiddleAtom, middle);
    set(transferViewerScrollToWindowAtom);
  }
});

export const correctScrollAtom = atom(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);
  const previousSize = get(scrollElementSizeAtom);

  const newSize = getNewSizeIfResized({ scrollElement, previousSize });
  if (!newSize) {
    return false;
  }

  set(scrollElementSizeAtom, newSize);
  set(restoreScrollAtom);
  return true;
});

export const restoreScrollAtom = atom(null, (get, set) => {
  const isRestored = set(restoreScrollWithLogAtom);

  if (isRestored) {
    // It handles shouldBeOriginalSize change.
    set(beforeRepaintAtom, {
      task: () => {
        const previousSize = get(scrollElementSizeAtom);
        if (set(correctScrollAtom)) {
          set(loggerAtom, {
            event: "restoreScroll: corrected scroll after repaint",
            previousSize,
            currentSize: get(scrollElementSizeAtom),
            scrollTop: get(scrollElementAtom)?.scrollTop,
          });
        }
      },
    });
  }
});

export const goNextAtom = atom(null, (get, set) => {
  set(loggerAtom, { event: "goNext" });
  goToNextArea(get(scrollElementAtom));
});

export const goPreviousAtom = atom(null, (get, set) => {
  set(loggerAtom, { event: "goPrevious" });
  goToPreviousArea(get(scrollElementAtom));
});

export const navigateAtom = atom(null, (get, set, event: React.MouseEvent) => {
  set(loggerAtom, { event: "click" });
  navigateByPointer(get(scrollElementAtom), event);
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
    set(loggerAtom, {
      event: "restoreScroll",
      middle,
      yDifference,
      previousScrollTop: scrollElement?.scrollTop,
      scrollTop: scrollElement?.scrollTop,
    });
    scrollElement.scrollBy({ top: yDifference });
    return true;
  } else {
    set(loggerAtom, {
      event: "restoreScroll: no need",
      middle,
      scrollTop: scrollElement?.scrollTop,
    });
    return false;
  }
});

const scrollTopAtom = atom(0);
const pageRectsAtom = atom((get) => {
  get(scrollTopAtom);
  get(scrollElementSizeAtom);

  const pages = getPagesFromScrollElement(get(scrollElementAtom));
  const rects = [...(pages ?? [])].map((page) => page.getBoundingClientRect());
  return rects;
});
