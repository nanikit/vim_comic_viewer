import { atom } from "../../deps.ts";
import { beforeRepaintAtom } from "../../modules/use_before_repaint.ts";
import {
  getCurrentMiddleFromScrollElement,
  getNextScroll,
  getPageScroll,
  getPreviousScroll,
  getScrollPage,
  getUrlMedia,
  isMiddleScrollSame,
  isVisible,
  needsScrollRestoration,
  viewerScrollToWindow,
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

const lastScrollTransferMiddleAtom = atom(0.5);

export const transferWindowScrollToViewerAtom = atom(null, (get, set) => {
  const scrollable = get(scrollElementAtom);
  const lastScrollTransferMiddle = get(lastScrollTransferMiddleAtom);
  if (!scrollable) {
    return;
  }

  const viewerMedia = [
    ...scrollable.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img[src], video[src]"),
  ];

  const urlToViewerPages = new Map<string, HTMLElement>();
  for (const media of viewerMedia) {
    urlToViewerPages.set(media.src, media);
  }

  const urls = [...urlToViewerPages.keys()];
  const media = getUrlMedia(urls);
  const siteMedia = media.filter((medium) => !viewerMedia.includes(medium));
  const visibleMedia = siteMedia.filter(isVisible);
  const middle = getPageScroll(visibleMedia, visualViewport?.height ?? innerHeight);
  if (!middle || isMiddleScrollSame(middle, lastScrollTransferMiddle)) {
    return;
  }

  const pageRatio = middle - Math.floor(middle);
  const snappedRatio = Math.abs(pageRatio - 0.5) < 0.1 ? 0.5 : pageRatio;
  const snappedMiddle = Math.floor(middle) + snappedRatio;

  set(pageScrollMiddleAtom, snappedMiddle);
  set(lastScrollTransferMiddleAtom, snappedMiddle);
});

export const transferViewerScrollToWindowAtom = atom(null, (get, set) => {
  const middle = get(pageScrollMiddleAtom);
  const scrollElement = get(scrollElementAtom);
  const lastScrollTransferMiddle = get(lastScrollTransferMiddleAtom);

  const top = viewerScrollToWindow({ middle, scrollElement, lastScrollTransferMiddle });
  if (top !== undefined) {
    set(lastScrollTransferMiddleAtom, middle);
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

  const middle = getCurrentMiddleFromScrollElement(scrollElement);
  if (middle) {
    set(pageScrollMiddleAtom, middle);
  }

  set(transferViewerScrollToWindowAtom);
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
  const previousScrollTop = scrollable.scrollTop;
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
