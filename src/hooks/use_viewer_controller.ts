import { download, DownloadOptions } from "../services/downloader.ts";
import { ComicSource, ImageSource, ViewerOptions } from "../types.ts";
import { MutableRefObject, useMemo, useReducer } from "react";
import { unmountComponentAtNode } from "react-dom";
import { PageNavigator, usePageNavigator } from "./use_page_navigator.ts";
import { saveZipAs } from "../utils.ts";

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
  let cancelDownload: (() => void) | undefined;
  let compactWidthIndex = 1;

  const startDownload = async (options?: DownloadOptions) => {
    if (!images.length) {
      return;
    }

    const { zip, cancel } = download(images, options);
    cancelDownload = () => {
      cancel();
      cancelDownload = undefined;
    };

    const result = await zip;
    cancelDownload = undefined;
    return result;
  };

  const downloadAndSave = async (options?: DownloadOptions) => {
    const zip = await startDownload(options);
    await saveZipAs(zip);
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
    get cancelDownload() {
      return cancelDownload;
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
