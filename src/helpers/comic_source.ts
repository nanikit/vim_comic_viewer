/**
 * Controls what contents are shown in the viewer. It can manage
 * error handling and throttling.
 *
 * @returns An array of whole page image sources.
 */
export type ComicSource = (params: ComicSourceParams) => PromiseOrValue<ImageSourceOrDelay[]>;

export type ComicSourceParams = {
  /** The cause of the comic source being loaded. */
  cause: "load" | "download" | "resize" | "error";
  /** The page number to load. undefined for all pages. */
  page?: number;
  /** Possible maximum viewer size until now. */
  maxSize: { width: number; height: number };
};

/** undefined means delay the source loading. Viewer will request source again. */
export type ImageSourceOrDelay = ImageSource | undefined;

/** Provided remote image. */
export type ImageSource = string | AdvancedSource;

export type MediaType = "image" | "video";

type PromiseOrValue<T> = T | Promise<T>;

/** Width and height are planned to be used for CLS prevention. */
type AdvancedSource = {
  src: string;
  width?: number;
  height?: number;
  /** @default "image" */
  type?: MediaType;
};

const maxRetryCount = 3;

export function getUrl(source: ImageSource) {
  return typeof source === "string" ? source : source.src;
}

export function getType(source: ImageSource): MediaType {
  return typeof source !== "string" && source.type === "video" ? "video" : "image";
}

export async function* getImageIterable(
  { image, index, comic, maxSize }: {
    image: ImageSourceOrDelay;
    index: number;
    comic?: ComicSource;
    maxSize: { width: number; height: number };
  },
) {
  if (image !== undefined) {
    yield image;
  }

  if (!comic) {
    return;
  }

  let previous: string | undefined;
  let retryCount = 0;
  while (retryCount < maxRetryCount) {
    const hadError = image !== undefined || retryCount > 0;
    const images = await comic({ cause: hadError ? "error" : "load", page: index, maxSize });
    const next = images[index];
    if (next === undefined) {
      continue;
    }

    yield next;

    const url = getUrl(next);
    if (previous === url) {
      retryCount++;
      continue;
    }
    previous = url;
  }
}
