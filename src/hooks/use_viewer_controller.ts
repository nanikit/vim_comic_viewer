import { ComicSource, ImageSource, ViewerOptions } from "../types.ts";
import { MutableRefObject, useMemo } from "react";
import { unmountComponentAtNode } from "react-dom";
import { PageNavigator, usePageNavigator } from "./use_page_navigator.ts";
import { useRerender } from "./use_rerender.ts";
import { makeDownloader } from "./make_downloader.ts";

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

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      ref.current?.requestFullscreen();
    }
  };

  const loadImages = async (source?: ComicSource) => {
    try {
      if (!source) {
        [status, images, downloader] = ["complete", [], undefined];
        return;
      }

      [status, images] = ["loading", []];
      rerender();
      images = await source();

      if (!Array.isArray(images)) {
        console.log(`Invalid comic source type: ${typeof images}`);
        status = "error";
        return;
      }

      [status, images, downloader] = [
        "complete",
        images,
        makeDownloader(images),
      ];
    } catch (error) {
      status = "error";
      console.log(error);
      throw error;
    } finally {
      rerender();
    }
  };

  return {
    get options() {
      return options;
    },
    get images() {
      return images;
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

    navigator,
    goPrevious: navigator.goPrevious,
    goNext: navigator.goNext,
    toggleFullscreen,
    unmount: () => unmountComponentAtNode(ref.current!),
  };
};

export const useViewerController = ({ ref, scrollRef }: {
  ref: MutableRefObject<HTMLDivElement | undefined>;
  scrollRef: MutableRefObject<HTMLDivElement | undefined>;
}) => {
  const rerender = useRerender();
  const navigator = usePageNavigator(scrollRef);
  const controller = useMemo(
    () => makeViewerController({ ref, navigator, rerender }),
    [ref, navigator],
  );
  return controller;
};
