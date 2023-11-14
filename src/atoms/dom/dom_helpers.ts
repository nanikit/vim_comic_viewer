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
  const children = [...(container?.children ?? [])] as HTMLDivElement[];
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
  if (!elements.length) {
    return emptyScroll;
  }

  const pages = elements.map((page) => ({ page, rect: page.getBoundingClientRect() }));
  const fullyVisiblePages = pages.filter(({ rect }) =>
    rect.y >= 0 && rect.y + rect.height <= innerHeight
  );
  if (fullyVisiblePages.length) {
    return {
      page: fullyVisiblePages[0].page,
      ratio: 0.5,
      fullyVisiblePages: fullyVisiblePages.map((x) => x.page),
    };
  }

  const scrollCenter = innerHeight / 2;
  const centerCrossingPage = pages.find(({ rect }) =>
    rect.top <= scrollCenter && rect.bottom >= scrollCenter
  );
  if (centerCrossingPage) {
    const centerCrossingRect = centerCrossingPage.rect;
    const ratio = 1 - ((centerCrossingRect.bottom - scrollCenter) / centerCrossingRect.height);
    return { page: centerCrossingPage.page, ratio, fullyVisiblePages: [] };
  }

  const firstPage = pages[0];
  const lastPage = pages[pages.length - 1];
  if (scrollCenter < pages[0].rect.top) {
    return { page: firstPage.page, ratio: 0, fullyVisiblePages: [] };
  }
  return { page: lastPage.page, ratio: 1, fullyVisiblePages: [] };
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
