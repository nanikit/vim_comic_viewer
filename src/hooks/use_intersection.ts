import { useCallback, useEffect, useRef, useState } from '../vendors/react.ts';

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

export const useIntersection = (
  options?: IntersectionObserverInit,
): {
  entries: IntersectionObserverEntry[];
  observer?: IntersectionObserver;
} => {
  const [entries, setEntries] = useState([] as IntersectionObserverEntry[]);

  const memo = useRef(new Map<Element, IntersectionObserverEntry>());

  const recordIntersection = useCallback((newEntries: IntersectionObserverEntry[]) => {
    const memoized = memo.current;
    for (const entry of newEntries) {
      if (entry.isIntersecting) {
        memoized.set(entry.target, entry);
      } else {
        memoized.delete(entry.target);
      }
    }
    setEntries([...memoized.values()]);
  }, []);

  const observer = useIntersectionObserver(recordIntersection, options);

  return { entries, observer };
};
