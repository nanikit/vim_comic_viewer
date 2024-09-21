import type { ComicSource as ComicSource1, ImageSource as ImageSource1 } from "../types.ts";

/**
 * Controls what contents are shown in the viewer. It can manage
 * error handling and throttling.
 *
 * @param params.cause The cause of the comic source being loaded.
 * @param params.page The page number to load. undefined for all pages.
 * @returns An array of whole page image sources.
 */
export type ComicSource = (
  params: { cause: "load" | "download" | "resize" | "error"; page?: number },
) => ImageSource[] | Promise<ImageSource[]>;

/**
 * Provided remote image. Width and height are planned to be used for CLS prevention.
 */
export type ImageSource = string | { src: string; width: number; height: number };

export function getUrl(source: ImageSource) {
  return typeof source === "string" ? source : source.src;
}

export async function adaptComicSource(source: ComicSource1): Promise<ComicSource> {
  const images = await source();
  const counts = new Map<number, number>();

  return ({ cause: _, page }) => {
    if (page) {
      const source = images[page];
      const count = counts.get(page) ?? 0;

      if (typeof source === "string") {
        if (count > 0) {
          return [];
        }
        counts.set(page, count + 1);
        return [source];
      }

      if (Array.isArray(source)) {
        const url = source[count];
        if (typeof url !== "string") {
          return [];
        }
        counts.set(page, count + 1);
        return [url];
      }

      return [];
    }
    return images.map(imageSource1ToImageSource);
  };
}

function imageSource1ToImageSource(source: ImageSource1): ImageSource {
  if (typeof source === "string") {
    return source;
  }

  if (Array.isArray(source)) {
    const url = source[0];
    if (typeof url === "string") {
      return url;
    }
  }

  throw new Error(`Unsupported image source: ${JSON.stringify(source)}`);
}

export async function* getImageIterable(
  { image, index, comic }: { image: ImageSource; index: number; comic?: ComicSource },
) {
  yield image;

  if (!comic) {
    return;
  }

  while (true) {
    const [next] = await comic({ cause: "error", page: index });
    if (!next) {
      break;
    }

    yield next;
  }
}
