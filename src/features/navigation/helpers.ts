import type { Size } from "../../helpers/size.ts";

type ScrollSize = Size & {
  scrollHeight: number;
};
type PageRect = { y: number; height: number };
type Page = { page: HTMLElement; rect: PageRect };

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
  params: {
    elements: HTMLElement[];
    viewportHeight: number;
    previousMiddle: number;
  },
): number | undefined {
  const currentPage = getCurrentPageFromElements(params);
  return currentPage ? getMiddle(currentPage) : undefined;

  function getMiddle(page: Page) {
    const { viewportHeight, elements } = params;
    const scrollCenter = viewportHeight / 2;
    const ratio = 1 - ((page.rect.y + page.rect.height - scrollCenter) / page.rect.height);
    return elements.indexOf(page.page) + ratio;
  }
}

export function getCurrentPageFromElements(
  { elements, viewportHeight, previousMiddle }: {
    elements: HTMLElement[];
    viewportHeight: number;
    previousMiddle: number;
  },
): Page | undefined {
  if (!elements.length) {
    return;
  }

  const scrollCenter = viewportHeight / 2;

  // Even top level elements can have fractional size depending on the devicePixelRatio.
  const pages: Page[] = elements.map((page) => ({ page, rect: page.getBoundingClientRect() }));
  const currentRow = pages.filter(isCenterCrossing);
  return selectColumn(currentRow);

  function isCenterCrossing({ rect: { y, height } }: { rect: PageRect }) {
    return y <= scrollCenter && y + height >= scrollCenter;
  }

  function selectColumn(row: Page[]) {
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
  const pages: (HTMLImageElement | HTMLVideoElement)[] = [];
  const media = document.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video");

  for (const medium of media) {
    if (medium instanceof HTMLImageElement) {
      const img = medium;
      const parent = img.parentElement;

      const isTargetImg = urls.includes(img.src);
      const isTargetPictureImg = parent instanceof HTMLPictureElement && containsUrl(parent, urls);
      if (isTargetImg || isTargetPictureImg) {
        pages.push(img);
      }
    } else {
      const video = medium;
      const isTargetVideo = urls.includes(video.src) || containsUrl(video, urls);
      if (isTargetVideo) {
        pages.push(video);
      }
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

export function hasNoticeableDifference(middle: number, lastMiddle: number) {
  return Math.abs(middle - lastMiddle) > 0.01;
}

export function viewerScrollToWindow(
  { middle, lastMiddle, scrollElement }: {
    middle: number;
    lastMiddle: number;
    scrollElement: HTMLDivElement | null;
  },
) {
  if (!hasNoticeableDifference(middle, lastMiddle)) {
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

function containsUrl(media: HTMLPictureElement | HTMLVideoElement, urls: string[]) {
  return getUrlsFromSources(media).some((url) => urls.includes(url));
}

function getUrlsFromSources(picture: HTMLPictureElement | HTMLVideoElement) {
  const sources = [...picture.querySelectorAll("source")];
  return sources.flatMap((x) => getSrcFromSrcset(x.srcset));
}

function getSrcFromSrcset(srcset: string) {
  return srcset.split(",").map((x) => x.split(/\s+/)[0]).filter((x) => x !== undefined);
}
