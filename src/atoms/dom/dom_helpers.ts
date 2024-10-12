const globalCss = document.createElement("style");
globalCss.innerHTML = `html, body {
  overflow: hidden;
}`;

export function hideBodyScrollBar(doHide: boolean) {
  if (doHide) {
    document.head.append(globalCss);
  } else {
    globalCss.remove();
  }
}

export async function setFullscreenElement(element: Element | null) {
  if (element) {
    await element.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
}

export function focusWithoutScroll(element?: HTMLElement) {
  element?.focus({ preventScroll: true });
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
  const children = [...(container?.firstElementChild?.children ?? [])] as HTMLDivElement[];
  if (!container || !children.length) {
    return emptyScroll;
  }

  return getCurrentScroll(children);
}

export function getUrlImgs(urls: string[]) {
  const pages = [];
  const imgs = document.querySelectorAll<HTMLImageElement>("img[src]");
  for (const img of imgs) {
    if (urls.includes(img.src)) {
      pages.push(img);
    }
  }
  return pages;
}

export function getCurrentScroll<T extends HTMLElement>(elements: T[]): PageScrollState<T> {
  const middle = getPageScroll(elements);
  if (middle === null) {
    return emptyScroll;
  }

  const index = Math.floor(middle);
  const currentPage = elements[index]!;
  const ratio = middle - index;

  const state = { page: currentPage, ratio, fullyVisiblePages: [] };
  return state;
}

export function isUserGesturePermissionError(error: unknown) {
  // Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.
  return (error as { message?: string })?.message === "Permissions check failed";
}

/** Fast fullscreen change can cause this. */
export function isDocumentNotActiveError(error: unknown) {
  const message = (error as { message?: string })?.message;
  return message?.match(/Failed to execute '.*?' on 'Document': Document not active/) ?? false;
}

function getPageScroll(elements: HTMLElement[]): number | null {
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
