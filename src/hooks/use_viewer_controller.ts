import { useAtomValue, useSetAtom } from "jotai";
import { toggleFullscreenAtom } from "../atoms/fullscreen_element_atom.ts";
import { viewerElementAtom } from "../atoms/viewer_atoms.ts";
import { unmountComponentAtNode, useMemo } from "../deps.ts";
import { tampermonkeyApi } from "../services/tampermonkey.ts";
import { ComicSource, ImageSource, ViewerOptions } from "../types.ts";
import { makeDownloader } from "./make_downloader.ts";
import { makePageController } from "./make_page_controller.ts";
import { PageNavigator, usePageNavigator } from "./use_page_navigator.ts";
import { useRerender } from "./use_rerender.ts";

type ViewerStatus = "loading" | "complete" | "error";

const makeViewerController = (
  { viewer, navigator, rerender, toggleFullscreen }: {
    viewer: HTMLDivElement | null;
    navigator: PageNavigator;
    rerender: () => void;
    toggleFullscreen: () => Promise<void>;
  },
) => {
  const compactPageKey = "vim_comic_viewer.single_page_count";
  let options = {} as ViewerOptions;
  let images = [] as ImageSource[];
  let status = "loading" as ViewerStatus;
  let compactWidthIndex = tampermonkeyApi.GM_getValue?.(compactPageKey, 1) ?? 1;
  let downloader: ReturnType<typeof makeDownloader> | undefined;
  let pages = [] as ReturnType<typeof makePageController>[];

  const loadImages = async (source?: ComicSource) => {
    try {
      [images, downloader] = [[], undefined];
      if (!source) {
        status = "complete";
        return;
      }

      [status, pages] = ["loading", []];
      rerender();
      images = await source();

      if (!Array.isArray(images)) {
        throw new Error(`Invalid comic source type: ${typeof images}`);
      }

      status = "complete";
      downloader = makeDownloader(images);
      pages = images.map((x) => makePageController({ source: x, observer: navigator.observer }));
    } catch (error) {
      status = "error";
      console.error(error);
      throw error;
    } finally {
      rerender();
    }
  };

  const reloadErrored = () => {
    window.stop();

    for (const controller of pages) {
      if (controller.state.state !== "complete") {
        controller.reload();
      }
    }
  };

  return {
    get options() {
      return options;
    },
    get status() {
      return status;
    },
    get container() {
      return viewer;
    },
    get compactWidthIndex() {
      return compactWidthIndex;
    },
    get downloader() {
      return downloader;
    },
    get download() {
      return downloader?.download ?? (() => Promise.resolve(new Uint8Array()));
    },
    get pages() {
      return pages;
    },
    set compactWidthIndex(value) {
      compactWidthIndex = Math.max(0, value);
      tampermonkeyApi.GM_setValue?.(compactPageKey, compactWidthIndex);
      rerender();
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
  const rerender = useRerender();
  const navigator = usePageNavigator();
  const toggleFullscreen = useSetAtom(toggleFullscreenAtom);
  const viewer = useAtomValue(viewerElementAtom);
  const controller = useMemo(
    () => makeViewerController({ viewer, toggleFullscreen, navigator, rerender }),
    [viewer, navigator],
  );
  return controller;
};
