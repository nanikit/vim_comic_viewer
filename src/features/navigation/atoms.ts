import { atom } from "../../deps.ts";
import {
  getCurrentMiddleFromScrollElement,
  getNextScroll,
  getPreviousScroll,
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

export const scrollElementSizeAtom = atom({ width: 0, height: 0, scrollHeight: 0 });
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
  const previousSize = get(scrollElementSizeAtom);

  const rect = scrollElement.getBoundingClientRect();
  const currentSize = {
    width: rect.width,
    height: rect.height,
    scrollHeight: scrollElement.scrollHeight,
  };
  if (!needsScrollRestoration(previousSize, currentSize)) {
    return false;
  }

  set(scrollElementSizeAtom, currentSize);
  set(restoreScrollAtom);
  // It handles shouldBeOriginalSize change.
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
