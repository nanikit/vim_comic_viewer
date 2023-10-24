import { atom, selectAtom } from "../deps.ts";
import { ImageSource, ViewerOptions } from "../types.ts";
import { createPageAtom, PageAtom } from "./create_page_atom.ts";
import { modeAtom } from "./persistent_atoms.ts";

const isViewerFullscreenAtom = atom((get) => {
  const fullscreenElement = get(fullscreenElementAtom);
  const viewerElement = get(viewerElementAtom);
  return fullscreenElement === viewerElement;
});

export const viewerElementStateAtom = atom<HTMLDivElement | null>(null);
export const viewerElementAtom = atom(
  (get) => get(viewerElementStateAtom),
  (get, set, element: HTMLDivElement | null) => {
    set(viewerElementStateAtom, element);

    const isFullscreen = get(isViewerFullscreenAtom);
    const wasFullscreen = get(modeAtom) === "fullscreen";
    const shouldEnterFullscreen = !isFullscreen && wasFullscreen;
    if (element && shouldEnterFullscreen) {
      // Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.
      // set(toggleFullscreenAtom);
    }
  },
);

type ViewerState =
  & { options: ViewerOptions }
  & ({
    status: "loading" | "error";
  } | {
    status: "complete";
    images: ImageSource[];
    pages: PageAtom[];
  });
export const viewerStateAtom = atom<ViewerState>({ options: {}, status: "loading" });
export const pagesAtom = selectAtom(
  viewerStateAtom,
  (state) => (state as { pages?: PageAtom[] }).pages,
);

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
        pages: images.map((source, index) => createPageAtom({ source, index })),
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
export const fullscreenElementAtom = atom(
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
  const isFullscreen = get(isViewerFullscreenAtom);
  await set(fullscreenElementAtom, isFullscreen ? null : get(viewerElementAtom));
  set(modeAtom, isFullscreen ? "normal" : "fullscreen");
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
