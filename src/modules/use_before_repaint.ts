import { useSetAtom } from "jotai";
import { loggerAtom } from "../atoms/logger_atom.ts";
import { atom, useAtomValue, useLayoutEffect } from "../deps.ts";

export const beforeRepaintAtom = atom<{ task?: () => void }>({});

export const useBeforeRepaint = () => {
  const { task } = useAtomValue(beforeRepaintAtom);
  const logger = useSetAtom(loggerAtom);

  useLayoutEffect(() => {
    logger({ event: "before repaint" });
    task?.();
  }, [task]);
};
