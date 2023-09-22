import { useStore } from "jotai";
import { toggleFullscreenAtom } from "../atoms/fullscreen_element_atom.ts";
import {
  compactWidthIndexAtom,
  goNextAtom,
  goPreviousAtom,
  setViewerOptionsAtom,
  viewerElementAtom,
  viewerStateAtom,
} from "../atoms/viewer_atoms.ts";
import { unmountComponentAtNode, useMemo } from "../deps.ts";
import { ViewerOptions } from "../types.ts";
import { createPageAtom } from "./create_page_atom.ts";
import { makeDownloader } from "./make_downloader.ts";

export function useViewerController(): ReturnType<typeof createViewerController> {
  const store = useStore();
  return useMemo(() => createViewerController(store), [store]);
}

type MaybeDownloader = { downloader?: ReturnType<typeof makeDownloader> };
type MaybePages = { pages?: ReturnType<typeof createPageAtom>[] };

function createViewerController(store: ReturnType<typeof useStore>) {
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
      return store.get(viewerElementAtom);
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

    setOptions: (value: ViewerOptions) => store.set(setViewerOptionsAtom, value),
    goPrevious: () => store.set(goPreviousAtom),
    goNext: () => store.set(goNextAtom),
    toggleFullscreen: () => store.set(toggleFullscreenAtom),
    reloadErrored,
    unmount: () => unmountComponentAtNode(store.get(viewerElementAtom)!),
  };
}
