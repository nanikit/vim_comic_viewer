import { atom } from "../deps.ts";

const scrollElementStateAtom = atom<
  {
    div: HTMLDivElement;
    resizeObserver: ResizeObserver;
  } | null
>(null);

type PageScrollState = {
  page: HTMLElement | null;
  ratio: number;
};
const initialPageScrollState = { page: null, ratio: 0.5 };
export const scrollElementSizeAtom = atom({ width: 0, height: 0 });
const pageScrollStateAtom = atom<PageScrollState>(initialPageScrollState);

export const synchronizeScrollAtom = atom(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);
  const previous = { ...get(pageScrollStateAtom), ...get(scrollElementSizeAtom) };

  const current = getCurrentPage(scrollElement);
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
  const { page } = getCurrentPage(scrollElement);
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
  const { page } = getCurrentPage(scrollElement);
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

export function getCurrentPage(container: HTMLElement | null) {
  const clientHeight = container?.clientHeight;
  if (!clientHeight) {
    return initialPageScrollState;
  }
  const children = [...((container.children as unknown) as Iterable<HTMLElement>)];
  if (!children.length) {
    return initialPageScrollState;
  }

  const viewportTop = container.scrollTop;
  const viewportBottom = viewportTop + container.clientHeight;
  const fullyVisiblePages = children.filter((x) =>
    x.offsetTop >= viewportTop && x.offsetTop + x.clientHeight <= viewportBottom
  );
  if (fullyVisiblePages.length) {
    return { page: fullyVisiblePages[Math.floor(fullyVisiblePages.length / 2)]!, ratio: 0.5 };
  }

  const scrollCenter = (viewportTop + viewportBottom) / 2;
  const centerCrossingPage = children.find((x) =>
    x.offsetTop <= scrollCenter && x.offsetTop + x.clientHeight >= scrollCenter
  );
  if (!centerCrossingPage) {
    return initialPageScrollState;
  }

  const ratio = (scrollCenter - centerCrossingPage.offsetTop) / centerCrossingPage.clientHeight;
  return { page: centerCrossingPage, ratio };
}
