import { useAtomValue, useSetAtom } from "jotai";
import {
  goNextAtom,
  goPreviousAtom,
  restoreScrollAtom,
  scrollElementAtom,
} from "../atoms/viewer_atoms.ts";
import { useEffect, useRef, useState } from "../deps.ts";

const useResize = <T, E extends Element>(
  target: E | null,
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

export type PageNavigator = {
  goPrevious: () => void;
  goNext: () => void;
};

export const usePageNavigator = (): PageNavigator => {
  const div = useAtomValue(scrollElementAtom);
  useResize(div, useSetAtom(restoreScrollAtom));

  return {
    goPrevious: useSetAtom(goPreviousAtom),
    goNext: useSetAtom(goNextAtom),
  };
};
