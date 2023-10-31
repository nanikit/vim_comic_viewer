const globalCss = document.createElement("style");
globalCss.innerHTML = `html, body {
  overflow: hidden;
}`;

export function showBodyScrollbar(doShow: boolean) {
  if (doShow) {
    globalCss.remove();
  } else {
    document.head.append(globalCss);
  }
}

export async function setFullscreenElement(element: Element | null) {
  if (element) {
    await element.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
}

export function focusWithoutScroll(element: HTMLElement) {
  element.focus({ preventScroll: true });
}

export function isVisible(element: HTMLElement) {
  return element.offsetWidth > 0 || element.offsetHeight > 0;
}

export type PageScrollState<T extends HTMLElement> = {
  page: T | null;
  ratio: number;
  fullyVisiblePages: T[];
};

const emptyScroll = { page: null, ratio: 0, fullyVisiblePages: [] };

export function getCurrentViewerScroll(
  container?: HTMLElement | null,
): PageScrollState<HTMLDivElement> {
  const children = [...(container?.children ?? [])] as HTMLDivElement[];
  if (!container || !children.length) {
    return emptyScroll;
  }

  return getCurrentScroll(children);
}

export function getCurrentWindowScroll(urls: string[]): PageScrollState<HTMLImageElement> {
  const pages = [];
  const imgs = document.querySelectorAll<HTMLImageElement>("img[src]");
  for (const img of imgs) {
    if (urls.includes(img.src)) {
      pages.push(img);
    }
  }

  return getCurrentScroll(pages);
}

function getCurrentScroll<T extends HTMLElement>(elements: T[]): PageScrollState<T> {
  const pages = elements.map((page) => ({ page, rect: page.getBoundingClientRect() }));
  const fullyVisiblePages = pages.filter(({ rect }) =>
    rect.y >= 0 && rect.y + rect.height <= innerHeight
  );

  if (fullyVisiblePages.length) {
    return {
      page: fullyVisiblePages[Math.floor(fullyVisiblePages.length / 2)].page,
      ratio: 0.5,
      fullyVisiblePages: fullyVisiblePages.map((x) => x.page),
    };
  }

  const scrollCenter = innerHeight / 2;
  const centerCrossingPage = pages.find(({ rect }) =>
    rect.top <= scrollCenter && rect.bottom >= scrollCenter
  );
  if (!centerCrossingPage) {
    return emptyScroll;
  }

  const centerCrossingRect = centerCrossingPage.rect;
  const ratio = 1 - ((centerCrossingRect.bottom - scrollCenter) / centerCrossingRect.height);
  return { page: centerCrossingPage.page, ratio, fullyVisiblePages: [] };
}
