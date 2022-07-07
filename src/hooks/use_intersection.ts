import { useCallback, useEffect, useRef, useState } from "../deps.ts";

const useIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): IntersectionObserver | undefined => {
  const [observer, setObserver] = useState<IntersectionObserver>();

  useEffect(() => {
    const newObserver = new IntersectionObserver(callback, options);
    setObserver(newObserver);
    return () => newObserver.disconnect();
  }, [callback, options]);

  return observer;
};

export const useIntersection = <T>(
  callback: (entries: IntersectionObserverEntry[]) => T,
  options?: IntersectionObserverInit,
): IntersectionObserver | undefined => {
  const memo = useRef(new Map<Element, IntersectionObserverEntry>());

  const filterIntersections = useCallback(
    (newEntries: IntersectionObserverEntry[]) => {
      const memoized = memo.current;
      for (const entry of newEntries) {
        if (entry.isIntersecting) {
          memoized.set(entry.target, entry);
        } else {
          memoized.delete(entry.target);
        }
      }
      callback([...memoized.values()]);
    },
    [callback],
  );

  return useIntersectionObserver(filterIntersections, options);
};
