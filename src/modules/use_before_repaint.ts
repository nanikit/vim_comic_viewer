import { atom, useAtom, useLayoutEffect } from "../deps.ts";

export const beforeRepaintAtom = atom<{ task?: () => void }>({});

export const useBeforeRepaint = () => {
  const [{ task }, set] = useAtom(beforeRepaintAtom);

  useLayoutEffect(() => {
    set({});
    task?.();
  }, [task]);
};
