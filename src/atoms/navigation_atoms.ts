import { atom } from "../deps.ts";
import { beforeRepaintAtom } from "../modules/use_before_repaint.ts";
import { viewerElementAtom } from "./viewer_state_atoms.ts";

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
const shouldIgnoreScrollAtom = atom(false);
const pageScrollStateAtom = atom<PageScrollState>(initialPageScrollState);

export const synchronizeScrollAtom = atom(null, (get, set) => {
  const { page, ratio } = getCurrentPage(get(scrollElementAtom));
  const isViewerExitScroll = !page;
  if (isViewerExitScroll) {
    return;
  }

  if (get(shouldIgnoreScrollAtom)) {
    set(shouldIgnoreScrollAtom, false);
    return;
  }

  set(pageScrollStateAtom, { page, ratio });
});

export const restoreScrollAtom = atom(null, (get, set) => {
  const { page, ratio } = get(pageScrollStateAtom);
  const element = get(scrollElementAtom);
  if (!element || !page) {
    return;
  }

  const { offsetTop, clientHeight } = page;
  const restoredY = offsetTop + clientHeight * ratio - element.clientHeight / 2;

  set(shouldIgnoreScrollAtom, true);
  element.scroll({ top: restoredY });
});

export const scrollElementSizeAtom = atom({ width: 0, height: 0 });
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
      const resizeObserver = new ResizeObserver(async () => {
        set(scrollElementSizeAtom, { width: div.clientWidth, height: div.clientHeight });
        await set(beforeRepaintAtom);
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
  const remainingHeight = page.offsetTop + page.clientHeight - scrollBottom;
  if (remainingHeight > ignorableHeight) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    scrollElement.scrollBy({ top: remainingHeight / divisor });
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
  const remainingHeight = scrollElement.scrollTop - page.offsetTop;
  if (remainingHeight > ignorableHeight) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    scrollElement.scrollBy({ top: -(remainingHeight / divisor) });
  } else {
    scrollToPreviousPageBottomOrStart(page);
  }
});

export const navigateAtom = atom(null, (get, set, event: React.MouseEvent) => {
  const height = get(viewerElementAtom)?.clientHeight;
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
  const originBound = page.getBoundingClientRect();
  let cursor = page as Element;
  while (cursor.nextElementSibling) {
    const next = cursor.nextElementSibling;
    const nextBound = next.getBoundingClientRect();
    if (originBound.bottom < nextBound.top) {
      next.scrollIntoView({ block: "start" });
      return;
    }
    cursor = next;
  }
  cursor.scrollIntoView({ block: "end" });
}

function scrollToPreviousPageBottomOrStart(page: HTMLElement) {
  const originBound = page.getBoundingClientRect();
  let cursor = page as Element;
  while (cursor.previousElementSibling) {
    const previous = cursor.previousElementSibling;
    const previousBound = previous.getBoundingClientRect();
    if (previousBound.bottom < originBound.top) {
      previous.scrollIntoView({ block: "end" });
      return;
    }
    cursor = previous;
  }
  cursor.scrollIntoView({ block: "start" });
}

function getCurrentPage(container: HTMLElement | null) {
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
  )!;
  const ratio = (scrollCenter - centerCrossingPage.offsetTop) / centerCrossingPage.clientHeight;
  return { page: centerCrossingPage, ratio };
}
