import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export const usePageNavigator = (container?: HTMLElement) => {
  const [anchor, setAnchor] = useState({
    currentPage: undefined as HTMLElement | undefined,
    ratio: 0.5,
  });
  const { currentPage, ratio } = anchor;

  const ignoreIntersection = useRef(false);

  const resetAnchor = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!container?.clientHeight || entries.length === 0) {
        return;
      }
      if (ignoreIntersection.current) {
        ignoreIntersection.current = false;
        return;
      }

      const page = getCurrentPage(container, entries) as HTMLElement;
      const y = container.scrollTop + container.clientHeight / 2;
      const newRatio = (y - page.offsetTop) / page.clientHeight;
      const newAnchor = { currentPage: page, ratio: newRatio };
      setAnchor(newAnchor);
    },
    [container],
  );

  const goNext = useCallback(() => {
    ignoreIntersection.current = false;
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
  }, [currentPage]);

  const goPrevious = useCallback(() => {
    ignoreIntersection.current = false;
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
  }, [currentPage]);

  const restoreScroll = useCallback(() => {
    if (!container || ratio === undefined || currentPage === undefined) {
      return;
    }

    const restoredY = currentPage.offsetTop +
      currentPage.clientHeight * (ratio - 0.5);
    container.scroll({ top: restoredY });
    ignoreIntersection.current = true;
  }, [container, currentPage, ratio]);

  const intersectionOption = useMemo(() => ({ threshold: [0.01, 0.5, 1] }), []);
  const observer = useIntersection(resetAnchor, intersectionOption);

  useResize(container, restoreScroll);

  return useMemo(() => ({ goNext, goPrevious, observer }), [
    goNext,
    goPrevious,
    observer,
  ]);
};
