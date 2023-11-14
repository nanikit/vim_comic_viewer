import { atom, Deferred, deferred, ExtractAtomValue } from "../deps.ts";
import { hideBodyScrollBar, setFullscreenElement } from "./dom/dom_helpers.ts";
import { isFullscreenPreferredAtom, wasImmersiveAtom } from "./persistent_atoms.ts";

const fullscreenElementAtom = atom<Element | null>(null);
const viewerElementAtom = atom<HTMLDivElement | null>(null);

export const isViewerFullscreenAtom = atom((get) => {
  const viewerElement = get(viewerElementAtom);
  return !!viewerElement && viewerElement === get(fullscreenElementAtom);
});

const isImmersiveAtom = atom(false);
export const isViewerImmersiveAtom = atom((get) => get(isImmersiveAtom));

type ScrollBarFactors = {
  fullscreenElement?: ExtractAtomValue<typeof fullscreenElementAtom>;
  viewerElement?: ExtractAtomValue<typeof viewerElementAtom>;
  isImmersive?: ExtractAtomValue<typeof wasImmersiveAtom>;
};
export const scrollBarStyleFactorAtom = atom(
  (get) => ({
    fullscreenElement: get(fullscreenElementAtom),
    viewerElement: get(viewerElementAtom),
  }),
  (get, set, factors: ScrollBarFactors) => {
    const { fullscreenElement, viewerElement, isImmersive } = factors;
    if (fullscreenElement !== undefined) {
      set(fullscreenElementAtom, fullscreenElement);
    }
    if (viewerElement !== undefined) {
      set(viewerElementAtom, viewerElement);
    }
    if (isImmersive !== undefined) {
      set(wasImmersiveAtom, isImmersive);
      set(isImmersiveAtom, isImmersive);
    }

    const canScrollBarDuplicate = !get(isViewerFullscreenAtom) && get(wasImmersiveAtom);
    hideBodyScrollBar(canScrollBarDuplicate);
  },
);
scrollBarStyleFactorAtom.onMount = (set) => set({});

export const viewerFullscreenAtom = atom((get) => {
  return get(isViewerFullscreenAtom);
}, async (get, _set, value: boolean) => {
  const element = value ? get(viewerElementAtom) : null;
  const { fullscreenElement } = get(scrollBarStyleFactorAtom);
  if (element === fullscreenElement) {
    return;
  }

  const fullscreenChange = new Promise((resolve) => {
    addEventListener("fullscreenchange", resolve, { once: true });
  });
  await setFullscreenElement(element);
  await fullscreenChange;
});

const transitionDeferredAtom = atom<{ deferred?: Deferred<void> }>({});
export const transitionLockAtom = atom(null, async (get, set) => {
  const { deferred: previousLock } = get(transitionDeferredAtom);
  const lock = deferred<void>();
  set(transitionDeferredAtom, { deferred: lock });
  await previousLock;
  return { deferred: lock };
});

export const isFullscreenPreferredSettingsAtom = atom(
  (get) => get(isFullscreenPreferredAtom),
  async (get, set, value: boolean) => {
    set(isFullscreenPreferredAtom, value);

    const lock = await set(transitionLockAtom);
    try {
      const wasImmersive = get(wasImmersiveAtom);
      const shouldEnterFullscreen = value && wasImmersive;
      await set(viewerFullscreenAtom, shouldEnterFullscreen);
    } finally {
      lock.deferred.resolve();
    }
  },
);
