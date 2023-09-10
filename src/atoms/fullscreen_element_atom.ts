import { atom } from "jotai";

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
  (_get, set, element: Element | null) => {
    if (element) {
      element.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    set(fullscreenElementStateAtom, element);
  },
);
