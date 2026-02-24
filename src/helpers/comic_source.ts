/**
 * Controls what contents are shown in the viewer. It can manage
 * error handling and throttling.
 *
 * @returns An array of whole page image sources.
 */
export type ComicSource = () => PromiseOrValue<MediaSourceResolver[]>;

export type MediaSourceResolver = (params: SourceRefreshParams) => PromiseOrValue<MediaElement>;

export type SourceRefreshParams = {
  /** The cause of the comic source being loaded. */
  cause: "load" | "download" | "error";
};

/**
 * Width and height are planned to be used for CLS prevention.
 * If provided element is already attached, it will be cloned.
 *
 * Set per-media attributes (for example, `crossorigin`, `referrerpolicy`, `alt`) directly on this
 * element in your comic source resolver.
 */
export type MediaElement = HTMLImageElement | HTMLVideoElement;

export type PromiseOrValue<T> = T | Promise<T>;

export const MAX_RETRY_COUNT = 6;
export const MAX_SAME_URL_RETRY_COUNT = 2;

export function normalizeMediaElement(source: MediaElement): MediaElement {
  if (source.isConnected) {
    return source.cloneNode(true) as MediaElement;
  }

  return source;
}

export async function* getMediaIterable(
  { media, initialCause = "load" }: {
    media: MediaSourceResolver;
    initialCause?: "load" | "download";
  },
) {
  let previous: string | undefined;
  let retryCount = 0;
  let sameUrlRetryCount = 0;

  while (sameUrlRetryCount <= MAX_SAME_URL_RETRY_COUNT && retryCount <= MAX_RETRY_COUNT) {
    const cause = retryCount > 0 ? "error" : initialCause;
    const next = await media({ cause });
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

function getUrl(source: MediaElement): string {
  return normalizeMediaElement(source).src;
}
