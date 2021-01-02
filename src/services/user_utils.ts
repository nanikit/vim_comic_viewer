import { ComicSource, ImageSource } from '../types.ts';
import { gmFetch } from './gm_fetch.ts';

export const imageSourceToIterable = (source: ImageSource): AsyncIterable<string> => {
  if (typeof source === 'string') {
    return (async function* () {
      yield source;
    })();
  } else if (Array.isArray(source)) {
    return (async function* () {
      for (const url of source) {
        yield url;
      }
    })();
  } else {
    return source();
  }
};

export const transformToBlobUrl = (source: ComicSource): ComicSource => async () => {
  const imageSources = await source();
  // @ts-ignore: 2274
  const corsFetch = (('GM_xmlhttpRequest' in window
    ? gmFetch
    : fetch) as unknown) as typeof fetch;
  return imageSources.map(
    (imageSource) =>
      async function* () {
        for await (const url of imageSourceToIterable(imageSource)) {
          try {
            const response = await corsFetch(url);
            const blob = await response.blob();
            yield URL.createObjectURL(blob);
          } catch (error) {
            console.log(error);
          }
        }
      },
  );
};
