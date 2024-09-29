import { atom } from "../deps.ts";
import { getCurrentViewerScroll, PageScrollState } from "./dom/dom_helpers.ts";

export const scrollElementStateAtom = atom<
  {
    div: HTMLDivElement;
    resizeObserver: ResizeObserver;
  } | null
>(null);
export const scrollElementAtom = atom((get) => get(scrollElementStateAtom)?.div ?? null);

export const scrollElementSizeAtom = atom({ width: 0, height: 0 });
export const pageScrollStateAtom = atom<PageScrollState<HTMLDivElement>>(getCurrentViewerScroll());

export const transferViewerScrollToWindowAtom = atom(null, (get) => {
  const { page, ratio } = get(pageScrollStateAtom);
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
  const top = scrollY + rect.y + rect.height * ratio - innerHeight / 2;
  scroll({ behavior: "instant", top });
  return true;
});

const previousSizeAtom = atom({ width: 0, height: 0 });
export const synchronizeScrollAtom = atom(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);
  const current = getCurrentViewerScroll(scrollElement);
  if (!current.page) {
    return;
  }

  const height = scrollElement?.clientHeight ?? 0;
  const width = scrollElement?.clientWidth ?? 0;
  const previous = get(previousSizeAtom);
  const isResizing = width === 0 || height === 0 || height !== previous.height ||
    width !== previous.width;
  if (isResizing) {
    set(restoreScrollAtom);
    set(previousSizeAtom, { width, height });
  } else {
    set(pageScrollStateAtom, current);
    set(transferViewerScrollToWindowAtom);
  }
});

const viewerScrollAtom = atom(
  (get) => get(scrollElementAtom)?.scrollTop,
  (get, _set, top: number) => {
    get(scrollElementAtom)?.scroll({ top });
  },
);

export const restoreScrollAtom = atom(null, (get, set) => {
  const { page, ratio } = get(pageScrollStateAtom);
  const scrollable = get(scrollElementAtom);
  if (!scrollable || !page) {
    return;
  }

  const { offsetTop, clientHeight } = page;
  const restoredY = Math.floor(offsetTop + clientHeight * ratio - scrollable.clientHeight / 2);
  set(viewerScrollAtom, restoredY);
});

export const goNextAtom = atom(null, (get, set) => {
  const top = getNextScroll(get(scrollElementAtom));
  if (top != null) {
    set(viewerScrollAtom, top);
  }
});

export const goPreviousAtom = atom(null, (get, set) => {
  const top = getPreviousScroll(get(scrollElementAtom));
  if (top != null) {
    set(viewerScrollAtom, top);
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

function getPreviousScroll(scrollElement: HTMLDivElement | null) {
  const { page } = getCurrentViewerScroll(scrollElement);
  if (!page || !scrollElement) {
    return;
  }

  const viewerHeight = scrollElement.clientHeight;
  const ignorableHeight = viewerHeight * 0.05;
  // HACK: scrollTop has fractional px for unknown reason, -1 is monkey patching for it.
  const remainingHeight = scrollElement.scrollTop - Math.ceil(page.offsetTop) - 1;
  if (remainingHeight > ignorableHeight) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    const delta = -Math.ceil(remainingHeight / divisor);
    return Math.floor(scrollElement.scrollTop + delta);
  } else {
    return getPreviousPageBottomOrStart(page);
  }
}

function getNextScroll(scrollElement: HTMLDivElement | null) {
  const { page } = getCurrentViewerScroll(scrollElement);
  if (!page || !scrollElement) {
    return;
  }

  const viewerHeight = scrollElement.clientHeight;
  const ignorableHeight = viewerHeight * 0.05;
  const scrollBottom = scrollElement.scrollTop + viewerHeight;
  // HACK: scrollTop has fractional px for unknown reason, -1 is monkey patching for it.
  const remainingHeight = page.offsetTop + page.clientHeight - Math.ceil(scrollBottom) - 1;
  if (remainingHeight > ignorableHeight) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    const delta = Math.ceil(remainingHeight / divisor);
    return Math.floor(scrollElement.scrollTop + delta);
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
      return next.offsetTop;
    }
    cursor = next;
  }

  return cursor.offsetTop + cursor.clientHeight;
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
      return previous.offsetTop + previous.clientHeight - scrollable.clientHeight;
    }
    cursor = previous;
  }

  return cursor.offsetTop;
}
