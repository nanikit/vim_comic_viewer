import { atom } from "../deps.ts";
import { maxSizeAtom } from "./create_page_atom.ts";
import {
  restoreScrollAtom,
  scrollElementSizeAtom,
  scrollElementStateAtom,
} from "./navigation_atoms.ts";

export const setScrollElementAtom = atom(null, (_get, set, div: HTMLDivElement | null) => {
  set(scrollElementStateAtom, (previous) => {
    if (previous?.div === div) {
      return previous;
    }

    previous?.resizeObserver.disconnect();

    if (div === null) {
      return null;
    }

    const setScrollElementSize = () => {
      const size = { width: div.clientWidth, height: div.clientHeight };
      set(scrollElementSizeAtom, size);
      set(maxSizeAtom, size);
    };

    setScrollElementSize();
    const resizeObserver = new ResizeObserver(() => {
      setScrollElementSize();
      set(restoreScrollAtom);
    });
    resizeObserver.observe(div);

    return { div, resizeObserver };
  });
});
