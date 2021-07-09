import { download, DownloadOptions } from "../services/downloader.ts";
import { ComicSource, ImageSource, ViewerOptions } from "../types.ts";
import { MutableRefObject, useMemo, useReducer } from "react";
import { unmountComponentAtNode } from "react-dom";
import { PageNavigator, usePageNavigator } from "./use_page_navigator.ts";
import { save } from "../utils.ts";

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
  let aborter = new AbortController();
  let compactWidthIndex = 1;

  const startDownload = (options?: DownloadOptions) => {
    if (!images.length) {
      return;
    }

    aborter = new AbortController();
    return download(images, { ...options, signal: aborter.signal });
  };

  const downloadAndSave = async (options?: DownloadOptions) => {
    const zip = await startDownload(options);
    if (zip) {
      await save(new Blob([zip]));
    }
  };

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
        [status, images] = ["complete", []];
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

      [status, images] = ["complete", images];
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
    set compactWidthIndex(value) {
      compactWidthIndex = value;
      rerender();
    },

    cancelDownload: () => {
      aborter.abort();
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
    download: startDownload,
    downloadAndSave,
    unmount: () => unmountComponentAtNode(ref.current!),
  };
};

export const useViewerController = ({ ref, scrollRef }: {
  ref: MutableRefObject<HTMLDivElement | undefined>;
  scrollRef: MutableRefObject<HTMLDivElement | undefined>;
}) => {
  const [, rerender] = useReducer(() => ({}), {});
  const navigator = usePageNavigator(scrollRef);
  const controller = useMemo(
    () => makeViewerController({ ref, navigator, rerender }),
    [ref, navigator],
  );
  return controller;
};
