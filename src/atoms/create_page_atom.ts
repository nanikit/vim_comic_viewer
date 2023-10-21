import { atom, deferred } from "../deps.ts";
import { imageSourceToIterable } from "../services/image_source_to_iterable.ts";
import { ImageSource } from "../types.ts";
import { scrollObserverAtom } from "./viewer_atoms.ts";

type PageState = {
  src?: string;
  urls?: string[];
  state: "loading" | "complete" | "error";
};

type PageProps = {
  source: ImageSource;
};

export function createPageAtom({ source }: PageProps) {
  let imageLoad = deferred<boolean | null>();

  const stateAtom = atom<PageState>({ state: "loading" });
  const elementStateAtom = atom<HTMLImageElement | null>(null);
  const elementAtom = atom(
    (get) => get(elementStateAtom),
    (get, set, element: HTMLImageElement | null) => {
      set(elementStateAtom, (previous) => {
        const observer = get(scrollObserverAtom);
        if (previous) {
          observer?.unobserve(previous);
        }
        if (element) {
          observer?.observe(element);
        }
        return element;
      });
    },
  );

  const loadAtom = atom(null, async (_get, set) => {
    const urls = [];
    for await (const url of imageSourceToIterable(source)) {
      urls.push(url);
      imageLoad = deferred();
      set(stateAtom, { src: url, state: "loading" });
      const result = await imageLoad;
      switch (result) {
        case true:
          set(stateAtom, { src: url, state: "complete" });
          return;
        case null:
          return;
      }
    }
    set(stateAtom, { urls, state: "error" });
  });
  loadAtom.onMount = (set) => {
    set();
  };

  const reloadAtom = atom(null, async (_get, set) => {
    set(stateAtom, { state: "complete" });
    imageLoad.resolve(null);
    await set(loadAtom);
  });

  const aggregateAtom = atom((get) => {
    get(loadAtom);

    const src = get(stateAtom).src;
    return {
      state: get(stateAtom),
      elementAtom,
      reloadAtom,
      imageProps: {
        key: `${elementAtom}`,
        ...(src ? { src } : {}),
        onError: () => imageLoad.resolve(false),
        onLoad: () => imageLoad.resolve(true),
      },
    };
  });

  return aggregateAtom;
}
