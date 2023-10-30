import { atom, selectAtom, toast } from "../deps.ts";
import { ImageSource, ViewerOptions } from "../types.ts";
import { timeout } from "../utils.ts";
import { createPageAtom, PageAtom } from "./create_page_atom.ts";
import { cssImmersiveAtom, viewerElementAtom, viewerFullscreenAtom } from "./fullscreen_atom.ts";
import { i18nAtom } from "./i18n_atom.ts";
import { fullscreenNoticeCountAtom, isFullscreenPreferredAtom } from "./persistent_atoms.ts";

export const settableViewerElementAtom = atom(
  (get) => get(viewerElementAtom),
  async (get, set, element: HTMLDivElement | null) => {
    set(viewerElementAtom, element);

    const isViewerFullscreen = get(viewerFullscreenAtom);
    const isFullscreenPreferred = get(isFullscreenPreferredAtom);
    const isImmersive = get(cssImmersiveAtom);
    const shouldEnterFullscreen = isFullscreenPreferred && isImmersive;
    if (isViewerFullscreen === shouldEnterFullscreen || !element) {
      return;
    }

    const isUserFullscreen = window.innerHeight === screen.height ||
      window.innerWidth === screen.width;
    if (isUserFullscreen) {
      return;
    }

    try {
      if (shouldEnterFullscreen) {
        await set(viewerFullscreenAtom, true);
      }
    } catch (error) {
      // Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.
      if (error?.message === "Permissions check failed") {
        if (get(fullscreenNoticeCountAtom) >= 3) {
          return;
        }
        toast(get(i18nAtom).fullScreenRestorationGuide);
        await timeout(5000);
        set(fullscreenNoticeCountAtom, (count) => count + 1);
        return;
      }
      throw error;
    }
  },
);

export const viewerModeAtom = atom((get) => {
  const isFullscreen = get(viewerFullscreenAtom);
  const isImmersive = get(cssImmersiveAtom);
  return isFullscreen ? "fullscreen" : isImmersive ? "window" : "normal";
});

type ViewerState =
  & { options: ViewerOptions }
  & ({
    status: "loading" | "error";
  } | {
    status: "complete";
    images: ImageSource[];
    pages: PageAtom[];
  });
export const viewerStateAtom = atom<ViewerState>({
  options: {},
  status: "loading",
});
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

export const toggleImmersiveAtom = atom(null, async (get, set) => {
  await set(cssImmersiveAtom, !get(cssImmersiveAtom));
});

export const blockSelectionAtom = atom(null, (_get, set, event: React.MouseEvent) => {
  if (event.detail >= 2) {
    event.preventDefault();
  }

  if (event.buttons === 3) {
    set(toggleImmersiveAtom);
    event.preventDefault();
  }
});
