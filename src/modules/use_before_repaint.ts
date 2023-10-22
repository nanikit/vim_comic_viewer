import { atom, Deferred, deferred, useAtomValue, useLayoutEffect } from "../deps.ts";

const beforeRepaintStateAtom = atom<{ repaint: Deferred<unknown> | null }>({ repaint: null });
export const beforeRepaintAtom = atom((get) => get(beforeRepaintStateAtom), async (get, set) => {
  const { repaint } = get(beforeRepaintStateAtom);
  if (repaint?.state === "pending") {
    await repaint;
  } else {
    const newRepaint = deferred();
    set(beforeRepaintStateAtom, { repaint: newRepaint });
    await newRepaint;
  }
});

export const useBeforeRepaint = () => {
  const { repaint } = useAtomValue(beforeRepaintAtom);

  useLayoutEffect(() => {
    repaint?.resolve(null);
  }, [repaint]);
};
