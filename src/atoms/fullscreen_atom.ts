import { atom } from "../deps.ts";
import { timeout } from "../utils.ts";
import { setFullscreenElement, showBodyScrollbar } from "./dom/dom_helpers.ts";
import { isFullscreenPreferredAtom, isImmersiveAtom } from "./persistent_atoms.ts";

const fullscreenElementAtom = atom<Element | null>(
  document.fullscreenElement ?? null,
);
export const viewerElementStateAtom = atom<HTMLDivElement | null>(null);

const beforeUnloadStateAtom = atom(false);
const beforeUnloadAtom = atom(null, async (_get, set) => {
  set(beforeUnloadStateAtom, true);
  for (let i = 0; i < 5; i++) {
    await timeout(100);
  }
  set(beforeUnloadStateAtom, false);
});
beforeUnloadAtom.onMount = (set) => {
  addEventListener("beforeunload", set);
  return () => removeEventListener("beforeunload", set);
};

const fullscreenSynchronizationAtom = atom(
  (get) => {
    get(beforeUnloadAtom);
    return get(fullscreenElementAtom);
  },
  (get, set, element: Element | null) => {
    set(fullscreenElementAtom, element);

    const isFullscreenPreferred = get(isFullscreenPreferredAtom);
    if (!isFullscreenPreferred) {
      return;
    }

    const isFullscreen = get(viewerElementStateAtom) === element;
    const wasImmersive = get(cssImmersiveAtom);
    const isViewerFullscreenExit = wasImmersive && !isFullscreen;
    const isNavigationExit = get(beforeUnloadStateAtom);
    if (isViewerFullscreenExit && !isNavigationExit) {
      set(cssImmersiveAtom, false);
    }
  },
);
fullscreenSynchronizationAtom.onMount = (set) => {
  const notify = () => set(document.fullscreenElement ?? null);
  document.addEventListener("fullscreenchange", notify);
  return () => document.removeEventListener("fullscreenchange", notify);
};

export const settableFullscreenElementAtom = atom(
  (get) => get(fullscreenElementAtom),
  async (get, set, element: Element | null) => {
    const fullscreenElement = get(fullscreenSynchronizationAtom);
    if (element === fullscreenElement) {
      return;
    }

    await setFullscreenElement(element);
    set(fullscreenSynchronizationAtom, element);
  },
);

export const viewerFullscreenAtom = atom((get) => {
  const fullscreenElement = get(settableFullscreenElementAtom);
  const viewerElement = get(viewerElementStateAtom);
  return fullscreenElement === viewerElement;
}, async (get, set, value: boolean) => {
  const viewer = get(viewerElementStateAtom);
  await set(settableFullscreenElementAtom, value ? viewer : null);
  set(doubleScrollBarHideAtom);
});

export const doubleScrollBarHideAtom = atom(null, (get) => {
  const shouldRemoveDuplicateScrollBar = !get(viewerFullscreenAtom) && get(isImmersiveAtom);
  showBodyScrollbar(!shouldRemoveDuplicateScrollBar);
});
doubleScrollBarHideAtom.onMount = (set) => set();

export const cssImmersiveAtom = atom(
  (get) => {
    get(doubleScrollBarHideAtom);
    return get(isImmersiveAtom);
  },
  async (get, set, value: boolean) => {
    set(isImmersiveAtom, value);
    set(doubleScrollBarHideAtom);

    const isFullscreenPreferred = get(isFullscreenPreferredAtom);
    if (isFullscreenPreferred) {
      await set(viewerFullscreenAtom, value);
    }

    if (value) {
      get(viewerElementStateAtom)?.focus({ preventScroll: true });
    }
  },
);

export const isFullscreenPreferredSettingsAtom = atom(
  (get) => get(isFullscreenPreferredAtom),
  (get, set, value: boolean) => {
    set(isFullscreenPreferredAtom, value);
    set(doubleScrollBarHideAtom);

    const isImmersive = get(cssImmersiveAtom);
    const shouldEnterFullscreen = value && isImmersive;
    set(viewerFullscreenAtom, shouldEnterFullscreen);
  },
);
