import { atom } from "../deps.ts";
import { ViewerOptions } from "../types.ts";
import { createPageAtom } from "./create_page_atom.ts";
import { pagesAtom, viewerElementAtom, viewerStateAtom } from "./viewer_state_atoms.ts";

export const setViewerOptionsAtom = atom(
  null,
  async (get, set, options: ViewerOptions) => {
    try {
      const { source } = options;
      if (source === get(viewerStateAtom).options.source) {
        return;
      }

      if (!source) {
        set(viewerStateAtom, (state) => ({
          ...state,
          status: "complete",
          images: [],
          pages: [],
        }));
        return;
      }

      set(viewerStateAtom, (state) => ({ ...state, status: "loading" }));
      const images = await source();

      if (!Array.isArray(images)) {
        throw new Error(`Invalid comic source type: ${typeof images}`);
      }

      set(viewerStateAtom, (state) => ({
        ...state,
        status: "complete",
        images,
        pages: images.map((source) => createPageAtom({ source })),
      }));
    } catch (error) {
      set(viewerStateAtom, (state) => ({ ...state, status: "error" }));
      console.error(error);
      throw error;
    }
  },
);

export const reloadErroredAtom = atom(null, (get, set) => {
  window.stop();

  const pages = get(pagesAtom);
  for (const atom of pages ?? []) {
    const page = get(atom);
    if (page.state.state !== "complete") {
      set(page.reloadAtom);
    }
  }
});

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

export const blockSelectionAtom = atom(null, (_get, set, event: React.MouseEvent) => {
  if (event.detail >= 2) {
    event.preventDefault();
  }

  if (event.buttons === 3) {
    set(toggleFullscreenAtom);
    event.preventDefault();
  }
});
