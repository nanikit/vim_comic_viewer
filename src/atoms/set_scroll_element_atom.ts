import { atom } from "../deps.ts";
import {
  correctScrollAtom,
  goNextAtom,
  goPreviousAtom,
  scrollElementStateAtom,
} from "../features/navigation/atoms.ts";
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

  div.addEventListener("wheel", navigateWithWheel);

  function navigateWithWheel(event: WheelEvent) {
    const unit = event.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? 10 : 1;
    const diff = event.deltaY / unit;
    if (diff >= 1) {
      set(goNextAtom);
    } else if (diff <= -1) {
      set(goPreviousAtom);
    }

    event.preventDefault();
    event.stopPropagation();
  }

  set(scrollElementStateAtom, { div, resizeObserver });
  setScrollElementSize();
  await get(isFullscreenPreferredPromiseAtom);
  await set(setViewerImmersiveAtom, get(wasImmersiveAtom));

  return () => {
    div.removeEventListener("wheel", navigateWithWheel);
  };
});
