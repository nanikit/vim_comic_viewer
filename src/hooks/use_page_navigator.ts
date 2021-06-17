import { useEffect, useMemo, useRef, useState } from "react";
import { useIntersection } from "./use_intersection.ts";

const useResize = <T, E extends Element>(
  target: E | undefined,
  transformer: (target?: ResizeObserverEntry) => T,
): T => {
  const [value, setValue] = useState(() => transformer(undefined));
  const callbackRef = useRef(transformer);
  callbackRef.current = transformer;

  useEffect(() => {
    if (!target) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      setValue(callbackRef.current(entries[0]));
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [target, callbackRef]);

  return value;
};

const getCurrentPage = (
  container: HTMLElement,
  entries: IntersectionObserverEntry[],
) => {
  if (!entries.length) {
    return container.firstElementChild || undefined;
  }

  const children = [...((container.children as unknown) as Iterable<Element>)];
  const fullyVisibles = entries.filter((x) => x.intersectionRatio === 1);
  if (fullyVisibles.length) {
    fullyVisibles.sort((a, b) => {
      return children.indexOf(a.target) - children.indexOf(b.target);
    });
    return fullyVisibles[Math.floor(fullyVisibles.length / 2)].target;
  }

  return entries.sort((a, b) => {
    const ratio = {
      a: a.intersectionRatio,
      b: b.intersectionRatio,
    };
    const index = {
      a: children.indexOf(a.target),
      b: children.indexOf(b.target),
    };
    return (ratio.b - ratio.a) * 10000 + (index.a - index.b);
  })[0].target;
};

export type PageNavigator = {
  goPrevious: () => void;
  goNext: () => void;
  observer?: IntersectionObserver;
};

const makePageNavigator = (container?: HTMLElement) => {
  let currentPage: HTMLElement | undefined;
  let ratio: number | undefined;
  let ignoreIntersection = false;

  const resetAnchor = (entries: IntersectionObserverEntry[]) => {
    if (!container?.clientHeight || entries.length === 0) {
      return;
    }
    if (ignoreIntersection) {
      ignoreIntersection = false;
      return;
    }

    const page = getCurrentPage(container, entries) as HTMLElement;
    const y = container.scrollTop + container.clientHeight / 2;
    currentPage = page;
    ratio = (y - page.offsetTop) / page.clientHeight;
  };

  const goNext = () => {
    ignoreIntersection = false;
    if (!currentPage) {
      return;
    }

    const originBound = currentPage.getBoundingClientRect();
    let cursor = currentPage as Element;
    while (cursor.nextElementSibling) {
      const next = cursor.nextElementSibling;
      const nextBound = next.getBoundingClientRect();
      if (originBound.bottom < nextBound.top) {
        next.scrollIntoView({ block: "center" });
        break;
      }
      cursor = next;
    }
  };

  const goPrevious = () => {
    ignoreIntersection = false;
    if (!currentPage) {
      return;
    }

    const originBound = currentPage.getBoundingClientRect();
    let cursor = currentPage as Element;
    while (cursor.previousElementSibling) {
      const previous = cursor.previousElementSibling;
      const previousBound = previous.getBoundingClientRect();
      if (previousBound.bottom < originBound.top) {
        previous.scrollIntoView({ block: "center" });
        break;
      }
      cursor = previous;
    }
  };

  const restoreScroll = () => {
    if (!container || ratio === undefined || currentPage === undefined) {
      return;
    }

    const restoredY = currentPage.offsetTop +
      currentPage.clientHeight * (ratio - 0.5);
    container.scroll({ top: restoredY });
    ignoreIntersection = true;
  };

  const intersectionOption = { threshold: [0.01, 0.5, 1] };

  return new class PageNavigator {
    goNext = goNext;
    goPrevious = goPrevious;
    observer: IntersectionObserver | undefined;
    useInstance = () => {
      this.observer = useIntersection(resetAnchor, intersectionOption);
      useResize(container, restoreScroll);
    };
  }();
};

export const usePageNavigator = (container?: HTMLElement): PageNavigator => {
  const navigator = useMemo(() => makePageNavigator(container), [container]);
  navigator.useInstance();
  return navigator;
};
