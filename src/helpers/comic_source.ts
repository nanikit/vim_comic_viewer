/**
 * Controls what contents are shown in the viewer. It can manage
 * error handling and throttling.
 *
 * @returns An array of whole page image sources.
 */
export type ComicSource = (params: ComicSourceParams) => PromiseOrValue<MediaSourceOrDelay[]>;

export type ComicSourceParams = {
  /** The cause of the comic source being loaded. */
  cause: "load" | "download" | "resize" | "error";
  /** The page number to load. undefined for all pages. */
  page?: number;
  /** Possible maximum viewer size until now. */
  maxSize: { width: number; height: number };
};

/** `undefined` and `{ src: undefined }` means delay the source loading. Viewer will request source again. */
export type MediaSourceOrDelay = MediaSource | undefined;

/** Provided remote image. */
export type MediaSource = string | AdvancedSource;

export type MediaType = "image" | "video";

type PromiseOrValue<T> = T | Promise<T>;

/** Width and height are planned to be used for CLS prevention. */
export type AdvancedSource = {
  src: string;
  width?: number;
  height?: number;
  /** @default "image" */
  type?: MediaType;
};

export const MAX_RETRY_COUNT = 6;
export const MAX_SAME_URL_RETRY_COUNT = 2;

export function getUrl(source: MediaSource) {
  return typeof source === "string" ? source : source.src;
}

export function getType(source: MediaSource): MediaType {
  return typeof source !== "string" && source.type === "video" ? "video" : "image";
}

export async function* getMediaIterable(
  { media, index, comic, maxSize }: {
    media: MediaSourceOrDelay;
    index: number;
    comic?: ComicSource;
    maxSize: { width: number; height: number };
  },
) {
  if (media !== undefined) {
    yield media;
  }

  if (!comic) {
    return;
  }

  let previous: string | undefined;
  let retryCount = 0;
  let sameUrlRetryCount = 0;

  while (sameUrlRetryCount <= MAX_SAME_URL_RETRY_COUNT && retryCount <= MAX_RETRY_COUNT) {
    const hadError = media !== undefined || retryCount > 0;
    const medias = await comic({ cause: hadError ? "error" : "load", page: index, maxSize });
    const next = medias[index];
    if (next === undefined) {
      continue;
    }

    yield next;

    retryCount++;
    const url = getUrl(next);
    if (previous === url) {
      sameUrlRetryCount++;
      continue;
    }
    previous = url;
  }
}
