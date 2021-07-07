/** @jsx createElement */
import { zip } from "fflate";
import { ImageSource } from "../types.ts";
import { fetchBlob } from "./gm_fetch.ts";
import { imageSourceToIterable } from "./user_utils.ts";
import { defer } from "../utils.ts";

export type DownloadProgress = {
  total: number;
  started: number;
  rejected: number;
  settled: number;
  isComplete?: boolean;
  isCancelled?: boolean;
};

export type DownloadOptions = {
  onError?: (error: unknown) => void;
  onProgress?: (event: DownloadProgress) => void;
  signal?: AbortSignal;
};

async function* downloadImage(
  { source, signal }: {
    source: ImageSource;
    signal?: AbortSignal;
  },
): AsyncGenerator<{ error: object } | { url: string; blob: Blob }> {
  for await (const url of imageSourceToIterable(source)) {
    if (signal?.aborted) {
      break;
    }

    try {
      const blob = await fetchBlob(url, { signal });
      yield { url, blob };
    } catch (error) {
      yield { error };
    }
  }
}

const getExtension = (url: string) => {
  if (!url) {
    return ".txt";
  }
  const extension = url.match(/\.[^/?#]{3,4}?(?=[?#]|$)/);
  return extension || ".jpg";
};

export const download = (
  images: ImageSource[],
  options?: DownloadOptions,
): Promise<Uint8Array> => {
  const { onError, onProgress, signal } = options || {};
  let startedCount = 0;
  let resolvedCount = 0;
  let rejectedCount = 0;
  let isCancelled = false;
  let hasCancelled = false;

  const reportProgress = (additionals: {} = {}) => {
    if (hasCancelled) {
      return;
    }
    if (isCancelled) {
      hasCancelled = true;
    }

    const total = images.length;
    const settled = resolvedCount + rejectedCount;
    onProgress?.({
      total,
      started: startedCount,
      settled,
      rejected: rejectedCount,
      isCancelled,
      ...additionals,
    });
  };

  const downloadWithReport = async (
    source: ImageSource,
  ): Promise<{ url: string; blob: Blob }> => {
    const errors = [];

    startedCount++;
    reportProgress();

    for await (
      const event of downloadImage({ source, signal })
    ) {
      if ("error" in event) {
        errors.push(event.error);
        onError?.(event.error);
        continue;
      }

      if (event.url) {
        resolvedCount++;
      } else {
        rejectedCount++;
      }
      reportProgress();
      return event;
    }

    return {
      url: "",
      blob: new Blob([errors.map((x) => x.toString()).join("\n\n")]),
    };
  };

  const archiveWithReport = async (
    sources: ImageSource[],
  ): Promise<Uint8Array> => {
    const result = await Promise.all(sources.map(downloadWithReport));

    if (signal?.aborted) {
      throw new Error("aborted");
    }

    const cipher = Math.floor(Math.log10(result.length)) + 1;
    const getName = ({ url }: { url: string }, index: number) => {
      const pad = `${index}`.padStart(cipher, "0");
      const name = `${pad}${getExtension(url)}`;
      return name;
    };
    const names = result.map(getName);
    const buffers = await Promise.all(result.map((x) => x.blob.arrayBuffer()));

    const value = defer<Uint8Array>();
    const indices = [...Array(result.length).keys()];
    const pairs = indices.map((index) => ({
      [names[index]]: new Uint8Array(buffers[index]),
    }));
    const data = Object.assign({}, ...pairs);

    const abort = zip(data, { level: 0 }, (error, array) => {
      if (error) {
        value.reject(error);
      } else {
        reportProgress({ isComplete: true });
        value.resolve(array);
      }
    });
    signal?.addEventListener("abort", abort, { once: true });

    return value.promise;
  };

  return archiveWithReport(images);
};
