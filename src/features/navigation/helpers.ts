import type { Size } from "../../helpers/size.ts";

export type PageScrollState<T extends HTMLElement> = {
  page: T | null;
  middle: number;
};

const emptyScroll = { page: null, ratio: 0, middle: 0.5 };

export function getCurrentViewerScroll(
  container?: HTMLElement | null,
): PageScrollState<HTMLDivElement> {
  const children = [...(container?.firstElementChild?.children ?? [])] as HTMLDivElement[];
  if (!container || !children.length) {
    return emptyScroll;
  }

  const middle = getPageScroll(children);
  if (middle === null) {
    return emptyScroll;
  }

  const index = Math.floor(middle);
  const currentPage = children[index]!;
  const ratio = middle - index;

  const state = { page: currentPage, ratio, middle };
  return state;
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

export function needsScrollRestoration(previousSize: Size, currentSize: Size) {
  const { width, height } = currentSize;
  const { width: previousWidth, height: previousHeight } = previousSize;
  return previousWidth === 0 || previousHeight === 0 ||
    previousWidth !== width || previousHeight !== height;
}
