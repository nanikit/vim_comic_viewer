import { atom, selectAtom, toast } from "../deps.ts";
import { ImageSource, ViewerOptions } from "../types.ts";
import { timeout } from "../utils.ts";
import { createPageAtom, PageAtom } from "./create_page_atom.ts";
import {
  cssImmersiveAtom,
  preventDoubleScrollBarAtom,
  viewerElementStateAtom,
  viewerFullscreenAtom,
} from "./fullscreen_atom.ts";
import { i18nAtom } from "./i18n_atom.ts";
import { fullscreenNoticeCountAtom, isFullscreenPreferredAtom } from "./persistent_atoms.ts";

export const viewerElementAtom = atom(
  (get) => get(viewerElementStateAtom),
  async (get, set, element: HTMLDivElement | null) => {
    set(viewerElementStateAtom, element);

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
      set(preventDoubleScrollBarAtom);
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
  const wasImmersive = get(cssImmersiveAtom);
  set(cssImmersiveAtom, !wasImmersive);

  const isFullscreenPreferred = get(isFullscreenPreferredAtom);
  if (!isFullscreenPreferred) {
    return;
  }

  await set(viewerFullscreenAtom, !wasImmersive);
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
