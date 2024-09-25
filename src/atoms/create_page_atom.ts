import { atom, deferred } from "../deps.ts";
import {
  maxZoomInExponentAtom,
  maxZoomOutExponentAtom,
  singlePageCountAtom,
} from "../features/preferences/atoms.ts";
import { getImageIterable, getType, getUrl, type ImageSource } from "../helpers/comic_source.ts";
import { timeout } from "../utils.ts";
import { scrollElementSizeAtom } from "./navigation_atoms.ts";
import { viewerStateAtom } from "./viewer_atoms.ts";

export type PageAtom = ReturnType<typeof createPageAtom>;

type Size = { width: number; height: number };

type PageState =
  & Partial<Size>
  & { type: "image" | "video" }
  & ({
    status: "loading";
    src?: string;
  } | {
    status: "error";
    urls: string[];
  } | {
    status: "complete";
    src: string;
  });

type ImageProps = React.DetailedHTMLProps<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
>;

type VideoProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

/** max of current screen size or scroll element size */
const maxSizeStateAtom = atom({ width: screen.width, height: screen.height });
export const maxSizeAtom = atom(
  (get) => get(maxSizeStateAtom),
  (get, set, size: { width: number; height: number }) => {
    const current = get(maxSizeStateAtom);
    if (size.width <= current.width && size.height <= current.height) {
      return;
    }

    set(maxSizeStateAtom, {
      width: Math.max(size.width, current.width),
      height: Math.max(size.height, current.height),
    });
  },
);

export function createPageAtom({ index, source }: { index: number; source: ImageSource }) {
  const triedUrls = new Set<string>();

  let mediaLoad = deferred<HTMLImageElement | HTMLVideoElement | "error" | "cancelled">();
  let div: HTMLDivElement | null = null;

  const stateAtom = atom<PageState>({
    status: "loading",
    type: getType(source),
  });
  const loadAtom = atom(null, async (get, set) => {
    mediaLoad.resolve("cancelled");

    const comic = get(viewerStateAtom).options.source;
    const imageParams = { index, image: source, comic, maxSize: get(maxSizeAtom) };
    try {
      for await (const page of getImageIterable(imageParams)) {
        const url = getUrl(page);
        triedUrls.add(url);

        reflectProvisionalSize(page);

        const result = await waitImageLoad(url);
        switch (result) {
          case "error":
            set(stateAtom, (previous) => ({
              ...previous,
              status: "error",
              src: "",
              urls: Array.from(triedUrls),
            }));
            // Wait error rendering.
            await timeout(0);
            break;
          case "cancelled":
            return;
          default: {
            set(stateAtom, (previous) => ({
              ...previous,
              status: "complete",
              src: url,
              ...(result instanceof HTMLImageElement
                ? {
                  width: result.naturalWidth,
                  height: result.naturalHeight,
                }
                : {
                  width: result.videoWidth,
                  height: result.videoHeight,
                }),
            }));
            return;
          }
        }
      }
    } catch (_error) {
      set(stateAtom, (previous) => ({ ...previous, urls: Array.from(triedUrls), status: "error" }));
    }

    function reflectProvisionalSize(page: ImageSource) {
      if (typeof page === "object") {
        const { width, height } = get(stateAtom);
        if (width !== page.width || height !== page.height) {
          set(stateAtom, (previous) => ({
            ...previous,
            type: getType(page),
            width: page.width,
            height: page.height,
          }));
        }
      }
    }

    async function waitImageLoad(url: string) {
      mediaLoad = deferred();
      set(stateAtom, (previous) => ({ ...previous, src: url, status: "loading" }));

      return await mediaLoad;
    }
  });
  loadAtom.onMount = (set) => {
    set();
  };

  const aggregateAtom = atom((get) => {
    get(loadAtom);

    const state = get(stateAtom);
    const compactWidthIndex = get(singlePageCountAtom);
    const ratio = getImageToViewerSizeRatio({
      viewerSize: get(scrollElementSizeAtom),
      imgSize: state,
    });
    const shouldBeOriginalSize = shouldPageBeOriginalSize({
      maxZoomInExponent: get(maxZoomInExponentAtom),
      maxZoomOutExponent: get(maxZoomOutExponentAtom),
      imageRatio: ratio,
    });
    const isLarge = ratio > 1;
    const canMessUpRow = shouldBeOriginalSize && isLarge;

    const { width, height, status } = state;
    const mediaProps = {
      ...(width && height && status !== "complete"
        ? { style: { aspectRatio: width / height } }
        : {}),
      ...("src" in state ? { src: state.src } : {}),
      onError: () => mediaLoad.resolve("error"),
    };

    return {
      index,
      state,
      div,
      setDiv: (newDiv: HTMLDivElement | null) => {
        div = newDiv;
      },
      reloadAtom: loadAtom,
      fullWidth: index < compactWidthIndex || canMessUpRow,
      shouldBeOriginalSize,
      get src() {
        return "src" in state ? state.src : undefined;
      },
      videoProps: state.type === "video"
        ? {
          ...mediaProps,
          controls: true,
          autoPlay: true,
          loop: true,
          muted: true,
          onLoadedMetadata: ((event) => mediaLoad.resolve(event.currentTarget)),
        } satisfies ImageProps
        : undefined,
      imageProps: state.type === "image"
        ? {
          ...mediaProps,
          onLoad: ((event) => mediaLoad.resolve(event.currentTarget)),
        } satisfies VideoProps
        : undefined,
    };
  });

  return aggregateAtom;
}

function getImageToViewerSizeRatio(
  { viewerSize, imgSize }: { viewerSize: Size; imgSize: Partial<Size> },
) {
  if (!imgSize.height && !imgSize.width) {
    return 1;
  }

  return Math.max(
    (imgSize.height ?? 0) / viewerSize.height,
    (imgSize.width ?? 0) / viewerSize.width,
  );
}

function shouldPageBeOriginalSize(
  { maxZoomOutExponent, maxZoomInExponent, imageRatio }: {
    maxZoomOutExponent: number;
    maxZoomInExponent: number;
    imageRatio: number;
  },
) {
  const minZoomRatio = Math.sqrt(2) ** maxZoomOutExponent;
  const maxZoomRatio = Math.sqrt(2) ** maxZoomInExponent;
  const isOver = minZoomRatio < imageRatio || imageRatio < 1 / maxZoomRatio;
  return isOver;
}
