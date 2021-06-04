import { ComicSource, ImageSource } from "../types.ts";
import { fetchBlob } from "./gm_fetch.ts";

export const imageSourceToIterable = (
  source: ImageSource,
): AsyncIterable<string> => {
  if (typeof source === "string") {
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

export const transformToBlobUrl = (source: ComicSource): ComicSource =>
  async () => {
    const imageSources = await source();

    return imageSources.map(
      (imageSource) =>
        async function* () {
          for await (const url of imageSourceToIterable(imageSource)) {
            try {
              const blob = await fetchBlob(url);
              yield URL.createObjectURL(blob);
            } catch (error) {
              console.log(error);
            }
          }
        },
    );
  };
