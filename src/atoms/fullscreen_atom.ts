import { atom, ExtractAtomValue } from "../deps.ts";
import { hideBodyScrollBar, setFullscreenElement } from "./dom/dom_helpers.ts";
import { isFullscreenPreferredAtom, isImmersiveAtom } from "./persistent_atoms.ts";

const fullscreenElementAtom = atom<Element | null>(null);
const viewerElementAtom = atom<HTMLDivElement | null>(null);

export const isViewerFullscreenAtom = atom((get) =>
  get(fullscreenElementAtom) === get(viewerElementAtom)
);

type ScrollBarFactors = {
  fullscreenElement?: ExtractAtomValue<typeof fullscreenElementAtom>;
  viewerElement?: ExtractAtomValue<typeof viewerElementAtom>;
  isImmersive?: ExtractAtomValue<typeof isImmersiveAtom>;
};
export const scrollBarStyleFactorAtom = atom(
  (get) => ({
    fullscreenElement: get(fullscreenElementAtom),
    viewerElement: get(viewerElementAtom),
    isImmersive: get(isImmersiveAtom),
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
      set(isImmersiveAtom, isImmersive);
    }

    const canScrollBarDuplicate = !get(isViewerFullscreenAtom) && get(isImmersiveAtom);
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

  await setFullscreenElement(element);
});

export const isFullscreenPreferredSettingsAtom = atom(
  (get) => get(isFullscreenPreferredAtom),
  async (get, set, value: boolean) => {
    set(isFullscreenPreferredAtom, value);

    const isImmersive = get(isImmersiveAtom);
    const shouldEnterFullscreen = value && isImmersive;
    await set(viewerFullscreenAtom, shouldEnterFullscreen);
  },
);
