import { atom } from "../deps.ts";
import { correctScrollAtom, scrollElementStateAtom } from "../features/navigation/atoms.ts";
import {
  isFullscreenPreferredPromiseAtom,
  wasImmersiveAtom,
} from "../features/preferences/atoms.ts";
import { maxSizeAtom } from "./create_page_atom.ts";
import { setViewerImmersiveAtom } from "./viewer_atoms.ts";

export const setScrollElementAtom = atom(null, async (get, set, div: HTMLDivElement | null) => {
  const previous = get(scrollElementStateAtom);
  if (previous?.div === div) {
    return;
  }

  previous?.resizeObserver.disconnect();

  if (div === null) {
    set(scrollElementStateAtom, null);
    return;
  }

  const setScrollElementSize = () => {
    const size = div.getBoundingClientRect();
    set(maxSizeAtom, size);
    set(correctScrollAtom);
  };

  const resizeObserver = new ResizeObserver(setScrollElementSize);
  resizeObserver.observe(div);
  resizeObserver.observe(div.firstElementChild!);

  set(scrollElementStateAtom, { div, resizeObserver });
  setScrollElementSize();
  await get(isFullscreenPreferredPromiseAtom);
  await set(setViewerImmersiveAtom, get(wasImmersiveAtom));
});
