import { atom, deferred } from "../deps.ts";
import {
  maxZoomInExponentAtom,
  maxZoomOutExponentAtom,
  singlePageCountAtom,
} from "../features/preferences/atoms.ts";
import {
  getMediaIterable,
  getType,
  getUrl,
  type MediaSource,
  type MediaSourceOrDelay,
  type MediaType,
} from "../helpers/comic_source.ts";
import { timeout } from "../utils.ts";
import { scrollElementSizeAtom } from "./navigation_atoms.ts";
import { viewerStateAtom } from "./viewer_atoms.ts";

export type PageAtom = ReturnType<typeof createPageAtom>;

type Size = { width: number; height: number };

type PageState =
  & Partial<Size>
  & { type?: MediaType }
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

export function createPageAtom({ index, source }: { index: number; source: MediaSourceOrDelay }) {
  const triedUrls = new Set<string>();

  let mediaLoad = deferred<HTMLImageElement | HTMLVideoElement | "error" | "cancelled">();
  let div: HTMLDivElement | null = null;

  const stateAtom = atom<PageState>({
    status: "loading",
    type: source ? getType(source) : undefined,
  });
  const loadAtom = atom(null, async (get, set) => {
    if (isComplete()) {
      return;
    }

    mediaLoad.resolve("cancelled");
    set(stateAtom, (previous) => ({ ...previous, status: "loading" }));

    const comic = get(viewerStateAtom).options.source;
    const mediaParams = { index, media: source, comic, maxSize: get(maxSizeAtom) };
    try {
      for await (const page of getMediaIterable(mediaParams)) {
        if (isComplete()) {
          return;
        }

        const url = getUrl(page);
        triedUrls.add(url);

        reflectProvisionalSize(page);

        const result = await waitMediaLoad(url);
        switch (result) {
          case "error":
            set(stateAtom, (previous) => ({
              ...previous,
              src: "",
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
      // Ignore error.
    }

    if (!isComplete()) {
      set(stateAtom, (previous) => ({ ...previous, status: "error", urls: Array.from(triedUrls) }));
    }

    function isComplete() {
      return get(stateAtom).status === "complete";
    }

    function reflectProvisionalSize(page: MediaSource) {
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

    async function waitMediaLoad(url: string) {
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
    const shouldBeOriginalSize = shouldMediaBeOriginalSize({
      maxZoomInExponent: get(maxZoomInExponentAtom),
      maxZoomOutExponent: get(maxZoomOutExponentAtom),
      mediaRatio: ratio,
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

function shouldMediaBeOriginalSize(
  { maxZoomOutExponent, maxZoomInExponent, mediaRatio }: {
    maxZoomOutExponent: number;
    maxZoomInExponent: number;
    mediaRatio: number;
  },
) {
  const minZoomRatio = Math.sqrt(2) ** maxZoomOutExponent;
  const maxZoomRatio = Math.sqrt(2) ** maxZoomInExponent;
  const isOver = minZoomRatio < mediaRatio || mediaRatio < 1 / maxZoomRatio;
  return isOver;
}
