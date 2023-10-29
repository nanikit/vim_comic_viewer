import { atom, RESET } from "../deps.ts";
import { timeout } from "../utils.ts";
import { isFullscreenPreferredAtom, isImmersiveAtom } from "./persistent_atoms.ts";

const fullscreenElementStateAtom = atom<Element | null>(
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
    return get(fullscreenElementStateAtom);
  },
  (get, set, element: Element | null) => {
    set(fullscreenElementStateAtom, element);

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

export const fullscreenElementAtom = atom(
  (get) => get(fullscreenSynchronizationAtom),
  async (get, set, element: Element | null) => {
    const fullscreenElement = get(fullscreenSynchronizationAtom);
    if (element === fullscreenElement) {
      return;
    }

    if (element) {
      await element.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
    set(fullscreenSynchronizationAtom, element);
  },
);
export const viewerFullscreenAtom = atom((get) => {
  const fullscreenElement = get(fullscreenElementAtom);
  const viewerElement = get(viewerElementStateAtom);
  return fullscreenElement === viewerElement;
}, async (get, set, value: boolean) => {
  const viewer = get(viewerElementStateAtom);
  await set(fullscreenElementAtom, value ? viewer : null);
});

const globalCss = document.createElement("style");
globalCss.innerHTML = `html, body {
  overflow: hidden;
}`;
export const preventDoubleScrollBarAtom = atom(null, (get) => {
  const shouldRemoveDuplicateScrollBar = !get(viewerFullscreenAtom) && get(cssImmersiveAtom);
  if (shouldRemoveDuplicateScrollBar) {
    document.head.append(globalCss);
  } else {
    globalCss.remove();
  }
});

export const cssImmersiveAtom = atom(
  (get) => get(isImmersiveAtom),
  (get, set, value: boolean | typeof RESET) => {
    if (value !== RESET) {
      set(isImmersiveAtom, value);
    }
    set(preventDoubleScrollBarAtom);

    if (value) {
      get(viewerElementStateAtom)?.focus();
    }
  },
);
cssImmersiveAtom.onMount = (set) => set(RESET);

export const viewerModeAtom = atom((get) => {
  const isFullscreen = get(viewerFullscreenAtom);
  const isImmersive = get(cssImmersiveAtom);
  return isFullscreen ? "fullscreen" : isImmersive ? "window" : "normal";
});

export const isFullscreenPreferredSettingsAtom = atom(
  (get) => get(isFullscreenPreferredAtom),
  (get, set, value: boolean) => {
    set(isFullscreenPreferredAtom, value);
    set(preventDoubleScrollBarAtom);

    const isImmersive = get(cssImmersiveAtom);
    const shouldEnterFullscreen = value && isImmersive;
    set(viewerFullscreenAtom, shouldEnterFullscreen);
  },
);
