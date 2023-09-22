import { useSetAtom } from "jotai";
import { goNextAtom, goPreviousAtom } from "../atoms/viewer_atoms.ts";

export type PageNavigator = {
  goPrevious: () => void;
  goNext: () => void;
};

export const usePageNavigator = (): PageNavigator => {
  return {
    goPrevious: useSetAtom(goPreviousAtom),
    goNext: useSetAtom(goNextAtom),
  };
};
