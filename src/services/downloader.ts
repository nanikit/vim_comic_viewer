import { deferred, zip } from "../deps.ts";
import { ImageSource } from "../types.ts";
import { gmFetch, isGmFetchAvailable } from "./gm_fetch.ts";
import { imageSourceToIterable } from "./image_source_to_iterable.ts";

export type DownloadStatus = "ongoing" | "complete" | "error" | "cancelled";
export type DownloadProgress = {
  total: number;
  started: number;
  rejected: number;
  settled: number;
  status: DownloadStatus;
};

export type DownloadOptions = {
  onError?: (error: unknown) => void;
  onProgress?: (event: DownloadProgress) => void;
  signal?: AbortSignal;
};

export function download(images: ImageSource[], options?: DownloadOptions): Promise<Uint8Array> {
  const { onError, onProgress, signal } = options || {};
  let startedCount = 0;
  let resolvedCount = 0;
  let rejectedCount = 0;
  let status: DownloadStatus = "ongoing";

  const reportProgress = (
    { transition }: { transition?: typeof status } = {},
  ) => {
    if (status !== "ongoing") {
      return;
    }
    if (transition) {
      status = transition;
    }

    onProgress?.({
      total: images.length,
      started: startedCount,
      settled: resolvedCount + rejectedCount,
      rejected: rejectedCount,
      status,
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

  const archiveWithReport = async (sources: ImageSource[]): Promise<Uint8Array> => {
    const result = await Promise.all(sources.map(downloadWithReport));

    if (signal?.aborted) {
      reportProgress({ transition: "cancelled" });
      signal.throwIfAborted();
    }

    const pairs = await Promise.all(result.map(toPair));
    const data = Object.assign({}, ...pairs);

    const value = deferred<Uint8Array>();
    const abort = zip(data, { level: 0 }, (error, array) => {
      if (error) {
        reportProgress({ transition: "error" });
        value.reject(error);
      } else {
        reportProgress({ transition: "complete" });
        value.resolve(array);
      }
    });
    signal?.addEventListener("abort", abort, { once: true });

    return value;
  };

  return archiveWithReport(images);
}

function getExtension(url: string): string {
  if (!url) {
    return ".txt";
  }
  const extension = url.match(/\.[^/?#]{3,4}?(?=[?#]|$)/);
  return extension?.[0] || ".jpg";
}

function guessExtension(array: Uint8Array): string | undefined {
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
}

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
      const blob = await fetchBlobWithCacheIfPossible(url, signal);
      yield { url, blob };
    } catch (error) {
      yield await fetchBlobIgnoringCors(url, { signal, fetchError: error });
    }
  }
}

async function fetchBlobWithCacheIfPossible(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal });
  return await response.blob();
}

async function fetchBlobIgnoringCors(
  url: string,
  { signal, fetchError }: { signal?: AbortSignal; fetchError?: unknown },
) {
  if (isCrossOrigin(url) && !isGmFetchAvailable) {
    return {
      error: new Error(
        "It could be a CORS issue but cannot use GM_xmlhttpRequest",
        { cause: fetchError },
      ),
    };
  }

  try {
    const blob = await gmFetch(url, { signal }).blob();
    return { url, blob };
  } catch (error) {
    if (isGmCancelled(error)) {
      return { error: new Error("download aborted") };
    } else {
      return { error: fetchError };
    }
  }
}

function isCrossOrigin(url: string) {
  return new URL(url).origin !== location.origin;
}

function isGmCancelled(error: unknown) {
  return error instanceof Function;
}
