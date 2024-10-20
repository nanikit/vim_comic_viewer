import type { Size } from "../../helpers/size.ts";

type ScrollSize = Size & {
  scrollHeight: number;
};

export function getScrollPage(middle: number, container?: HTMLElement | null) {
  const element = container?.firstElementChild?.children?.item(Math.floor(middle));
  return element instanceof HTMLElement ? element : null;
}

export function getCurrentPageFromScrollElement(scrollElement?: HTMLElement | null) {
  const middle = getCurrentMiddleFromScrollElement(scrollElement);

  if (!middle || !scrollElement) {
    return null;
  }

  return getScrollPage(middle, scrollElement);
}

export function getCurrentMiddleFromScrollElement(scrollElement: HTMLElement | null | undefined) {
  const children = [...(scrollElement?.firstElementChild?.children ?? [])] as HTMLDivElement[];
  return getPageScroll(children);
}

export function getPageScroll(elements: HTMLElement[]): number | null {
  if (!elements.length) {
    return null;
  }

  const scrollCenter = innerHeight / 2;

  // Even top level elements can have fractional size depending on the devicePixelRatio.
  const pages = elements.map((page) => ({ page, rect: page.getBoundingClientRect() }));

  const currentPages = pages.filter(isCenterCrossing);
  const currentPage = currentPages[Math.floor(currentPages.length / 2)];
  if (!currentPage) {
    return null;
  }

  const ratio = 1 - ((currentPage.rect.bottom - scrollCenter) / currentPage.rect.height);
  const middle = elements.indexOf(currentPage.page) + ratio;

  return middle;

  function isCenterCrossing({ rect: { y, height } }: { rect: { y: number; height: number } }) {
    return y <= scrollCenter && y + height >= scrollCenter;
  }
}

export function needsScrollRestoration(previousSize: ScrollSize, currentSize: ScrollSize) {
  const { width, height, scrollHeight } = currentSize;
  const { width: previousWidth, height: previousHeight, scrollHeight: previousScrollHeight } =
    previousSize;
  return previousWidth === 0 || previousHeight === 0 ||
    previousWidth !== width || previousHeight !== height ||
    previousScrollHeight !== scrollHeight;
}

/** Returns difference of scrollTop to make the target section visible. */
export function getPreviousScroll(scrollElement: HTMLDivElement | null) {
  const page = getCurrentPageFromScrollElement(scrollElement);
  if (!page || !scrollElement) {
    return;
  }

  const viewerHeight = scrollElement.clientHeight;
  const ignorableHeight = viewerHeight * 0.05;
  // HACK: scrollTop has fractional px on HiDPI, -1 is monkey patching for it.
  const remainingHeight = scrollElement.scrollTop - Math.ceil(page.offsetTop) - 1;
  if (remainingHeight > ignorableHeight) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    return -Math.ceil(remainingHeight / divisor);
  } else {
    return getPreviousPageBottomOrStart(page);
  }
}

export function getNextScroll(scrollElement: HTMLDivElement | null) {
  const page = getCurrentPageFromScrollElement(scrollElement);
  if (!page || !scrollElement) {
    return;
  }

  const viewerHeight = scrollElement.clientHeight;
  const ignorableHeight = viewerHeight * 0.05;
  const scrollBottom = scrollElement.scrollTop + viewerHeight;
  // HACK: scrollTop has fractional px on HiDPI, -1 is monkey patching for it.
  const remainingHeight = page.offsetTop + page.clientHeight - Math.ceil(scrollBottom) - 1;
  if (remainingHeight > ignorableHeight) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    return Math.ceil(remainingHeight / divisor);
  } else {
    return getNextPageTopOrEnd(page);
  }
}

export function getUrlMedia(urls: string[]) {
  const pages = [];
  const imgs = document.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
    "img[src], video[src]",
  );
  for (const img of imgs) {
    if (urls.includes(img.src)) {
      pages.push(img);
    }
  }
  return pages;
}

export function isVisible(element: HTMLElement) {
  if ("checkVisibility" in element) {
    return element.checkVisibility();
  }

  const { x, y, width, height } = (element as HTMLElement).getBoundingClientRect();
  const elements = document.elementsFromPoint(x + width / 2, y + height / 2);
  return elements.includes(element);
}

export function isMiddleScrollSame(middle: number, lastScrollTransferMiddle: number) {
  return Math.abs(middle - lastScrollTransferMiddle) < 0.01;
}

export function viewerScrollToWindow(
  { middle, scrollElement, lastScrollTransferMiddle }: {
    middle: number;
    scrollElement: HTMLDivElement | null;
    lastScrollTransferMiddle: number;
  },
) {
  if (isMiddleScrollSame(middle, lastScrollTransferMiddle)) {
    return;
  }

  const page = getScrollPage(middle, scrollElement);
  const src = page?.querySelector("img")?.src;
  if (!src) {
    return;
  }

  const fileName = src.split("/").pop()?.split("?")[0];
  const candidates = document.querySelectorAll<HTMLImageElement>(`img[src*="${fileName}"]`);
  const original = [...candidates].find((img) => img.src === src);
  const isViewerMedia = original?.parentElement === page;
  if (!original || isViewerMedia) {
    return;
  }

  const rect = original.getBoundingClientRect();
  const ratio = middle - Math.floor(middle);
  const top = scrollY + rect.y + rect.height * ratio - innerHeight / 2;

  return top;
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
