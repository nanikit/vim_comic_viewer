import { atom } from "jotai";
import { createPageAtom } from "../hooks/create_page_atom.ts";
import { makeDownloader } from "../hooks/make_downloader.ts";
import { PageNavigator } from "../hooks/use_page_navigator.ts";
import { ViewerOptions } from "../types.ts";
import { gmValueAtom } from "./helper/gm_value_atom.ts";

export const viewerElementAtom = atom<HTMLDivElement | null>(null);
export const scrollElementAtom = atom<HTMLDivElement | null>(null);

export const backgroundColorAtom = gmValueAtom("vim_comic_viewer.background_color", "#eeeeee");
export const compactWidthIndexAtom = gmValueAtom("vim_comic_viewer.single_page_count", 1);

type ViewerState =
  & { options: ViewerOptions }
  & ({
    status: "loading" | "error";
  } | {
    status: "complete";
    pages: ReturnType<typeof createPageAtom>[];
    downloader: ReturnType<typeof makeDownloader>;
  });
export const viewerStateAtom = atom<ViewerState>({ options: {}, status: "loading" });
export const setViewerOptionsAtom = atom(
  null,
  async (get, set, options: ViewerOptions, navigator: PageNavigator) => {
    try {
      const { source } = options;
      if (source === get(viewerStateAtom).options.source) {
        return;
      }

      if (!source) {
        set(viewerStateAtom, (state) => ({
          ...state,
          status: "complete",
          pages: [],
          downloader: makeDownloader([]),
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
        pages: images.map((x) => createPageAtom({ source: x, observer: navigator.observer })),
        downloader: makeDownloader(images),
      }));
    } catch (error) {
      set(viewerStateAtom, (state) => ({ ...state, status: "error" }));
      console.error(error);
      throw error;
    }
  },
);
