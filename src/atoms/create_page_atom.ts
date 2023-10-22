import { atom, deferred } from "../deps.ts";
import { imageSourceToIterable } from "../services/image_source_to_iterable.ts";
import { ImageSource } from "../types.ts";
import { maxMagnificationRatioAtom, minMagnificationRatioAtom } from "./setting_atoms.ts";
import { viewerSizeAtom } from "./viewer_state_atoms.ts";

type PageState = {
  state: "loading";
  src?: string;
} | {
  state: "error";
  urls: string[];
} | {
  state: "complete";
  src: string;
  naturalHeight: number;
};

export type PageAtom = ReturnType<typeof createPageAtom>;

export function createPageAtom({ source }: { source: ImageSource }) {
  let imageLoad = deferred<HTMLImageElement | false | null>();

  const stateAtom = atom<PageState>({ state: "loading" });
  const loadAtom = atom(null, async (_get, set) => {
    const urls = [];
    for await (const url of imageSourceToIterable(source)) {
      urls.push(url);
      imageLoad = deferred();
      set(stateAtom, { src: url, state: "loading" });

      const result = await imageLoad;
      switch (result) {
        case false:
          continue;
        case null:
          return;
        default: {
          const img = result;
          set(stateAtom, { src: url, naturalHeight: img.naturalHeight, state: "complete" });
          return;
        }
      }
    }
    set(stateAtom, { urls, state: "error" });
  });
  loadAtom.onMount = (set) => {
    set();
  };

  const reloadAtom = atom(null, async (_get, set) => {
    imageLoad.resolve(null);
    await set(loadAtom);
  });

  const viewAsOriginalSizeAtom = atom((get) => {
    const viewerSize = get(viewerSizeAtom);
    if (!viewerSize) {
      return false;
    }

    const state = get(stateAtom);
    if (state.state !== "complete") {
      return false;
    }

    const minRatio = get(minMagnificationRatioAtom);
    const maxRatio = get(maxMagnificationRatioAtom);
    const ratio = viewerSize.height / state.naturalHeight;
    const isFit = minRatio <= ratio && ratio <= maxRatio;
    return !isFit;
  });

  const aggregateAtom = atom((get) => {
    get(loadAtom);

    const state = get(stateAtom);

    return {
      state,
      reloadAtom,
      imageProps: {
        originalSize: get(viewAsOriginalSizeAtom),
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
