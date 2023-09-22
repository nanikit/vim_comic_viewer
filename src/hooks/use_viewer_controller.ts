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

const makeViewerController = (
  { viewer, navigator, store, toggleFullscreen }: {
    viewer: HTMLDivElement | null;
    navigator: PageNavigator;
    store: ReturnType<typeof useStore>;
    toggleFullscreen: () => Promise<void>;
  },
) => {
  let options = {} as ViewerOptions;
  let downloader: ReturnType<typeof makeDownloader> | undefined;

  const loadImages = async (source?: ComicSource) => {
    try {
      downloader = undefined;
      if (!source) {
        store.set(viewerStateAtom, { status: "complete", pages: [] });
        return;
      }

      store.set(viewerStateAtom, { status: "loading" });
      const images = await source();

      if (!Array.isArray(images)) {
        throw new Error(`Invalid comic source type: ${typeof images}`);
      }

      downloader = makeDownloader(images);
      const pages = images.map((x) =>
        makePageController({ source: x, observer: navigator.observer })
      );
      store.set(viewerStateAtom, { status: "complete", pages });
    } catch (error) {
      store.set(viewerStateAtom, (state) => ({ ...state, status: "error" }));
      console.error(error);
      throw error;
    }
  };

  const reloadErrored = () => {
    window.stop();

    const viewer = store.get(viewerStateAtom) as {
      pages?: ReturnType<typeof makePageController>[];
    };
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
      return downloader;
    },
    get download() {
      return downloader?.download ?? (() => Promise.resolve(new Uint8Array()));
    },
    get pages() {
      return (store.get(viewerStateAtom) as {
        pages?: ReturnType<typeof makePageController>[];
      }).pages;
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
