import { useCallback, useEffect, useMemo, useState } from '../vendors/react.ts';

type IntersectedPages = {
  isSorted: boolean;
  entries: IntersectionObserverEntry[];
};

export const usePageNavigator = () => {
  const [observer, setObserver] = useState<IntersectionObserver>();
  const [captures] = useState([{ entries: [], isSorted: true }] as IntersectedPages[]);

  const sortAndGetAnchor = useCallback(
    (pages: IntersectedPages) => {
      const first = pages.entries?.[0]?.target;
      if (!pages.isSorted && !!first) {
        const children = [
          ...((first.parentElement!.children as unknown) as Iterable<Element>),
        ];
        pages.entries.sort((a, b) => {
          const aRatio = Math.round(a.intersectionRatio * 10);
          const bRatio = Math.round(b.intersectionRatio * 10);
          const aIndex = children.indexOf(a.target);
          const bIndex = children.indexOf(b.target);
          return (bRatio - aRatio) * 10 + (bIndex - aIndex);
        });
        pages.isSorted = true;
      }
      return pages.entries?.[0]?.target;
    },
    [captures],
  );

  const goNext = useCallback(() => {
    const anchor = sortAndGetAnchor(captures[0]);
    if (!anchor) {
      return;
    }

    let cursor = anchor;
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
  }, [sortAndGetAnchor]);

  const goPrevious = useCallback(() => {
    const anchor = sortAndGetAnchor(captures[0]);
    if (!anchor) {
      return;
    }

    let cursor = anchor;
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
  }, [sortAndGetAnchor]);

  const restore = useCallback(() => {
    const anchor = sortAndGetAnchor(captures[1]);
    if (!anchor) {
      return;
    }

    anchor.scrollIntoView({ block: 'center' });
  }, [captures, sortAndGetAnchor]);

  useEffect(() => {
    const newObserver = new IntersectionObserver(
      (entries) => {
        let newIntersections = captures[0].entries;
        for (const entry of entries) {
          newIntersections = newIntersections.filter(
            (item) => item.target !== entry.target,
          );
          if (entry.isIntersecting) {
            newIntersections.push(entry);
          }
        }
        captures.unshift({
          entries: newIntersections,
          isSorted: false,
        });
        captures.splice(2);
        console.log(captures[0].entries);
      },
      {
        threshold: [0.01, 0.5],
      },
    );
    setObserver(newObserver);
    return () => newObserver.disconnect();
  }, [captures]);

  return useMemo(
    () => ({
      goNext,
      goPrevious,
      restore,
      observer,
    }),
    [goNext, goPrevious, restore, observer],
  );
};
