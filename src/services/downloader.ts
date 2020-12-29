/** @jsx createElement */
import { JSZip } from 'jszip';
import { Deferred } from '../hooks/use_deferred.ts';
import { ImageSource } from '../types.ts';

export const download = async (images: ImageSource[], deferred: Deferred<JSZip>) => {
  const { default: jszip } = await import('jszip');
  const aborter = new AbortController();

  const downloadFile = async (url: string) => {
    const response = await fetch(url, { signal: aborter.signal });
    const blob = await response.blob();
    return { url, blob };
  };

  const downloadImage = async (
    source: ImageSource,
  ): Promise<{ url: string; blob: Blob }> => {
    if (Array.isArray(source)) {
      for (const url of source) {
        try {
          return await downloadFile(url);
        } catch (error) {
          console.log(error);
        }
      }
      return { url: '', blob: new Blob([JSON.stringify(source)]) };
    }

    try {
      return await downloadFile(source);
    } catch (error) {
      console.log(error);
      return { url: '', blob: new Blob([source]) };
    }
  };

  const cancellation = async () => {
    try {
      await deferred.promise;
    } catch {
      aborter.abort();
    }
    return Symbol();
  };

  const tasks = Promise.all(images!.map(downloadImage));
  const result = await Promise.race([cancellation(), tasks]);
  if (typeof result === 'symbol') {
    console.log('download cancelled');
    return;
  }

  const pad = (index: number) => `${index}`.padStart(cipher, '0');
  const cipher = Math.ceil(Math.log10(images.length)) + 1;
  const getName = (url: string, index: number) => {
    const path = new URL(url).pathname;
    const extension = path.substr(path.lastIndexOf('.'));
    const name = `${pad(index)}${extension}`;
    return name;
  };

  const zip = jszip();
  for (let i = 0; i < result.length; i++) {
    const file = result[i];
    zip.file(getName(file.url, i), file.blob);
  }
  deferred.resolve(zip);
};
