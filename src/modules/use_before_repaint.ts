import { atom, useAtomValue, useLayoutEffect } from "../deps.ts";

export const beforeRepaintAtom = atom<{ task?: () => void }>({});

export const useBeforeRepaint = () => {
  const { task } = useAtomValue(beforeRepaintAtom);

  useLayoutEffect(() => {
    task?.();
  }, [task]);
};
