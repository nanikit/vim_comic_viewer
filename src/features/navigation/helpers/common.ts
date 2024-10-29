export type VisibleRect = { page: HTMLElement; rect: RectHeight };
type RectHeight = { y: number; height: number };

export function getCurrentRow(
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

export function getInPageRatio(
  { page, viewportHeight }: { page: VisibleRect; viewportHeight: number },
) {
  const scrollCenter = viewportHeight / 2;
  const { y, height } = page.rect;
  return 1 - ((y + height - scrollCenter) / height);
}
