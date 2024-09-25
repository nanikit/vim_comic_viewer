/**
 * Controls what contents are shown in the viewer. It can manage
 * error handling and throttling.
 *
 * @returns An array of whole page image sources.
 */
export type ComicSource = (params: ComicSourceParams) => ImageSource[] | Promise<ImageSource[]>;

export type ComicSourceParams = {
  /** The cause of the comic source being loaded. */
  cause: "load" | "download" | "resize" | "error";
  /** The page number to load. undefined for all pages. */
  page?: number;
  /** Possible maximum viewer size until now. */
  maxSize: { width: number; height: number };
};

/**
 * Provided remote image. Width and height are planned to be used for CLS prevention.
 */
export type ImageSource = string | AdvancedSource;

export type MediaType = "image" | "video";

type AdvancedSource = {
  src: string;
  width?: number;
  height?: number;
  /** @default "image" */
  type?: MediaType;
};

const maxRetryCount = 2;

export function getUrl(source: ImageSource) {
  return typeof source === "string" ? source : source.src;
}

export function getType(source: ImageSource): MediaType {
  return typeof source !== "string" && source.type === "video" ? "video" : "image";
}

export async function* getImageIterable(
  { image, index, comic, maxSize }: {
    image: ImageSource;
    index: number;
    comic?: ComicSource;
    maxSize: { width: number; height: number };
  },
) {
  yield image;

  if (!comic) {
    return;
  }

  let previous: string | undefined;
  let retryCount = 0;
  while (retryCount < maxRetryCount) {
    const images = await comic({ cause: "error", page: index, maxSize });
    const next = images[index];
    yield next;

    const url = getUrl(next);
    if (previous === url) {
      retryCount++;
      continue;
    }
    previous = url;
  }
}
