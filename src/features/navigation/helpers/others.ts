import type { Size } from "../../../helpers/size.ts";
import type { NavigationDebugDecision } from "../../../atoms/debug_log.ts";
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
  const context = getAreaNavigationContext({
    direction: "previous",
    scrollElement,
    previousMiddle: Infinity,
  });
  const { decision, page, elements } = context;
  if (!page || !scrollElement) {
    return decision;
  }

  const { height: viewerHeight, top: viewerTop } = scrollElement.getBoundingClientRect();
  const ignorableHeight = viewerHeight * 0.05;
  const { top: pageTop, bottom: pageBottom } = page.getBoundingClientRect();
  const remainingHeight = viewerTop - pageTop;
  const needsPartialScroll = remainingHeight > ignorableHeight;

  if (needsPartialScroll) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    const yDiff = -Math.ceil(remainingHeight / divisor);
    // Use scrollBy because scrollTop precision is not enough on HiDPI.
    scrollElement.scrollBy({ top: yDiff });
    return {
      ...decision,
      remainingHeight,
      ignorableHeight,
      needsPartialScroll,
      viewerTop,
      viewerBottom: viewerTop + viewerHeight,
      pageTop,
      pageBottom,
      operation: "scrollBy",
      yDiff,
      scrollTopAfter: scrollElement.scrollTop,
    } satisfies NavigationDebugDecision;
  } else {
    const targetPageIndex = goToPreviousRow(page, elements);
    return {
      ...decision,
      remainingHeight,
      ignorableHeight,
      needsPartialScroll,
      viewerTop,
      viewerBottom: viewerTop + viewerHeight,
      pageTop,
      pageBottom,
      operation: "scrollIntoView",
      block: targetPageIndex === 0 ? "start" : "end",
      targetPageIndex,
      scrollTopAfter: scrollElement.scrollTop,
    } satisfies NavigationDebugDecision;
  }
}

export function goToNextArea(scrollElement: HTMLDivElement | null) {
  const context = getAreaNavigationContext({
    direction: "next",
    scrollElement,
    previousMiddle: 0,
  });
  const { decision, page, elements } = context;
  if (!page || !scrollElement) {
    return decision;
  }

  const { height: viewerHeight, bottom: viewerBottom } = scrollElement.getBoundingClientRect();
  const ignorableHeight = viewerHeight * 0.05;
  const { top: pageTop, bottom: pageBottom } = page.getBoundingClientRect();
  const remainingHeight = pageBottom - viewerBottom;
  const needsPartialScroll = remainingHeight > ignorableHeight;

  if (needsPartialScroll) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    const yDiff = Math.ceil(remainingHeight / divisor);
    scrollElement.scrollBy({ top: yDiff });
    return {
      ...decision,
      remainingHeight,
      ignorableHeight,
      needsPartialScroll,
      viewerTop: viewerBottom - viewerHeight,
      viewerBottom,
      pageTop,
      pageBottom,
      operation: "scrollBy",
      yDiff,
      scrollTopAfter: scrollElement.scrollTop,
    } satisfies NavigationDebugDecision;
  } else {
    const targetPageIndex = goToNextRow(page, elements);
    return {
      ...decision,
      remainingHeight,
      ignorableHeight,
      needsPartialScroll,
      viewerTop: viewerBottom - viewerHeight,
      viewerBottom,
      pageTop,
      pageBottom,
      operation: "scrollIntoView",
      block: targetPageIndex === elements.length - 1 ? "end" : "start",
      targetPageIndex,
      scrollTopAfter: scrollElement.scrollTop,
    } satisfies NavigationDebugDecision;
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

export function getPagesFromScrollElement(scrollElement: HTMLElement | null) {
  return scrollElement?.firstElementChild?.children;
}

function goToNextRow(currentPage: HTMLElement, elements: HTMLElement[]) {
  // https://greasyfork.org/ko/scripts/418090/discussions/291840
  // Environment: Firefox, Nvidia headed, devicePixelRatio = 1.25, innerHeight = 909
  // Flex-box row could be overlapped by 0.00001px, so adjust with epsilon.
  const epsilon = 0.01;
  const currentPageBottom = currentPage.getBoundingClientRect().bottom - epsilon;

  let page = currentPage as HTMLElement;
  while (page.nextElementSibling) {
    page = page.nextElementSibling as HTMLElement;

    const pageTop = page.getBoundingClientRect().top;
    const isNextPage = currentPageBottom <= pageTop;
    if (isNextPage) {
      page.scrollIntoView({ behavior: "instant", block: "start" });
      return elements.indexOf(page);
    }
  }

  // it is the last page, scroll to end
  page.scrollIntoView({ behavior: "instant", block: "end" });
  return elements.indexOf(page);
}

function goToPreviousRow(currentPage: HTMLElement, elements: HTMLElement[]) {
  const epsilon = 0.01;
  const currentPageTop = currentPage.getBoundingClientRect().top + epsilon;

  let page = currentPage as HTMLElement;
  while (page.previousElementSibling) {
    page = page.previousElementSibling as HTMLElement;

    const pageBottom = page.getBoundingClientRect().bottom;
    const isPreviousPage = pageBottom <= currentPageTop;
    if (isPreviousPage) {
      page.scrollIntoView({ behavior: "instant", block: "end" });
      return elements.indexOf(page);
    }
  }

  // it is the first page, scroll to start
  page.scrollIntoView({ behavior: "instant", block: "start" });
  return elements.indexOf(page);
}

function getAreaNavigationContext(
  { direction, scrollElement, previousMiddle }: {
    direction: "next" | "previous";
    scrollElement: HTMLDivElement | null;
    previousMiddle: number;
  },
) {
  const currentMiddle = getCurrentMiddleFromScrollElement({ scrollElement, previousMiddle });
  const elements = [...(getPagesFromScrollElement(scrollElement) ?? [])] as HTMLElement[];
  const page = currentMiddle == null || !scrollElement
    ? null
    : getScrollPage(currentMiddle, scrollElement);
  const currentPageIndex = page ? elements.indexOf(page) : undefined;
  const decision = {
    direction,
    previousMiddle,
    currentMiddle,
    currentPageIndex,
    pageCount: elements.length,
    operation: page && scrollElement ? "noop" : "noop",
    scrollTopBefore: scrollElement?.scrollTop,
  } satisfies NavigationDebugDecision;

  return { decision, page, elements };
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
