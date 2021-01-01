/** @jsx createElement */
import type { JSZip } from 'jszip';
import { ImageSource } from '../types.ts';
import { defer } from '../utils.ts';

export type DownloadOptions = {
  onError?: (error: unknown) => void;
  onProgress?: (event: { rejected: number; settled: number }) => void;
};

export const download = async (
  images: ImageSource[],
  options?: DownloadOptions,
): Promise<{
  zip: Promise<JSZip>;
  cancel: () => void;
}> => {
  const { onError, onProgress } = options || {};
  const { JSZip } = await import('jszip');
  const aborter = new AbortController();
  let resolvedCount = 0;
  let rejectedCount = 0;

  const downloadFile = async (url: string): Promise<Blob> => {
    const response = await fetch(url, { signal: aborter.signal });
    return response.blob();
  };

  const reportProgress = () => {
    const settled = resolvedCount + rejectedCount;
    onProgress?.({ settled, rejected: rejectedCount });
  };

  const downloadAndProgress = async (
    url: string,
  ): Promise<{ url: string; blob: Blob }> => {
    const blob = await downloadFile(url);
    resolvedCount++;
    reportProgress();
    return { url, blob };
  };

  const downloadImage = async (
    source: ImageSource,
  ): Promise<{ url: string; blob: Blob }> => {
    if (Array.isArray(source)) {
      for (const url of source) {
        try {
          return await downloadAndProgress(url);
        } catch (error) {
          onError?.(error);
        }
      }
      rejectedCount++;
      reportProgress();
      return { url: '', blob: new Blob([source.join('\n')]) };
    }

    try {
      return await downloadAndProgress(source);
    } catch (error) {
      onError?.(error);
      rejectedCount++;
      reportProgress();
      return { url: '', blob: new Blob([source]) };
    }
  };

  const deferred = defer<JSZip>();
  const tasks = images!.map(downloadImage);

  const archive = async () => {
    const cancellation = async () => {
      try {
        await deferred.promise;
      } catch {
        aborter.abort();
      }
      return Symbol();
    };

    const checkout = Promise.all(tasks);
    const result = await Promise.race([cancellation(), checkout]);
    if (typeof result === 'symbol') {
      console.log('download cancelled');
      return;
    }

    const pad = (index: number) => `${index}`.padStart(cipher, '0');
    const cipher = Math.ceil(Math.log10(tasks.length)) + 1;
    const getName = (url: string, index: number) => {
      const path = new URL(url).pathname;
      const extension = path.substr(path.lastIndexOf('.'));
      const name = `${pad(index)}${extension || '.jpg'}`;
      return name;
    };

    const zip = JSZip();
    for (let i = 0; i < result.length; i++) {
      const file = result[i];
      zip.file(getName(file.url, i), file.blob);
    }
    deferred.resolve(zip);
  };

  archive();

  return {
    zip: deferred.promise,
    cancel: () => deferred.reject(new Error('cancelled')),
  };
};
