import { useCallback, useEffect, useMemo, useState } from '../vendors/react.ts';
import { useIntersection } from './use_intersection.ts';

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

export const usePageAnchor = (container?: HTMLElement) => {
  const intersectionOption = useMemo(() => ({ threshold: [0.001, 0.5, 1] }), []);
  const { entries, observer } = useIntersection(intersectionOption);

  const getAnchor = useCallback(() => {
    if (!container) {
      return {
        currentPage: undefined,
        ratio: 0.5,
      };
    }

    const page = getCurrentPage(container, entries) as HTMLElement;
    const y = container.scrollTop + container.clientHeight / 2;
    const newRatio = (y - page.offsetTop) / page.clientHeight;
    const newAnchor = { currentPage: page, ratio: newRatio };
    return newAnchor;
  }, [container, entries]);

  const [anchor, setAnchor] = useState(getAnchor);

  const resetAnchor = useCallback(() => {
    setAnchor(getAnchor());
  }, [getAnchor]);

  useEffect(resetAnchor, [entries]);

  return { anchor, getAnchor, resetAnchor, observer };
};
