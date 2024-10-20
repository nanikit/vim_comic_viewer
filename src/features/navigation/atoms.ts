import { atom } from "../../deps.ts";
import {
  getCurrentMiddleFromScrollElement,
  getCurrentPageFromScrollElement,
  getScrollPage,
  needsScrollRestoration,
} from "./helpers.ts";

export const scrollElementStateAtom = atom<
  {
    div: HTMLDivElement;
    resizeObserver: ResizeObserver;
  } | null
>(null);
export const scrollElementAtom = atom((get) => get(scrollElementStateAtom)?.div ?? null);

export const scrollElementSizeAtom = atom({ width: 0, height: 0 });
export const pageScrollMiddleAtom = atom(0.5);

export const transferViewerScrollToWindowAtom = atom(null, (get) => {
  const middle = get(pageScrollMiddleAtom);
  const page = getScrollPage(middle, get(scrollElementAtom));
  const src = page?.querySelector("img")?.src;
  if (!src) {
    return false;
  }

  const fileName = src.split("/").pop()?.split("?")[0];
  const candidates = document.querySelectorAll<HTMLImageElement>(`img[src*="${fileName}"]`);
  const original = [...candidates].find((img) => img.src === src);
  const isViewerMedia = original?.parentElement === page;
  if (!original || isViewerMedia) {
    return false;
  }

  const rect = original.getBoundingClientRect();
  const ratio = middle - Math.floor(middle);
  const top = scrollY + rect.y + rect.height * ratio - innerHeight / 2;
  scroll({ behavior: "instant", top });
  return true;
});

export const synchronizeScrollAtom = atom(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);
  if (!scrollElement) {
    return;
  }

  if (set(correctScrollAtom)) {
    return;
  }

  const middle = getCurrentMiddleFromScrollElement(scrollElement);
  if (middle) {
    set(pageScrollMiddleAtom, middle);
  }

  set(transferViewerScrollToWindowAtom);
});

export const correctScrollAtom = atom(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);
  if (!scrollElement) {
    return;
  }

  const currentSize = scrollElement.getBoundingClientRect();
  const previousSize = get(scrollElementSizeAtom);
  if (!needsScrollRestoration(previousSize, currentSize)) {
    return false;
  }

  set(scrollElementSizeAtom, currentSize);
  set(restoreScrollAtom);
  setTimeout(() => set(restoreScrollAtom), 0);
  return true;
});

const viewerScrollAtom = atom(
  (get) => get(scrollElementAtom)?.scrollTop,
  (get, _set, top: number) => {
    get(scrollElementAtom)?.scroll({ top });
  },
);

export const restoreScrollAtom = atom(null, (get, set) => {
  const middle = get(pageScrollMiddleAtom);
  const scrollable = get(scrollElementAtom);
  const page = getScrollPage(middle, scrollable);
  if (!page || !scrollable || scrollable.clientHeight < 1) {
    return;
  }

  const { offsetTop, clientHeight } = page;
  const ratio = middle - Math.floor(middle);
  const restoredY = Math.floor(offsetTop + clientHeight * ratio - scrollable.clientHeight / 2);
  set(viewerScrollAtom, restoredY);
});

export const goNextAtom = atom(null, (get) => {
  const diffY = getNextScroll(get(scrollElementAtom));
  if (diffY != null) {
    // Use scrollBy because scrollTop precision is not enough on HiDPI.
    get(scrollElementAtom)?.scrollBy({ top: diffY });
  }
});

export const goPreviousAtom = atom(null, (get) => {
  const diffY = getPreviousScroll(get(scrollElementAtom));
  if (diffY != null) {
    get(scrollElementAtom)?.scrollBy({ top: diffY });
  }
});

export const navigateAtom = atom(null, (get, set, event: React.MouseEvent) => {
  const height = get(scrollElementAtom)?.clientHeight;
  if (!height || event.button !== 0) {
    return;
  }
  event.preventDefault();

  const isTop = event.clientY < height / 2;
  if (isTop) {
    set(goPreviousAtom);
  } else {
    set(goNextAtom);
  }
});

/** Returns difference of scrollTop to make the target section visible. */
function getPreviousScroll(scrollElement: HTMLDivElement | null) {
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

function getNextScroll(scrollElement: HTMLDivElement | null) {
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
