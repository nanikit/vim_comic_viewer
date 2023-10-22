import { useAtomValue, useSetAtom, useStore } from "jotai";
import { toggleFullscreenAtom } from "../atoms/fullscreen_element_atom.ts";
import {
  compactWidthIndexAtom,
  viewerElementAtom,
  viewerStateAtom,
} from "../atoms/viewer_atoms.ts";
import { unmountComponentAtNode, useMemo } from "../deps.ts";
import { ComicSource, ViewerOptions } from "../types.ts";
import { makeDownloader } from "./make_downloader.ts";
import { makePageController } from "./make_page_controller.ts";
import { PageNavigator, usePageNavigator } from "./use_page_navigator.ts";

type MaybeDownloader = { downloader?: ReturnType<typeof makeDownloader> };
type MaybePages = { pages?: ReturnType<typeof makePageController>[] };

const makeViewerController = (
  { viewer, navigator, store, toggleFullscreen }: {
    viewer: HTMLDivElement | null;
    navigator: PageNavigator;
    store: ReturnType<typeof useStore>;
    toggleFullscreen: () => Promise<void>;
  },
) => {
  let options = {} as ViewerOptions;

  const loadImages = async (source?: ComicSource) => {
    try {
      if (!source) {
        store.set(viewerStateAtom, {
          status: "complete",
          pages: [],
          downloader: makeDownloader([]),
        });
        return;
      }

      store.set(viewerStateAtom, { status: "loading" });
      const images = await source();

      if (!Array.isArray(images)) {
        throw new Error(`Invalid comic source type: ${typeof images}`);
      }

      store.set(viewerStateAtom, {
        status: "complete",
        pages: images.map((x) => makePageController({ source: x, observer: navigator.observer })),
        downloader: makeDownloader(images),
      });
    } catch (error) {
      store.set(viewerStateAtom, (state) => ({ ...state, status: "error" }));
      console.error(error);
      throw error;
    }
  };

  const reloadErrored = () => {
    window.stop();

    const viewer = store.get(viewerStateAtom) as MaybePages;
    for (const page of viewer?.pages ?? []) {
      if (page.state.state !== "complete") {
        page.reload();
      }
    }
  };

  return {
    get options() {
      return options;
    },
    get status() {
      return store.get(viewerStateAtom).status;
    },
    get container() {
      return viewer;
    },
    get compactWidthIndex() {
      return store.get(compactWidthIndexAtom);
    },
    get downloader() {
      return (store.get(viewerStateAtom) as MaybeDownloader).downloader;
    },
    get download() {
      const { downloader } = store.get(viewerStateAtom) as MaybeDownloader;
      return downloader?.download ?? (() => Promise.resolve(new Uint8Array()));
    },
    get pages() {
      return (store.get(viewerStateAtom) as MaybePages).pages;
    },
    set compactWidthIndex(value) {
      store.set(compactWidthIndexAtom, Math.max(0, value));
    },

    setOptions: async (value: ViewerOptions) => {
      const { source } = value;
      const isSourceChanged = source !== options.source;
      options = value;

      if (isSourceChanged) {
        await loadImages(source);
      }
    },

    goPrevious: navigator.goPrevious,
    goNext: navigator.goNext,
    toggleFullscreen,
    reloadErrored,
    unmount: () => unmountComponentAtNode(viewer!),
  };
};

export const useViewerController = (): ReturnType<
  typeof makeViewerController
> => {
  const store = useStore();
  const navigator = usePageNavigator();
  const toggleFullscreen = useSetAtom(toggleFullscreenAtom);
  const viewer = useAtomValue(viewerElementAtom);
  const controller = useMemo(
    () => makeViewerController({ viewer, toggleFullscreen, navigator, store }),
    [viewer, navigator],
  );
  return controller;
};
