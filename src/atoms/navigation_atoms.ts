import { atom } from "../deps.ts";
import { getCurrentViewerScroll, PageScrollState } from "./dom/dom_helpers.ts";

const scrollElementStateAtom = atom<
  {
    div: HTMLDivElement;
    resizeObserver: ResizeObserver;
  } | null
>(null);

export const scrollElementSizeAtom = atom({ width: 0, height: 0 });
export const pageScrollStateAtom = atom<PageScrollState<HTMLDivElement>>(getCurrentViewerScroll());

export const synchronizeScrollAtom = atom(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);
  const previous = { ...get(pageScrollStateAtom), ...get(scrollElementSizeAtom) };

  const current = getCurrentViewerScroll(scrollElement);
  const height = scrollElement?.clientHeight ?? 0;
  const width = scrollElement?.clientWidth ?? 0;
  const isResizing = !current.page || height !== previous.height || width !== previous.width;
  if (isResizing) {
    set(restoreScrollAtom);
    // Resize observer is not always fired.
    set(scrollElementSizeAtom, (previous) => {
      const isChanged = previous.width !== width || previous.height !== height;
      return isChanged ? previous : { width, height };
    });
  } else {
    set(pageScrollStateAtom, current);
  }
});

export const restoreScrollAtom = atom(null, (get) => {
  const { page, ratio } = get(pageScrollStateAtom);
  const element = get(scrollElementAtom);
  if (!element || !page) {
    return;
  }

  const { offsetTop, clientHeight } = page;
  const restoredY = Math.floor(offsetTop + clientHeight * ratio - element.clientHeight / 2);

  element.scroll({ top: restoredY });
});

export const scrollElementAtom = atom(
  (get) => get(scrollElementStateAtom)?.div ?? null,
  (_get, set, div: HTMLDivElement | null) => {
    set(scrollElementStateAtom, (previous) => {
      if (previous?.div === div) {
        return previous;
      }

      previous?.resizeObserver.disconnect();

      if (div === null) {
        return null;
      }

      set(scrollElementSizeAtom, { width: div.clientWidth, height: div.clientHeight });
      const resizeObserver = new ResizeObserver(() => {
        set(scrollElementSizeAtom, { width: div.clientWidth, height: div.clientHeight });
        set(restoreScrollAtom);
      });
      resizeObserver.observe(div);
      return { div, resizeObserver };
    });
  },
);
scrollElementAtom.onMount = (set) => () => set(null);

export const goNextAtom = atom(null, (get) => {
  const scrollElement = get(scrollElementAtom)!;
  const { page } = getCurrentViewerScroll(scrollElement);
  if (!page) {
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
    scrollElement.scroll({ top: Math.floor(scrollElement.scrollTop + delta) });
  } else {
    scrollToNextPageTopOrEnd(page);
  }
});

export const goPreviousAtom = atom(null, (get) => {
  const scrollElement = get(scrollElementAtom)!;
  const { page } = getCurrentViewerScroll(scrollElement);
  if (!page) {
    return;
  }

  const viewerHeight = scrollElement.clientHeight;
  const ignorableHeight = viewerHeight * 0.05;
  // HACK: scrollTop has fractional px for unknown reason, -1 is monkey patching for it.
  const remainingHeight = scrollElement.scrollTop - Math.ceil(page.offsetTop) - 1;
  if (remainingHeight > ignorableHeight) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    const delta = -Math.ceil(remainingHeight / divisor);
    scrollElement.scroll({ top: Math.floor(scrollElement.scrollTop + delta) });
  } else {
    scrollToPreviousPageBottomOrStart(page);
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

function scrollToNextPageTopOrEnd(page: HTMLElement) {
  const pageBottom = page.offsetTop + page.clientHeight;
  let cursor = page as Element;
  while (cursor.nextElementSibling) {
    const next = cursor.nextElementSibling as HTMLElement;
    if (pageBottom < next.offsetTop) {
      next.scrollIntoView({ block: "start" });
      return;
    }
    cursor = next;
  }
  cursor.scrollIntoView({ block: "end" });
}

function scrollToPreviousPageBottomOrStart(page: HTMLElement) {
  const pageTop = page.offsetTop;

  let cursor = page as Element;
  while (cursor.previousElementSibling) {
    const previous = cursor.previousElementSibling as HTMLElement;
    const previousBottom = previous.offsetTop + previous.clientHeight;
    if (previousBottom < pageTop) {
      previous.scrollIntoView({ block: "end" });
      return;
    }
    cursor = previous;
  }
  cursor.scrollIntoView({ block: "start" });
}
