import { zip } from "../deps.ts";
import { ImageSource } from "../types.ts";
import { defer } from "../utils.ts";
import { fetchBlob } from "./gm_fetch.ts";
import { imageSourceToIterable } from "./user_utils.ts";

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

const isGmCancelled = (error: unknown) => {
  return error instanceof Function;
};

async function* downloadImage(
  { source, signal }: {
    source: ImageSource;
    signal?: AbortSignal;
  },
): AsyncGenerator<{ error: unknown } | { url: string; blob: Blob }> {
  for await (const url of imageSourceToIterable(source)) {
    if (signal?.aborted) {
      break;
    }

    try {
      const blob = await fetchBlob(url, { signal });
      yield { url, blob };
    } catch (error) {
      if (isGmCancelled(error)) {
        yield { error: new Error("download aborted") };
      } else {
        yield { error };
      }
    }
  }
}

const getExtension = (url: string): string => {
  if (!url) {
    return ".txt";
  }
  const extension = url.match(/\.[^/?#]{3,4}?(?=[?#]|$)/);
  return extension?.[0] || ".jpg";
};

const guessExtension = (array: Uint8Array): string | undefined => {
  const { 0: a, 1: b, 2: c, 3: d } = array;
  if (a === 0xff && b === 0xd8 && c === 0xff) {
    return ".jpg";
  }
  if (a === 0x89 && b === 0x50 && c === 0x4e && d === 0x47) {
    return ".png";
  }
  if (a === 0x52 && b === 0x49 && c === 0x46 && d === 0x46) {
    return ".webp";
  }
  if (a === 0x47 && b === 0x49 && c === 0x46 && d === 0x38) {
    return ".gif";
  }
};

export const download = (
  images: ImageSource[],
  options?: DownloadOptions,
): Promise<Uint8Array> => {
  const { onError, onProgress, signal } = options || {};
  let startedCount = 0;
  let resolvedCount = 0;
  let rejectedCount = 0;
  let hasCancelled = false;

  const reportProgress = (
    { isCancelled, isComplete }: { isCancelled?: true; isComplete?: true } = {},
  ) => {
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
      isCancelled: hasCancelled,
      isComplete,
    });
  };

  const downloadWithReport = async (
    source: ImageSource,
  ): Promise<{ url: string; blob: Blob }> => {
    const errors = [];

    startedCount++;
    reportProgress();

    for await (const event of downloadImage({ source, signal })) {
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
      blob: new Blob([errors.map((x) => `${x}`).join("\n\n")]),
    };
  };

  const cipher = Math.floor(Math.log10(images.length)) + 1;

  const toPair = async (
    { url, blob }: { url: string; blob: Blob },
    index: number,
  ) => {
    const array = new Uint8Array(await blob.arrayBuffer());
    const pad = `${index}`.padStart(cipher, "0");

    const name = `${pad}${guessExtension(array) ?? getExtension(url)}`;

    return { [name]: array };
  };

  const archiveWithReport = async (
    sources: ImageSource[],
  ): Promise<Uint8Array> => {
    const result = await Promise.all(sources.map(downloadWithReport));

    if (signal?.aborted) {
      reportProgress({ isCancelled: true });
      throw new Error("aborted");
    }

    const pairs = await Promise.all(result.map(toPair));
    const data = Object.assign({}, ...pairs);

    const value = defer<Uint8Array>();
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
