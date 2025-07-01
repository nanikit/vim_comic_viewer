import type { CSS } from "@stitches/react";
import type { Atom, Setter } from "jotai";
import type React from "npm:@types/react";
import { atom } from "../deps.ts";
import { scrollElementSizeAtom, singlePageCountAtom } from "../features/navigation/atoms.ts";
import { maxZoomInExponentAtom, maxZoomOutExponentAtom } from "../features/preferences/atoms.ts";
import {
  isDelay,
  MAX_RETRY_COUNT,
  MAX_SAME_URL_RETRY_COUNT,
  type MediaElement,
  type MediaSourceOrDelay,
  type SourceRefreshParams,
  toMediaElement,
} from "../helpers/comic_source.ts";
import type { Size } from "../helpers/size.ts";
import { viewerOptionsAtom } from "./viewer_base_atoms.ts";

export type PageModel = {
  index: number;
  state: PageState;
  div: HTMLDivElement | null;
  setDiv: (newDiv: HTMLDivElement | null) => void;
  sourceElement: MediaElement | null;
  reloadAtom: ReturnType<typeof atom<null, [cause: "load" | "error"], Promise<void>>>;
  fullWidth: boolean;
  shouldBeOriginalSize: boolean;
  divCss: CSS;
  imageProps?: ImageProps;
  videoProps?: VideoProps;
};

type PageState =
  & {
    source: MediaElement;
  }
  & ({
    status: "loading";
  } | {
    status: "error";
    urls: string[];
  } | {
    status: "complete";
    source: MediaElement;
  });

type VideoProps = React.DetailedHTMLProps<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
>;

type ImageProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

/** max of current screen size or scroll element size */
const maxSizeStateAtom = atom({ width: screen.width, height: screen.height });
export const maxSizeAtom = atom(
  (get) => get(maxSizeStateAtom),
  (get, set, size: Size) => {
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

export const pageAtomsAtom = atom<Atom<PageModel>[]>([]);

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
    source: toMediaElement(initialSource),
  });

  const loadAtom = atom(null, async (get, set, cause: "load" | "error") => {
    if (cause === "load") {
      triedUrls.length = 0;
    }

    if (isComplete()) {
      return;
    }

    let newSource: MediaSourceOrDelay;

    try {
      newSource = await set(refreshMediaSourceAtom, { cause, page: index });
    } catch (error) {
      console.error(error);
      set(stateAtom, (previous) => ({
        ...previous,
        status: "error",
        urls: Array.from(triedUrls),
      }));
      return;
    }

    if (isComplete()) {
      return;
    }

    if (isDelay(newSource)) {
      set(stateAtom, { status: "error", urls: [], source: new Image() });
      return;
    }

    const source = toMediaElement(newSource);
    triedUrls.push(source.src);
    set(stateAtom, { status: "loading", source });

    function isComplete() {
      return get(stateAtom).status === "complete";
    }
  });

  const aggregateAtom = atom<PageModel>((get) => {
    get(loadAtom);

    const state = get(stateAtom);
    const scrollElementSize = get(scrollElementSizeAtom);
    const compactWidthIndex = get(singlePageCountAtom);
    const maxZoomInExponent = get(maxZoomInExponentAtom);
    const maxZoomOutExponent = get(maxZoomOutExponentAtom);

    const source = state.source;
    const width = source instanceof HTMLImageElement
      ? source.naturalWidth
      : source instanceof HTMLVideoElement
      ? source.videoWidth
      : undefined;
    const height = source instanceof HTMLImageElement
      ? source.naturalHeight
      : source instanceof HTMLVideoElement
      ? source.videoHeight
      : undefined;

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

    const attributes = Object.fromEntries(
      [...source.attributes].map(({ name, value }) => [name, value]),
    );
    const mediaProps = { ...attributes, onError: reload };

    const divCss = {
      ...(shouldBeOriginalSize
        ? { minHeight: scrollElementSize.height, height: "auto" }
        : { height: scrollElementSize.height }),
      ...(state.status !== "complete"
        ? { aspectRatio: width && height ? `${width} / ${height}` : "3 / 4" }
        : {}),
    } satisfies CSS;

    return {
      index,
      state,
      div,
      setDiv: (newDiv: HTMLDivElement | null) => {
        div = newDiv;
      },
      sourceElement: initialSource instanceof HTMLElement ? initialSource : null,
      reloadAtom: loadAtom,
      fullWidth: index < compactWidthIndex || canMessUpRow,
      shouldBeOriginalSize,
      divCss,
      imageProps: source && source instanceof HTMLImageElement
        ? { ...mediaProps, onLoad: setCompleteState } satisfies ImageProps
        : undefined,
      videoProps: source instanceof HTMLVideoElement
        ? {
          controls: true,
          autoPlay: true,
          loop: true,
          muted: true,
          ...mediaProps,
          onLoadedMetadata: setCompleteState,
        } satisfies VideoProps
        : undefined,
    };
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

    set(stateAtom, () => ({
      status: "loading",
      source: new Image(),
    }));
    await set(loadAtom, "error");
  }

  function setCompleteState(event: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) {
    const element = event.currentTarget;
    set(stateAtom, {
      status: "complete",
      source: element,
    });
  }

  if (isDelay(initialSource)) {
    set(loadAtom, "load");
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
