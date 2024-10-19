import { atom } from "../deps.ts";
import {
  isFullscreenPreferredPromiseAtom,
  wasImmersiveAtom,
} from "../features/preferences/atoms.ts";
import { maxSizeAtom } from "./create_page_atom.ts";
import {
  restoreScrollAtom,
  scrollElementSizeAtom,
  scrollElementStateAtom,
} from "./navigation_atoms.ts";
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
    set(scrollElementSizeAtom, size);
    set(maxSizeAtom, size);

    Promise.resolve().then(() => set(restoreScrollAtom));
  };

  const resizeObserver = new ResizeObserver(setScrollElementSize);
  resizeObserver.observe(div);

  set(scrollElementStateAtom, { div, resizeObserver });
  setScrollElementSize();
  await get(isFullscreenPreferredPromiseAtom);
  await set(setViewerImmersiveAtom, get(wasImmersiveAtom));
});
