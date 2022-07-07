import { MutableRefObject, unmountComponentAtNode, useMemo } from "../deps.ts";
import { ComicSource, ImageSource, ViewerOptions } from "../types.ts";
import { makeDownloader } from "./make_downloader.ts";
import { makePageController } from "./make_page_controller.ts";
import { PageNavigator, usePageNavigator } from "./use_page_navigator.ts";
import { useRerender } from "./use_rerender.ts";

type ViewerStatus = "loading" | "complete" | "error";

const makeViewerController = (
  { ref, navigator, rerender }: {
    ref: MutableRefObject<HTMLDivElement | undefined>;
    navigator: PageNavigator;
    rerender: () => void;
  },
) => {
  let options = {} as ViewerOptions;
  let images = [] as ImageSource[];
  let status = "loading" as ViewerStatus;
  let compactWidthIndex = 1;
  let downloader: ReturnType<typeof makeDownloader> | undefined;
  let pages = [] as ReturnType<typeof makePageController>[];

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      ref.current?.requestFullscreen();
    }
  };

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
      pages = images.map((x) =>
        makePageController({ source: x, observer: navigator.observer })
      );
    } catch (error) {
      status = "error";
      console.log(error);
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
      return ref.current;
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
      compactWidthIndex = value;
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
    unmount: () => unmountComponentAtNode(ref.current!),
  };
};

export const useViewerController = ({ ref, scrollRef }: {
  ref: MutableRefObject<HTMLDivElement | undefined>;
  scrollRef: MutableRefObject<HTMLDivElement | undefined>;
}): ReturnType<typeof makeViewerController> => {
  const rerender = useRerender();
  const navigator = usePageNavigator(scrollRef);
  const controller = useMemo(
    () => makeViewerController({ ref, navigator, rerender }),
    [ref, navigator],
  );
  return controller;
};
