import { useEffect } from "react";
import {
  download,
  DownloadOptions,
  DownloadProgress,
} from "../services/downloader.ts";
import { ImageSource } from "../types.ts";
import { save } from "../utils.ts";
import { useRerender } from "./use_rerender.ts";

const isNotAbort = (error: unknown) => !/aborted/i.test(`${error}`);

const logIfNotAborted = (error: unknown) => {
  if (isNotAbort(error)) {
    console.error(error);
  }
};

export const makeDownloader = (images: ImageSource[]) => {
  let aborter = new AbortController();
  let rerender: () => void | undefined;
  let progress = {
    value: 0,
    text: "",
    error: false,
  };

  const startDownload = (options?: DownloadOptions) => {
    aborter = new AbortController();
    return download(images, { ...options, signal: aborter.signal });
  };

  const downloadAndSave = async (options?: DownloadOptions) => {
    const zip = await startDownload(options);
    if (zip) {
      await save(new Blob([zip]));
    }
  };

  const reportProgress = (event: DownloadProgress) => {
    const { total, started, settled, rejected, isCancelled, isComplete } =
      event;
    const value = (started / total) * 0.1 + (settled / total) * 0.89;
    const text = `${(value * 100).toFixed(1)}%`;
    const error = !!rejected;
    if (isComplete || isCancelled) {
      progress = { value: 0, text: "", error: false };
      rerender?.();
    } else if (text !== progress.text) {
      progress = { value, text, error };
      rerender?.();
    }
  };

  const downloadWithProgress = async () => {
    try {
      await downloadAndSave({
        onProgress: reportProgress,
        onError: logIfNotAborted,
      });
    } catch (error) {
      if (isNotAbort(error)) {
        throw error;
      }
    }
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#Example
  const guard = (event: Event) => {
    event.preventDefault();
  };

  const useInstance = () => {
    const { error, text } = progress;
    rerender = useRerender();

    useEffect(() => {
      if (error || !text) {
        return;
      }
      addEventListener("beforeunload", guard);
      return () => removeEventListener("beforeunload", guard);
    }, [error || !text]);
  };

  return {
    get progress() {
      return progress;
    },

    download: startDownload,
    downloadAndSave,
    downloadWithProgress,
    cancelDownload: () => aborter.abort(),
    useInstance,
  };
};
