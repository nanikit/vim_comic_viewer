/** @jsx createElement */
import JSZip from 'jszip';
import { ImageSource } from '../types.ts';
import { defer } from '../utils.ts';
import { fetchBlob } from './gm_fetch.ts';
import { imageSourceToIterable } from './user_utils.ts';

export type DownloadProgress = {
  total: number;
  started: number;
  rejected: number;
  settled: number;
  isCancelled?: boolean;
  /** jszip generateAsync onUpdate */
  zipPercent: number;
};

export type DownloadOptions = {
  onError?: (error: unknown) => void;
  onProgress?: (event: DownloadProgress) => void;
};

export const download = async (
  images: ImageSource[],
  options?: DownloadOptions,
): Promise<{
  zip: Promise<JSZip | undefined>;
  cancel: () => void;
}> => {
  const { onError, onProgress } = options || {};
  const aborter = new AbortController();
  let startedCount = 0;
  let resolvedCount = 0;
  let rejectedCount = 0;
  let zipPercent = 0;
  let isCancelled = false;
  let hasCancelled = false;

  const reportProgress = () => {
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
      zipPercent,
    });
  };

  const downloadImage = async (
    source: ImageSource,
  ): Promise<{ url: string; blob: Blob }> => {
    const errors = [];
    startedCount++;
    reportProgress();
    for await (const url of imageSourceToIterable(source)) {
      try {
        const blob = await fetchBlob(url);
        resolvedCount++;
        reportProgress();
        return { url, blob };
      } catch (error) {
        errors.push(error);
        onError?.(error);
      }
    }
    rejectedCount++;
    reportProgress();
    return { url: '', blob: new Blob([errors.map((x) => x.toString()).join('\n\n')]) };
  };

  const deferred = defer<JSZip | undefined>();
  const tasks = images!.map(downloadImage);
  reportProgress();

  const archive = async () => {
    const cancellation = async () => {
      if ((await deferred.promise) === undefined) {
        aborter.abort();
      }
      return Symbol();
    };

    const checkout = Promise.all(tasks);
    const result = await Promise.race([cancellation(), checkout]);
    if (typeof result === 'symbol') {
      isCancelled = true;
      reportProgress();
      return;
    }

    const cipher = Math.floor(Math.log10(tasks.length)) + 1;
    const getExtension = (url: string) => {
      if (!url) {
        return '.txt';
      }
      const extension = url.match(/\.[^/?#]{3,4}?(?=[?#]|$)/);
      return extension || '.jpg';
    };
    const getName = (url: string, index: number) => {
      const pad = `${index}`.padStart(cipher, '0');
      const name = `${pad}${getExtension(url)}`;
      return name;
    };

    const zip = JSZip();
    for (let i = 0; i < result.length; i++) {
      const file = result[i];
      zip.file(getName(file.url, i), file.blob);
    }

    const proxy = new Proxy(zip, {
      get: (target, property, receiver) => {
        const ret = Reflect.get(target, property, receiver);
        if (property !== 'generateAsync') {
          return ret;
        }
        return ((options, onUpdate) =>
          (ret.bind(target) as typeof zip.generateAsync)(options, (metadata) => {
            zipPercent = metadata.percent;
            reportProgress();
            onUpdate?.(metadata);
          })) as typeof zip.generateAsync;
      },
    }) as any;
    deferred.resolve(proxy);
  };

  archive();

  return {
    zip: deferred.promise,
    cancel: () => deferred.resolve(undefined),
  };
};
