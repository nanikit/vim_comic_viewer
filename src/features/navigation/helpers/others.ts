import type { Size } from "../../../helpers/size.ts";
import {
  getCurrentRow,
  getInPageRatio,
  hasNoticeableDifference,
  isVisible,
  type VisibleRect,
} from "./common.ts";

type ScrollSize = Size & {
  scrollHeight: number;
};

export function getScrollPage(middle: number, container: HTMLElement | null) {
  const element = getPagesFromScrollElement(container)?.item(Math.floor(middle));
  return element instanceof HTMLElement ? element : null;
}

export function getCurrentMiddleFromScrollElement({
  scrollElement,
  previousMiddle,
}: {
  scrollElement: HTMLElement | null;
  previousMiddle: number;
}) {
  const elements = getPagesFromScrollElement(scrollElement);
  if (!elements || !scrollElement) {
    return null;
  }

  return getPageScroll({
    elements: [...elements] as HTMLElement[],
    viewportHeight: scrollElement.getBoundingClientRect().height,
    previousMiddle,
  });
}

export function getNewSizeIfResized({ scrollElement, previousSize }: {
  scrollElement: HTMLDivElement | null;
  previousSize: ScrollSize;
}) {
  if (!scrollElement) {
    return;
  }

  const { width, height } = scrollElement.getBoundingClientRect();
  const scrollHeight = scrollElement.scrollHeight;
  const { width: previousWidth, height: previousHeight, scrollHeight: previousScrollHeight } =
    previousSize;

  const needsScrollRestoration = previousWidth === 0 || previousHeight === 0 ||
    previousWidth !== width || previousHeight !== height ||
    previousScrollHeight !== scrollHeight;

  return needsScrollRestoration ? { width, height, scrollHeight } : undefined;
}

export function navigateByPointer(scrollElement: HTMLDivElement | null, event: React.MouseEvent) {
  const height = scrollElement?.clientHeight;
  if (!height || event.button !== 0) {
    return;
  }

  event.preventDefault();

  const isTop = event.clientY < height / 2;
  if (isTop) {
    goToPreviousArea(scrollElement);
  } else {
    goToNextArea(scrollElement);
  }
}

/** Returns difference of scrollTop to make the target section visible. */
export function goToPreviousArea(scrollElement: HTMLDivElement | null) {
  const page = getCurrentPageFromScrollElement({ scrollElement, previousMiddle: Infinity });
  if (!page || !scrollElement) {
    return;
  }

  const viewerHeight = scrollElement.clientHeight;
  const ignorableHeight = viewerHeight * 0.05;
  // HACK: scrollTop has fractional px on HiDPI, -1 is monkey patching for it.
  const remainingHeight = scrollElement.scrollTop - Math.ceil(page.offsetTop) - 1;

  // Use scrollBy because scrollTop precision is not enough on HiDPI.
  scrollElement.scrollBy({ top: getPreviousYDiff(page) });

  function getPreviousYDiff(page: HTMLElement) {
    if (remainingHeight > ignorableHeight) {
      const divisor = Math.ceil(remainingHeight / viewerHeight);
      return -Math.ceil(remainingHeight / divisor);
    } else {
      return getPreviousPageBottomOrStart(page);
    }
  }
}

export function goToNextArea(scrollElement: HTMLDivElement | null) {
  const page = getCurrentPageFromScrollElement({ scrollElement, previousMiddle: 0 });
  if (!page || !scrollElement) {
    return;
  }

  const viewerHeight = scrollElement.clientHeight;
  const ignorableHeight = viewerHeight * 0.05;
  const scrollBottom = scrollElement.scrollTop + viewerHeight;
  // HACK: scrollTop has fractional px on HiDPI, -1 is monkey patching for it.
  const remainingHeight = page.offsetTop + page.clientHeight - Math.ceil(scrollBottom) - 1;

  // Use scrollBy because scrollTop precision is not enough on HiDPI.
  scrollElement.scrollBy({ top: getNextYDiff(page) });

  function getNextYDiff(page: HTMLElement) {
    if (remainingHeight > ignorableHeight) {
      const divisor = Math.ceil(remainingHeight / viewerHeight);
      return Math.ceil(remainingHeight / divisor);
    } else {
      return getNextPageTopOrEnd(page);
    }
  }
}

export function toWindowScroll(
  { middle, lastMiddle, noSyncScroll, forFullscreen, scrollElement }: {
    middle: number;
    lastMiddle: number;
    noSyncScroll: boolean;
    forFullscreen?: boolean;
    scrollElement: HTMLDivElement | null;
  },
) {
  if (noSyncScroll || (!forFullscreen && !hasNoticeableDifference(middle, lastMiddle))) {
    return;
  }

  const page = getScrollPage(middle, scrollElement);
  const src = page?.querySelector<HTMLImageElement | HTMLVideoElement>("img[src], video[src]")?.src;
  if (!src) {
    return;
  }

  const original = findOriginElement(src, page);
  if (!original) {
    return;
  }

  const rect = original.getBoundingClientRect();
  const ratio = middle - Math.floor(middle);
  const top = scrollY + rect.y + rect.height * ratio - innerHeight / 2;

  return top;
}

export function getYDifferenceFromPrevious({ scrollable, middle }: {
  scrollable: HTMLDivElement | null;
  middle: number;
}) {
  const page = getScrollPage(middle, scrollable);
  if (!page || !scrollable || scrollable.clientHeight < 1) {
    return;
  }

  const { height: scrollableHeight } = scrollable.getBoundingClientRect();
  const { y: pageY, height: pageHeight } = page.getBoundingClientRect();
  const ratio = middle - Math.floor(middle);
  const restoredYDiff = pageY + pageHeight * ratio - scrollableHeight / 2;
  return restoredYDiff;
}

export function getAbovePageIndex(scrollElement: HTMLDivElement | null) {
  const children = getPagesFromScrollElement(scrollElement);
  if (!children || !scrollElement) {
    return;
  }

  const elements = [...children] as HTMLElement[];
  const currentRow = getCurrentRow({ elements, viewportHeight: scrollElement.clientHeight });

  const firstPage = currentRow?.[0]?.page;
  return firstPage ? elements.indexOf(firstPage as HTMLElement) : undefined;
}

function findOriginElement(src: string, page: HTMLElement) {
  const fileName = src.split("/").pop()?.split("?")[0];
  const candidates = document.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
    `img[src*="${fileName}"], video[src*="${fileName}"]`,
  );
  const originals = [...candidates].filter((media) =>
    media.src === src && media.parentElement !== page && isVisible(media)
  );
  if (originals.length === 1) {
    return originals[0];
  }

  const links = document.querySelectorAll<HTMLAnchorElement>(`a[href*="${fileName}"`);
  const visibleLinks = [...links].filter(isVisible);
  if (visibleLinks.length === 1) {
    return visibleLinks[0];
  }
}

function getNextPageTopOrEnd(page: HTMLElement) {
  const scrollable = page.offsetParent;
  if (!scrollable) {
    return;
  }

  const pageBottom = page.offsetTop + page.clientHeight;
  let cursor = page as HTMLElement;
  while (cursor.nextElementSibling) {
    const next = cursor.nextElementSibling as HTMLElement;
    if (pageBottom <= next.offsetTop) {
      return next.getBoundingClientRect().top;
    }
    cursor = next;
  }

  const { y, height } = cursor.getBoundingClientRect();
  return y + height;
}

function getPreviousPageBottomOrStart(page: HTMLElement) {
  const scrollable = page.offsetParent;
  if (!scrollable) {
    return;
  }

  const pageTop = page.offsetTop;
  let cursor = page as HTMLElement;
  while (cursor.previousElementSibling) {
    const previous = cursor.previousElementSibling as HTMLElement;
    const previousBottom = previous.offsetTop + previous.clientHeight;
    if (previousBottom <= pageTop) {
      const { bottom } = previous.getBoundingClientRect();
      const { height } = scrollable.getBoundingClientRect();
      return bottom - height;
    }
    cursor = previous;
  }

  const { y, height } = cursor.getBoundingClientRect();
  return y - height;
}

function getCurrentPageFromScrollElement(
  { scrollElement, previousMiddle }: { scrollElement: HTMLElement | null; previousMiddle: number },
) {
  const middle = getCurrentMiddleFromScrollElement({ scrollElement, previousMiddle });
  if (!middle || !scrollElement) {
    return null;
  }

  return getScrollPage(middle, scrollElement);
}

function getPageScroll(
  params: {
    elements: HTMLElement[];
    viewportHeight: number;
    previousMiddle: number;
  },
): number | undefined {
  const currentPage = getCurrentPageFromElements(params);
  return currentPage ? getMiddle(currentPage) : undefined;

  function getMiddle(page: VisibleRect) {
    const { viewportHeight, elements } = params;
    const ratio = getInPageRatio({ page, viewportHeight });
    return elements.indexOf(page.page) + ratio;
  }
}

function getCurrentPageFromElements(
  { elements, viewportHeight, previousMiddle }: {
    elements: HTMLElement[];
    viewportHeight: number;
    previousMiddle: number;
  },
): VisibleRect | undefined {
  const currentRow = getCurrentRow({ elements, viewportHeight });
  if (!currentRow) {
    return;
  }

  return selectColumn(currentRow);

  function selectColumn(row: VisibleRect[]) {
    const firstPage = row.find(({ page }) => page === elements[0]);
    if (firstPage) {
      return firstPage;
    }

    const lastPage = row.find(({ page }) => page === elements.at(-1));
    if (lastPage) {
      return lastPage;
    }

    const half = Math.floor(row.length / 2);
    if (row.length % 2 === 1) {
      return row[half];
    }

    const page = row[half]?.page;
    if (!page) {
      return;
    }

    const centerNextTop = elements.indexOf(page);
    // Previous middle must be odd row page count, so preserve it.
    const previousMiddlePage = previousMiddle < centerNextTop ? row[half - 1] : row[half];
    return previousMiddlePage;
  }
}

function getPagesFromScrollElement(scrollElement: HTMLElement | null) {
  return scrollElement?.firstElementChild?.children;
}
