import { viewerOptionsAtom } from "../../atoms/viewer_base_atoms.ts";
import { atom, RESET } from "../../deps.ts";
import { beforeRepaintAtom } from "../../modules/use_before_repaint.ts";
import { singlePageCountStorageAtom } from "../preferences/atoms.ts";
import {
  getAbovePageIndex,
  getCurrentMiddleFromScrollElement,
  getNewSizeIfResized,
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
    return;
  }

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
      set(lastViewerToWindowMiddleAtom, middle);
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
  // It handles shouldBeOriginalSize change.
  return true;
});

export const restoreScrollAtom = atom(null, (get, set) => {
  const middle = get(pageScrollMiddleAtom);
  const scrollable = get(scrollElementAtom);

  const restored = getYDifferenceFromPrevious({ scrollable, middle });

  if (restored != null) {
    scrollable?.scrollBy({ top: restored });
    set(beforeRepaintAtom, { task: () => set(correctScrollAtom) });
  }
});

export const goNextAtom = atom(null, (get) => {
  goToNextArea(get(scrollElementAtom));
});

export const goPreviousAtom = atom(null, (get) => {
  goToPreviousArea(get(scrollElementAtom));
});

export const navigateAtom = atom(null, (get, _set, event: React.MouseEvent) => {
  navigateByPointer(get(scrollElementAtom), event);
});

export const singlePageCountAtom = atom(
  (get) => get(singlePageCountStorageAtom),
  async (get, set, value: number | typeof RESET) => {
    const clampedValue = typeof value === "number" ? Math.max(0, value) : value;
    const middle = get(pageScrollMiddleAtom);
    const scrollElement = get(scrollElementAtom);

    await set(singlePageCountStorageAtom, clampedValue);

    set(beforeRepaintAtom, {
      task: () => {
        // If separated page fill the last row, resize event won't fire.
        // If mutation is above of the current page, scroll event is fired.
        // So, restore scroll position.
        const yDifference = getYDifferenceFromPrevious({ scrollable: scrollElement, middle });
        if (yDifference != null) {
          scrollElement?.scrollBy({ top: yDifference });
        }
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
