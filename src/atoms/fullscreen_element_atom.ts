import { atom } from "jotai";
import { viewerElementAtom } from "./viewer_atoms.ts";

const fullscreenElementStateAtom = atom<Element | null>(
  document.fullscreenElement ?? null,
);
fullscreenElementStateAtom.onMount = (set) => {
  const notify = () => set(document.fullscreenElement ?? null);
  document.addEventListener("fullscreenchange", notify);
  return () => document.removeEventListener("fullscreenchange", notify);
};
export const fullScreenElementAtom = atom(
  (get) => get(fullscreenElementStateAtom),
  async (get, set, element: Element | null) => {
    const fullscreenElement = get(fullscreenElementStateAtom);
    if (element === fullscreenElement) {
      return;
    }

    if (element) {
      await element.requestFullscreen?.();
      const viewer = get(viewerElementAtom);
      if (viewer === element) {
        viewer.focus();
      }
    } else {
      await document.exitFullscreen?.();
    }
    set(fullscreenElementStateAtom, element);
  },
);

export const toggleFullscreenAtom = atom(null, async (get, set) => {
  const fullscreen = get(fullScreenElementAtom);
  await set(fullScreenElementAtom, fullscreen ? null : get(viewerElementAtom));
});
