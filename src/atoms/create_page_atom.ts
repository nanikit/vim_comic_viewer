import type { CSS } from "@stitches/react";
import type { Atom, Setter } from "jotai";
import { atom } from "../deps.ts";
import { scrollElementSizeAtom, singlePageCountAtom } from "../features/navigation/atoms.ts";
import { maxZoomInExponentAtom, maxZoomOutExponentAtom } from "../features/preferences/atoms.ts";
import {
  MAX_RETRY_COUNT,
  type MediaElement,
  type MediaSourceResolver,
  normalizeMediaElement,
  type SourceRefreshParams,
} from "../helpers/comic_source.ts";
import type { Size } from "../helpers/size.ts";
import { viewerOptionsAtom } from "./viewer_base_atoms.ts";

export type PageModel = {
  index: number;
  state: PageState;
  mediaKey: number;
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

type RefreshMediaSourceParams = SourceRefreshParams & { index?: number };

export const refreshMediaSourceAtom = atom(
  null,
  async (get, set, params: RefreshMediaSourceParams) => {
    const { source } = get(viewerOptionsAtom);
    if (!source) {
      return;
    }

    const resolvers = await source();
    if (source !== get(viewerOptionsAtom).source) {
      return;
    }

    if (!Array.isArray(resolvers)) {
      throw new Error(`Invalid comic source, expected array, got ${typeof resolvers}`);
    }

    if (params.cause === "load" && params.index === undefined) {
      set(
        pageAtomsAtom,
        resolvers.map((media, index) => createPageAtom({ resolver: media, index, set })),
      );
    }

    if (params.index !== undefined) {
      return resolvers[params.index];
    }
  },
);

export function createPageAtom(
  params: { resolver: MediaSourceResolver; index: number; set: Setter },
) {
  const { resolver, index, set } = params;
  const triedUrls = new Set<string>();
  let tryCount = 0;
  let div: HTMLDivElement | null = null;
  let sourceElement: MediaElement | null = null;

  const stateAtom = atom<PageState>({
    status: "loading",
    source: new Image(),
  });

  const loadAtom = atom(null, async (get, set, cause: "load" | "error") => {
    if (isComplete()) {
      return;
    }

    if (!resolver) {
      set(stateAtom, { status: "error", urls: [], source: new Image() });
      return;
    }

    if (cause === "load") {
      tryCount = 0;
      triedUrls.clear();
    }
    set(stateAtom, { status: "loading", source: new Image() });

    let loadedSource: MediaElement;
    try {
      tryCount++;
      loadedSource = await resolver({ cause });
    } catch (error) {
      console.error(error);
      set(stateAtom, (previous) => ({
        ...previous,
        status: "error",
        urls: Array.from(triedUrls),
      }));
      return;
    }

    sourceElement = loadedSource.isConnected ? loadedSource : null;
    const source = normalizeMediaElement(loadedSource);
    triedUrls.add(source.src);
    if (source instanceof HTMLImageElement && source.srcset) {
      const urls = source.srcset.split(",").flatMap((x) => {
        const url = x.split(/\s+/)[0];
        return url ? [url] : [];
      });
      for (const url of urls) {
        triedUrls.add(url);
      }
    }

    set(stateAtom, { status: "loading", source });

    function isComplete() {
      return get(stateAtom).status === "complete";
    }
  });

  const aggregateAtom = atom<PageModel>((get) => {
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
    const { width: _w, height: _h, style: _s, ...filteredAttributes } = attributes;
    const mediaProps = { ...filteredAttributes, onError: reload };

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
      mediaKey: tryCount,
      div,
      setDiv: (newDiv: HTMLDivElement | null) => {
        div = newDiv;
      },
      sourceElement,
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
    if (tryCount >= MAX_RETRY_COUNT) {
      set(stateAtom, (previous) => ({
        ...previous,
        status: "error",
        urls: [...new Set(triedUrls)],
      }));
      return;
    }

    await set(loadAtom, "error");
  }

  function setCompleteState(event: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) {
    const element = event.currentTarget;
    set(stateAtom, {
      status: "complete",
      source: element,
    });
  }

  set(loadAtom, "load");

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
