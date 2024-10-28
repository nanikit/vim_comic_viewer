import type { Size } from "../../helpers/size.ts";

type ScrollSize = Size & {
  scrollHeight: number;
};
type RectHeight = { y: number; height: number };
type VisibleRect = { page: HTMLElement; rect: RectHeight };

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

export function toViewerScroll({ scrollable, lastWindowToViewerMiddle }: {
  scrollable: HTMLDivElement | null;
  lastWindowToViewerMiddle: number;
}) {
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
  const siteMedia = media.filter((medium) => !viewerMedia.includes(medium as HTMLImageElement));
  const visibleMedia = siteMedia.filter(isVisible);

  const viewportHeight = visualViewport?.height ?? innerHeight;
  const currentRow = getCurrentRow({ elements: visibleMedia, viewportHeight });
  if (!currentRow) {
    return;
  }

  const indexed = currentRow.map((sized) => [sized, getUrlIndex(sized.page, urls)] as const);
  const last = lastWindowToViewerMiddle - 0.5;
  const sorted = indexed.sort((a, b) => Math.abs(a[1] - last) - Math.abs(b[1] - last));
  const [page, index] = sorted[0] ?? [];
  if (!page || index === undefined) {
    return;
  }

  const pageRatio = getInPageRatio({ page, viewportHeight });
  const snappedRatio = Math.abs(pageRatio - 0.5) < 0.1 ? 0.5 : pageRatio;
  if (!hasNoticeableDifference(index + snappedRatio, lastWindowToViewerMiddle)) {
    return;
  }

  return index + snappedRatio;
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

export function toWindowScroll(
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

function getUrlMedia(urls: string[]) {
  const media = document.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video");
  return [...media].filter((medium) => getUrlIndex(medium, urls) !== -1);
}

function getUrlIndex(medium: HTMLElement, urls: string[]) {
  if (medium instanceof HTMLImageElement) {
    const img = medium;
    const parent = img.parentElement;

    const imgUrlIndex = urls.findIndex((x) => x === img.src);
    const pictureUrlIndex = parent instanceof HTMLPictureElement
      ? getUrlIndexFromSrcset(parent, urls)
      : -1;
    return imgUrlIndex === -1 ? pictureUrlIndex : imgUrlIndex;
  } else if (medium instanceof HTMLVideoElement) {
    const video = medium;
    const videoUrlIndex = urls.findIndex((x) => x === video.src);
    const srcsetUrlIndex = getUrlIndexFromSrcset(video, urls);
    return videoUrlIndex === -1 ? srcsetUrlIndex : videoUrlIndex;
  }

  return -1;
}

function getUrlIndexFromSrcset(media: HTMLPictureElement | HTMLVideoElement, urls: string[]) {
  for (const url of getUrlsFromSources(media)) {
    const index = urls.findIndex((x) => x === url);
    if (index !== -1) {
      return index;
    }
  }

  return -1;
}

function getUrlsFromSources(picture: HTMLPictureElement | HTMLVideoElement) {
  const sources = [...picture.querySelectorAll("source")];
  return sources.flatMap((x) => getSrcFromSrcset(x.srcset));
}

function getSrcFromSrcset(srcset: string) {
  return srcset.split(",").map((x) => x.split(/\s+/)[0]).filter((x) => x !== undefined);
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

function getInPageRatio({ page, viewportHeight }: { page: VisibleRect; viewportHeight: number }) {
  const scrollCenter = viewportHeight / 2;
  const { y, height } = page.rect;
  return 1 - ((y + height - scrollCenter) / height);
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

function getCurrentRow(
  { elements, viewportHeight }: { elements: HTMLElement[]; viewportHeight: number },
) {
  if (!elements.length) {
    return;
  }

  const scrollCenter = viewportHeight / 2;

  // Even top level elements can have fractional size depending on the devicePixelRatio.
  const pages: VisibleRect[] = elements.map((page) => ({
    page,
    rect: page.getBoundingClientRect(),
  }));
  return pages.filter(isCenterCrossing);

  function isCenterCrossing({ rect: { y, height } }: { rect: RectHeight }) {
    return y <= scrollCenter && y + height >= scrollCenter;
  }
}

function isVisible(element: HTMLElement) {
  if ("checkVisibility" in element) {
    return element.checkVisibility();
  }

  const { x, y, width, height } = (element as HTMLElement).getBoundingClientRect();
  const elements = document.elementsFromPoint(x + width / 2, y + height / 2);
  return elements.includes(element);
}

function hasNoticeableDifference(middle: number, lastMiddle: number) {
  return Math.abs(middle - lastMiddle) > 0.01;
}
