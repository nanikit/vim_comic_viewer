import type { Size } from "../../helpers/size.ts";

type ScrollSize = Size & {
  scrollHeight: number;
};

export function getScrollPage(middle: number, container?: HTMLElement | null) {
  const element = container?.firstElementChild?.children?.item(Math.floor(middle));
  return element instanceof HTMLElement ? element : null;
}

export function getCurrentMiddleFromScrollElement({
  scrollElement,
  previousMiddle,
}: {
  scrollElement?: HTMLElement | null;
  previousMiddle: number;
}) {
  const children = scrollElement?.firstElementChild?.children;
  if (!children) {
    return null;
  }

  const elements = [...children] as HTMLDivElement[];
  return getPageScroll({
    elements,
    viewportHeight: scrollElement.getBoundingClientRect().height,
    previousMiddle,
  });
}

export function getPageScroll(
  { elements, viewportHeight, previousMiddle }: {
    elements: HTMLElement[];
    viewportHeight: number;
    previousMiddle: number;
  },
): number | null {
  type PageRect = { y: number; height: number };
  type Page = { page: HTMLElement; rect: PageRect };

  if (!elements.length) {
    return null;
  }

  const scrollCenter = viewportHeight / 2;

  // Even top level elements can have fractional size depending on the devicePixelRatio.
  const pages: Page[] = elements.map((page) => ({ page, rect: page.getBoundingClientRect() }));
  const currentRow = pages.filter(isCenterCrossing);
  const currentPage = getCurrentPage(currentRow);
  if (!currentPage) {
    return null;
  }

  const middle = getMiddle(currentPage);
  return middle;

  function isCenterCrossing({ rect: { y, height } }: { rect: PageRect }) {
    return y <= scrollCenter && y + height >= scrollCenter;
  }

  function getCurrentPage(row: Page[]) {
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

  function getMiddle(page: Page) {
    const ratio = 1 - ((page.rect.y + page.rect.height - scrollCenter) / page.rect.height);
    return elements.indexOf(page.page) + ratio;
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
  const page = getCurrentPageFromScrollElement({ scrollElement, previousMiddle: Infinity });
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
  const page = getCurrentPageFromScrollElement({ scrollElement, previousMiddle: 0 });
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

export function isSamePage(middle: number, lastScrollTransferMiddle: number) {
  return Math.floor(middle) === Math.floor(lastScrollTransferMiddle);
}

export function viewerScrollToWindow(
  { middle, scrollElement, lastScrollTransferMiddle }: {
    middle: number;
    scrollElement: HTMLDivElement | null;
    lastScrollTransferMiddle: number;
  },
) {
  if (isSamePage(middle, lastScrollTransferMiddle)) {
    return;
  }

  const page = getScrollPage(middle, scrollElement);
  const src = page?.querySelector("img")?.src;
  if (!src) {
    return;
  }

  const fileName = src.split("/").pop()?.split("?")[0];
  const candidates = document.querySelectorAll<HTMLImageElement>(`img[src*="${fileName}"]`);
  const originals = [...candidates].filter((img) =>
    img.src === src && img.parentElement !== page && isVisible(img)
  );
  const original = originals.length === 1 ? originals[0] : null;
  if (!original) {
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

function getCurrentPageFromScrollElement(
  { scrollElement, previousMiddle }: { scrollElement: HTMLElement | null; previousMiddle: number },
) {
  const middle = getCurrentMiddleFromScrollElement({ scrollElement, previousMiddle });
  if (!middle || !scrollElement) {
    return null;
  }

  return getScrollPage(middle, scrollElement);
}
