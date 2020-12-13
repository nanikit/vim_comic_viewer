import { useCallback, useEffect, useMemo, useRef, useState } from '../vendors/react.ts';
import { useIntersection } from './use_intersection.ts';

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

const getCurrentPage = (container: HTMLElement, entries: IntersectionObserverEntry[]) => {
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

export const usePageNavigator = (container?: HTMLElement) => {
  const [anchor, setAnchor] = useState({
    currentPage: undefined as HTMLElement | undefined,
    ratio: 0.5,
  });

  const intersectionOption = useMemo(() => ({ threshold: [0.01, 0.5, 1] }), []);
  const { entries, observer } = useIntersection(intersectionOption);

  const getAnchor = useCallback(() => {
    if (!container || entries.length === 0) {
      return anchor;
    }

    const page = getCurrentPage(container, entries) as HTMLElement;
    const y = container.scrollTop + container.clientHeight / 2;
    const newRatio = (y - page.offsetTop) / page.clientHeight;
    const newAnchor = { currentPage: page, ratio: newRatio };
    return newAnchor;
  }, [anchor, container, entries]);

  const resetAnchor = useCallback(() => {
    setAnchor(getAnchor());
  }, [getAnchor]);

  const { currentPage, ratio } = anchor;

  const goNext = useCallback(() => {
    let cursor = (currentPage || getAnchor().currentPage) as Element;
    if (!cursor) {
      return;
    }

    const originBound = cursor.getBoundingClientRect();
    while (cursor.nextElementSibling) {
      const next = cursor.nextElementSibling;
      const nextBound = next.getBoundingClientRect();
      if (originBound.bottom < nextBound.top) {
        next.scrollIntoView({ block: 'center' });
        break;
      }
      cursor = next;
    }
  }, [currentPage, getAnchor]);

  const goPrevious = useCallback(() => {
    let cursor = (currentPage || getAnchor().currentPage) as Element;
    if (!cursor) {
      return;
    }

    const originBound = cursor.getBoundingClientRect();
    while (cursor.previousElementSibling) {
      const previous = cursor.previousElementSibling;
      const previousBound = previous.getBoundingClientRect();
      if (previousBound.bottom < originBound.top) {
        previous.scrollIntoView({ block: 'center' });
        break;
      }
      cursor = previous;
    }
  }, [currentPage, getAnchor]);

  const restoreScroll = useCallback(() => {
    if (!container || ratio === undefined || currentPage === undefined) {
      return;
    }

    const restoredY = currentPage.offsetTop + currentPage.clientHeight * (ratio - 0.5);
    container.scroll({ top: restoredY });
  }, [container, currentPage, ratio]);

  useResize(container, restoreScroll);
  useEffect(resetAnchor, [entries]);

  return useMemo(() => ({ goNext, goPrevious, observer }), [
    goNext,
    goPrevious,
    observer,
  ]);
};
