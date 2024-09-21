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
