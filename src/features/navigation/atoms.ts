import { atom } from "../../deps.ts";
import { beforeRepaintAtom } from "../../modules/use_before_repaint.ts";
import {
  getCurrentMiddleFromScrollElement,
  getNextScroll,
  getPreviousScroll,
  getScrollPage,
  needsScrollRestoration,
  toViewerScroll,
  toWindowScroll,
} from "./helpers.ts";

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

  const middle = toViewerScroll({ scrollable, lastWindowToViewerMiddle });
  if (!middle) {
    return;
  }

  set(pageScrollMiddleAtom, middle);
  set(lastWindowToViewerMiddleAtom, middle);
});

export const transferViewerScrollToWindowAtom = atom(null, (get, set) => {
  const middle = get(pageScrollMiddleAtom);
  const scrollElement = get(scrollElementAtom);
  const lastMiddle = get(lastViewerToWindowMiddleAtom);

  const top = toWindowScroll({ middle, lastMiddle, scrollElement });
  if (top !== undefined) {
    set(lastViewerToWindowMiddleAtom, middle);
    scroll({ behavior: "instant", top });
  }
});

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
  if (!scrollElement) {
    return;
  }
  const previousSize = get(scrollElementSizeAtom);

  const rect = scrollElement.getBoundingClientRect();
  const currentSize = {
    width: rect.width,
    height: rect.height,
    scrollHeight: scrollElement.scrollHeight,
  };
  if (!needsScrollRestoration(previousSize, currentSize)) {
    return false;
  }

  set(scrollElementSizeAtom, currentSize);
  set(restoreScrollAtom);
  // It handles shouldBeOriginalSize change.
  return true;
});

export const restoreScrollAtom = atom(null, (get, set) => {
  const middle = get(pageScrollMiddleAtom);
  const scrollable = get(scrollElementAtom);
  const page = getScrollPage(middle, scrollable);
  if (!page || !scrollable || scrollable.clientHeight < 1) {
    return;
  }

  const { height: scrollableHeight } = scrollable.getBoundingClientRect();
  const { y: pageY, height: pageHeight } = page.getBoundingClientRect();
  const ratio = middle - Math.floor(middle);
  const restoredYDiff = pageY + pageHeight * ratio - scrollableHeight / 2;
  scrollable.scrollBy({ top: restoredYDiff });
  set(beforeRepaintAtom, { task: () => set(correctScrollAtom) });
});

export const goNextAtom = atom(null, (get) => {
  const diffY = getNextScroll(get(scrollElementAtom));
  if (diffY != null) {
    // Use scrollBy because scrollTop precision is not enough on HiDPI.
    get(scrollElementAtom)?.scrollBy({ top: diffY });
  }
});

export const goPreviousAtom = atom(null, (get) => {
  const diffY = getPreviousScroll(get(scrollElementAtom));
  if (diffY != null) {
    get(scrollElementAtom)?.scrollBy({ top: diffY });
  }
});

export const navigateAtom = atom(null, (get, set, event: React.MouseEvent) => {
  const height = get(scrollElementAtom)?.clientHeight;
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
