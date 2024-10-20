import type { Size } from "../../helpers/size.ts";

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

export function needsScrollRestoration(previousSize: Size, currentSize: Size) {
  const { width, height } = currentSize;
  const { width: previousWidth, height: previousHeight } = previousSize;
  return previousWidth === 0 || previousHeight === 0 ||
    previousWidth !== width || previousHeight !== height;
}
