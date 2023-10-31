import { atom } from "../deps.ts";
import { setFullscreenElement, showBodyScrollbar } from "./dom/dom_helpers.ts";
import { isFullscreenPreferredAtom, isImmersiveAtom } from "./persistent_atoms.ts";

export const fullscreenElementAtom = atom<Element | null>(
  document.fullscreenElement ?? null,
);
export const viewerElementAtom = atom<HTMLDivElement | null>(null);

const isViewerFullscreenAtom = atom((get) => get(fullscreenElementAtom) === get(viewerElementAtom));

export const doubleScrollBarHidingAtom = atom(null, (get) => {
  const shouldRemoveDuplicateScrollBar = !get(isViewerFullscreenAtom) && get(isImmersiveAtom);
  showBodyScrollbar(!shouldRemoveDuplicateScrollBar);
});

export const viewerFullscreenAtom = atom((get) => {
  return get(isViewerFullscreenAtom);
}, async (get, set, value: boolean) => {
  const element = value ? get(viewerElementAtom) : null;
  const fullscreenElement = get(fullscreenElementAtom);
  if (element === fullscreenElement) {
    return;
  }

  await setFullscreenElement(element);
  set(fullscreenElementAtom, element);
  set(doubleScrollBarHidingAtom);
});

export const isFullscreenPreferredSettingsAtom = atom(
  (get) => get(isFullscreenPreferredAtom),
  (get, set, value: boolean) => {
    set(isFullscreenPreferredAtom, value);
    set(doubleScrollBarHidingAtom);

    const isImmersive = get(isImmersiveAtom);
    const shouldEnterFullscreen = value && isImmersive;
    set(viewerFullscreenAtom, shouldEnterFullscreen);
  },
);
