/**
 * Controls what contents are shown in the viewer. It can manage
 * error handling and throttling.
 *
 * @returns An array of whole page image sources.
 */
export type ComicSource = (params: ComicSourceParams) => PromiseOrValue<MediaSourceOrDelay[]>;

export type SourceRefreshParams = {
  /** The cause of the comic source being loaded. */
  cause: "load" | "download" | "resize";
  /** The page number to load. undefined for all pages. */
  page?: number;
} | {
  /** The cause of the comic source being loaded. */
  cause: "error";
  /** The page number to load. undefined for all pages. */
  page: number;
};

export type ComicSourceParams = SourceRefreshParams & {
  /** Possible maximum viewer size until now. */
  maxSize: { width: number; height: number };
};

/** `undefined` and `{ src: undefined }` means delay the source loading. Viewer will request source again. */
export type MediaSourceOrDelay = MediaSource | Delay;

/** Provided remote image. */
export type MediaSource = SimpleSource | AdvancedSource;
type Delay = SimpleDelay | AdvancedDelay;
export type AdvancedObject = AdvancedSource | AdvancedDelay;

type SimpleDelay = undefined;
export type AdvancedDelay = { src: undefined } & SourceProps;
type SimpleSource = string;

/** Width and height are planned to be used for CLS prevention. */
export type AdvancedSource = { src: string } & SourceProps;

type SourceProps = {
  width?: number;
  height?: number;
  /** @default "image" */
  type?: MediaType;
};

export type MediaType = "image" | "video";

type PromiseOrValue<T> = T | Promise<T>;

export const MAX_RETRY_COUNT = 6;
export const MAX_SAME_URL_RETRY_COUNT = 2;

export function isDelay(sourceOrDelay: MediaSourceOrDelay): sourceOrDelay is Delay {
  return sourceOrDelay === undefined || (typeof sourceOrDelay !== "string" && !sourceOrDelay.src);
}

export function toAdvancedObject(sourceOrDelay: MediaSourceOrDelay): AdvancedObject {
  return isDelay(sourceOrDelay) ? { src: undefined } : toAdvancedSource(sourceOrDelay);
}

export function toAdvancedSource(source: MediaSource) {
  return typeof source === "string" ? { type: "image", src: source } as const : source;
}

export async function* getMediaIterable(
  { media, index, comic, maxSize }: {
    media: MediaSourceOrDelay;
    index: number;
    comic?: ComicSource;
    maxSize: { width: number; height: number };
  },
) {
  if (!isDelay(media)) {
    yield getUrl(media);
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
    if (isDelay(next)) {
      continue;
    }

    const url = getUrl(next);
    yield url;

    retryCount++;
    if (previous === url) {
      sameUrlRetryCount++;
      continue;
    }
    previous = url;
  }
}

function getUrl(source: MediaSource) {
  return typeof source === "string" ? source : source.src;
}
