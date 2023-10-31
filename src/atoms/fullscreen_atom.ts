import { atom, RESET } from "../deps.ts";
import { timeout } from "../utils.ts";
import { focusWithoutScroll, setFullscreenElement, showBodyScrollbar } from "./dom/dom_helpers.ts";
import { isFullscreenPreferredAtom, isImmersiveAtom } from "./persistent_atoms.ts";

export const fullscreenElementAtom = atom<Element | null>(
  document.fullscreenElement ?? null,
);
export const viewerElementAtom = atom<HTMLDivElement | null>(null);

const isViewerFullscreenAtom = atom((get) => get(fullscreenElementAtom) === get(viewerElementAtom));

const doubleScrollBarHidingAtom = atom(null, (get) => {
  const shouldRemoveDuplicateScrollBar = !get(isViewerFullscreenAtom) && get(isImmersiveAtom);
  showBodyScrollbar(!shouldRemoveDuplicateScrollBar);
});
doubleScrollBarHidingAtom.onMount = (set) => set();

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

const cssImmersiveAtom = atom(
  (get) => {
    get(doubleScrollBarHidingAtom);
    return get(isImmersiveAtom);
  },
  (get, set, value: boolean | typeof RESET) => {
    if (value === RESET) {
      if (get(isImmersiveAtom)) {
        focusWithoutScroll(get(viewerElementAtom));
      }
      return;
    }

    set(isImmersiveAtom, value);
    set(doubleScrollBarHidingAtom);
    if (value) {
      focusWithoutScroll(get(viewerElementAtom));
    }
  },
);
cssImmersiveAtom.onMount = (set) => void set(RESET);

const isBeforeUnloadAtom = atom(false);
const beforeUnloadAtom = atom(null, async (_get, set) => {
  set(isBeforeUnloadAtom, true);
  for (let i = 0; i < 5; i++) {
    await timeout(100);
  }
  set(isBeforeUnloadAtom, false);
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
    if (!get(isFullscreenPreferredAtom)) {
      return;
    }

    const isFullscreen = get(viewerElementAtom) === element;
    const wasImmersive = get(cssImmersiveAtom);
    const isViewerFullscreenExit = wasImmersive && !isFullscreen;
    const isNavigationExit = get(isBeforeUnloadAtom);
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

export const fullscreenAwareImmersiveAtom = atom(
  (get) => {
    get(fullscreenSynchronizationAtom);
    return get(cssImmersiveAtom);
  },
  async (get, set, value: boolean) => {
    set(cssImmersiveAtom, value);

    const isFullscreenPreferred = get(isFullscreenPreferredAtom);
    if (isFullscreenPreferred) {
      await set(viewerFullscreenAtom, value);
    }
  },
);

export const isFullscreenPreferredSettingsAtom = atom(
  (get) => get(isFullscreenPreferredAtom),
  (get, set, value: boolean) => {
    set(isFullscreenPreferredAtom, value);
    set(doubleScrollBarHidingAtom);

    const isImmersive = get(cssImmersiveAtom);
    const shouldEnterFullscreen = value && isImmersive;
    set(viewerFullscreenAtom, shouldEnterFullscreen);
  },
);
