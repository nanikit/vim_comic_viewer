import { atom, deferred } from "../deps.ts";
import { imageSourceToIterable } from "../services/image_source_to_iterable.ts";
import { ImageSource } from "../types.ts";
import { scrollElementSizeAtom } from "./navigation_atoms.ts";
import {
  compactWidthIndexAtom,
  maxZoomInExponentAtom,
  maxZoomOutExponentAtom,
} from "./persistent_atoms.ts";

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

  const stateAtom = atom<PageState>({ status: "loading" });
  const loadAtom = atom(null, async (_get, set) => {
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

  const reloadAtom = atom(null, async (_get, set) => {
    imageLoad.resolve(null);
    await set(loadAtom);
  });

  const imageToViewerSizeRatioAtom = atom((get) => {
    const viewerSize = get(scrollElementSizeAtom);
    if (!viewerSize) {
      return 1;
    }

    const state = get(stateAtom);
    if (state.status !== "complete") {
      return 1;
    }

    return state.naturalHeight / viewerSize.height;
  });

  const shouldBeOriginalSizeAtom = atom((get) => {
    const maxZoomInExponent = get(maxZoomInExponentAtom);
    const maxZoomOutExponent = get(maxZoomOutExponentAtom);
    const imageRatio = get(imageToViewerSizeRatioAtom);
    const minZoomRatio = Math.sqrt(2) ** maxZoomOutExponent;
    const maxZoomRatio = Math.sqrt(2) ** maxZoomInExponent;
    const isOver = minZoomRatio < imageRatio || imageRatio < 1 / maxZoomRatio;
    return isOver;
  });

  const divAtom = atom<HTMLDivElement | null>(null);

  const aggregateAtom = atom((get) => {
    get(loadAtom);

    const state = get(stateAtom);
    const compactWidthIndex = get(compactWidthIndexAtom);
    const shouldBeOriginalSize = get(shouldBeOriginalSizeAtom);
    const ratio = get(imageToViewerSizeRatioAtom);
    const isLarge = ratio > 1;
    const canMessUpRow = shouldBeOriginalSize && isLarge;

    return {
      state,
      divAtom,
      reloadAtom,
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
