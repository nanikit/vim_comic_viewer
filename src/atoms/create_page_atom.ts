import { atom, deferred } from "../deps.ts";
import {
  maxZoomInExponentAtom,
  maxZoomOutExponentAtom,
  singlePageCountAtom,
} from "../features/preferences/atoms.ts";
import { imageSourceToIterable } from "../services/image_source_to_iterable.ts";
import { ImageSource } from "../types.ts";
import { scrollElementSizeAtom } from "./navigation_atoms.ts";

type PageState = {
  status: "loading";
  src?: string;
} | {
  status: "error";
  urls: string[];
} | {
  status: "complete";
  src: string;
  naturalHeight: number;
};

export type PageAtom = ReturnType<typeof createPageAtom>;

export function createPageAtom({ index, source }: { index: number; source: ImageSource }) {
  let imageLoad = deferred<HTMLImageElement | false | null>();
  let div: HTMLDivElement | null = null;

  const stateAtom = atom<PageState>({ status: "loading" });
  const loadAtom = atom(null, async (_get, set) => {
    imageLoad.resolve(null);

    const urls = [];
    for await (const url of imageSourceToIterable(source)) {
      urls.push(url);
      imageLoad = deferred();
      set(stateAtom, { src: url, status: "loading" });

      const result = await imageLoad;
      switch (result) {
        case false:
          continue;
        case null:
          return;
        default: {
          const img = result;
          set(stateAtom, { src: url, naturalHeight: img.naturalHeight, status: "complete" });
          return;
        }
      }
    }
    set(stateAtom, { urls, status: "error" });
  });
  loadAtom.onMount = (set) => {
    set();
  };

  const aggregateAtom = atom((get) => {
    get(loadAtom);

    const state = get(stateAtom);
    const compactWidthIndex = get(singlePageCountAtom);
    const ratio = getImageToViewerSizeRatio({ viewerSize: get(scrollElementSizeAtom), state });
    const shouldBeOriginalSize = shouldPageBeOriginalSize({
      maxZoomInExponent: get(maxZoomInExponentAtom),
      maxZoomOutExponent: get(maxZoomOutExponentAtom),
      imageRatio: ratio,
    });
    const isLarge = ratio > 1;
    const canMessUpRow = shouldBeOriginalSize && isLarge;

    return {
      state,
      div,
      setDiv: (newDiv: HTMLDivElement | null) => {
        div = newDiv;
      },
      reloadAtom: loadAtom,
      fullWidth: index < compactWidthIndex || canMessUpRow,
      shouldBeOriginalSize,
      imageProps: {
        ...("src" in state ? { src: state.src } : {}),
        onError: () => imageLoad.resolve(false),
        onLoad: ((event) => imageLoad.resolve(event.currentTarget)) as React.ReactEventHandler<
          HTMLImageElement
        >,
      },
    };
  });

  return aggregateAtom;
}

function getImageToViewerSizeRatio(
  { viewerSize, state }: { viewerSize: { width: number; height: number }; state: PageState },
) {
  if (!viewerSize) {
    return 1;
  }

  if (state.status !== "complete") {
    return 1;
  }

  return state.naturalHeight / viewerSize.height;
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
