import type { Setter } from "jotai";
import type React from "npm:@types/react";
import { atom } from "../deps.ts";
import {
  maxZoomInExponentAtom,
  maxZoomOutExponentAtom,
  singlePageCountAtom,
} from "../features/preferences/atoms.ts";
import {
  type AdvancedObject,
  type AdvancedSource,
  isDelay,
  MAX_RETRY_COUNT,
  MAX_SAME_URL_RETRY_COUNT,
  type MediaSourceOrDelay,
  type SourceRefreshParams,
  toAdvancedObject,
  toAdvancedSource,
} from "../helpers/comic_source.ts";
import { scrollElementSizeAtom } from "./navigation_atoms.ts";
import { viewerOptionsAtom } from "./viewer_base_atoms.ts";

export type PageAtom = ReturnType<typeof createPageAtom>;

type Size = { width: number; height: number };

type PageState =
  & {
    source: AdvancedObject;
  }
  & ({
    status: "loading";
  } | {
    status: "error";
    urls: string[];
  } | {
    status: "complete";
    source: AdvancedSource;
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

export const mediaSourcesAtom = atom<MediaSourceOrDelay[]>([]);
export const pageAtomsAtom = atom<PageAtom[]>([]);

export const refreshMediaSourceAtom = atom(null, async (get, set, params: SourceRefreshParams) => {
  const { source } = get(viewerOptionsAtom);
  if (!source) {
    return;
  }

  const medias = await source({ ...params, maxSize: get(maxSizeAtom) });
  if (source !== get(viewerOptionsAtom).source) {
    return;
  }

  if (!Array.isArray(medias)) {
    throw new Error(`Invalid comic source type: ${typeof medias}`);
  }

  set(mediaSourcesAtom, medias);
  if (params.cause === "load" && params.page === undefined) {
    set(
      pageAtomsAtom,
      medias.map((media, index) => createPageAtom({ initialSource: media, index, set })),
    );
  }

  if (params.page !== undefined) {
    return medias[params.page];
  }
});

export function createPageAtom(
  params: { initialSource: MediaSourceOrDelay; index: number; set: Setter },
) {
  const { initialSource, index, set } = params;
  const triedUrls: string[] = [];
  let div: HTMLDivElement | null = null;

  const stateAtom = atom<PageState>({
    status: "loading",
    source: initialSource ? toAdvancedObject(initialSource) : { src: undefined },
  });
  const loadAtom = atom(null, async (get, set, cause: "load" | "error") => {
    switch (cause) {
      case "load":
        triedUrls.length = 0;
        break;
      case "error":
        break;
    }

    let newSource: MediaSourceOrDelay;

    try {
      while (!isDelay(newSource)) {
        if (isComplete()) {
          return;
        }

        newSource = await set(refreshMediaSourceAtom, { cause, page: index });
      }
    } catch (error) {
      console.error(error);
      set(stateAtom, (previous) => ({
        ...previous,
        status: "error",
        urls: Array.from(triedUrls),
      }));
      return;
    }

    if (isComplete() || isDelay(newSource)) {
      return;
    }

    const source = toAdvancedSource(newSource);
    triedUrls.push(source.src);
    set(stateAtom, { status: "loading", source });

    function isComplete() {
      return get(stateAtom).status === "complete";
    }
  });
  loadAtom.onMount = (set) => void set("load");

  const aggregateAtom = atom((get) => {
    get(loadAtom);

    const state = get(stateAtom);
    const scrollElementSize = get(scrollElementSizeAtom);
    const compactWidthIndex = get(singlePageCountAtom);
    const maxZoomInExponent = get(maxZoomInExponentAtom);
    const maxZoomOutExponent = get(maxZoomOutExponentAtom);

    const { src, width, height } = state.source ?? {};
    const ratio = getImageToViewerSizeRatio({
      viewerSize: scrollElementSize,
      imgSize: { width, height },
    });

    const shouldBeOriginalSize = shouldMediaBeOriginalSize({
      maxZoomInExponent,
      maxZoomOutExponent,
      mediaRatio: ratio,
    });
    const isLarge = ratio > 1;
    const canMessUpRow = shouldBeOriginalSize && isLarge;

    const mediaProps = {
      src,
      ...(width && height && state.status !== "complete"
        ? { style: { aspectRatio: width / height } }
        : {}),
      onError: reload,
    };

    const page = {
      index,
      state,
      div,
      setDiv: (newDiv: HTMLDivElement | null) => {
        div = newDiv;
      },
      reloadAtom: loadAtom,
      fullWidth: index < compactWidthIndex || canMessUpRow,
      shouldBeOriginalSize,
      videoProps: state.source?.type === "video"
        ? {
          ...mediaProps,
          controls: true,
          autoPlay: true,
          loop: true,
          muted: true,
          onLoadedMetadata: setCompleteState,
        } satisfies ImageProps
        : undefined,
      imageProps: state.source?.type === "image"
        ? {
          ...mediaProps,
          onLoad: setCompleteState,
        } satisfies VideoProps
        : undefined,
    };
    return page;
  });

  async function reload() {
    const isOverMaxRetry = triedUrls.length > MAX_RETRY_COUNT;

    const urlCountMap = triedUrls.reduce((acc, url) => {
      acc[url] = (acc[url] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const isOverSameUrlRetry = Object.values(urlCountMap).some((count) =>
      count > MAX_SAME_URL_RETRY_COUNT
    );

    if (isOverMaxRetry || isOverSameUrlRetry) {
      set(stateAtom, (previous) => ({
        ...previous,
        status: "error",
        urls: [...new Set(triedUrls)],
      }));
      return;
    }

    set(stateAtom, (previous) => ({
      status: "loading",
      source: { ...previous.source, src: undefined },
    }));
    await set(loadAtom, "error");
  }

  function setCompleteState(event: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) {
    const element = event.currentTarget;
    set(stateAtom, {
      status: "complete",
      source: {
        src: element.src,
        ...(element instanceof HTMLImageElement
          ? {
            type: "image",
            width: element.naturalWidth,
            height: element.naturalHeight,
          }
          : {
            type: "video",
            width: element.videoWidth,
            height: element.videoHeight,
          }),
      },
    });
  }

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
