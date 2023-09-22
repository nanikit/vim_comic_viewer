import { useAtomValue, useSetAtom, useStore } from "jotai";
import { toggleFullscreenAtom } from "../atoms/fullscreen_element_atom.ts";
import {
  compactWidthIndexAtom,
  setViewerOptionsAtom,
  viewerElementAtom,
  viewerStateAtom,
} from "../atoms/viewer_atoms.ts";
import { unmountComponentAtNode, useMemo } from "../deps.ts";
import { ViewerOptions } from "../types.ts";
import { createPageAtom } from "./create_page_atom.ts";
import { makeDownloader } from "./make_downloader.ts";
import { PageNavigator, usePageNavigator } from "./use_page_navigator.ts";

type MaybeDownloader = { downloader?: ReturnType<typeof makeDownloader> };
type MaybePages = { pages?: ReturnType<typeof createPageAtom>[] };

const makeViewerController = (
  { viewer, navigator, store, toggleFullscreen }: {
    viewer: HTMLDivElement | null;
    navigator: PageNavigator;
    store: ReturnType<typeof useStore>;
    toggleFullscreen: () => Promise<void>;
  },
) => {
  const reloadErrored = () => {
    window.stop();

    const viewer = store.get(viewerStateAtom) as MaybePages;
    for (const atom of viewer?.pages ?? []) {
      const page = store.get(atom);
      if (page.state.state !== "complete") {
        page.reload();
      }
    }
  };

  return {
    get options() {
      return store.get(viewerStateAtom).options;
    },
    get status() {
      return store.get(viewerStateAtom).status;
    },
    get container() {
      return viewer;
    },
    get compactWidthIndex() {
      return store.get(compactWidthIndexAtom);
    },
    get downloader() {
      return (store.get(viewerStateAtom) as MaybeDownloader).downloader;
    },
    get download() {
      const { downloader } = store.get(viewerStateAtom) as MaybeDownloader;
      return downloader?.download ?? (() => Promise.resolve(new Uint8Array()));
    },
    get pages() {
      return (store.get(viewerStateAtom) as MaybePages).pages;
    },
    set compactWidthIndex(value: number) {
      store.set(compactWidthIndexAtom, Math.max(0, value));
    },

    setOptions: (value: ViewerOptions) => {
      return store.set(setViewerOptionsAtom, value, navigator);
    },

    goPrevious: navigator.goPrevious,
    goNext: navigator.goNext,
    toggleFullscreen,
    reloadErrored,
    unmount: () => unmountComponentAtNode(viewer!),
  };
};

export const useViewerController = (): ReturnType<
  typeof makeViewerController
> => {
  const store = useStore();
  const navigator = usePageNavigator();
  const toggleFullscreen = useSetAtom(toggleFullscreenAtom);
  const viewer = useAtomValue(viewerElementAtom);
  const controller = useMemo(
    () => makeViewerController({ viewer, toggleFullscreen, navigator, store }),
    [viewer, navigator],
  );
  return controller;
};
