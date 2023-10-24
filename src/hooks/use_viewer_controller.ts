import {
  cancelDownloadAtom,
  downloadAndSaveAtom,
  downloadProgressAtom,
  startDownloadAtom,
  UserDownloadOptions,
} from "../atoms/downloader_atoms.ts";
import { goNextAtom, goPreviousAtom } from "../atoms/navigation_atoms.ts";
import { compactWidthIndexAtom } from "../atoms/persistent_atoms.ts";
import {
  pagesAtom,
  reloadErroredAtom,
  setViewerOptionsAtom,
  toggleFullscreenAtom,
  viewerElementAtom,
  viewerStateAtom,
} from "../atoms/viewer_atoms.ts";
import { unmountComponentAtNode, useMemo, useStore } from "../deps.ts";
import { ViewerOptions } from "../types.ts";

export type ViewerController = ReturnType<typeof createViewerController>;

export function useViewerController() {
  const store = useStore();
  return useMemo(() => createViewerController(store), [store]);
}

function createViewerController(store: ReturnType<typeof useStore>) {
  const downloader = {
    get progress() {
      return store.get(downloadProgressAtom);
    },
    download: (options?: UserDownloadOptions) => store.set(startDownloadAtom, options),
    downloadAndSave: (options?: UserDownloadOptions) => store.set(downloadAndSaveAtom, options),
    cancel: () => store.set(cancelDownloadAtom),
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
    downloader,
    get pages() {
      return store.get(pagesAtom);
    },
    set compactWidthIndex(value: number) {
      store.set(compactWidthIndexAtom, Math.max(0, value));
    },

    setOptions: (value: ViewerOptions) => store.set(setViewerOptionsAtom, value),
    goPrevious: () => store.set(goPreviousAtom),
    goNext: () => store.set(goNextAtom),
    toggleFullscreen: () => store.set(toggleFullscreenAtom),
    reloadErrored: () => store.set(reloadErroredAtom),
    unmount: () => unmountComponentAtNode(store.get(viewerElementAtom)!),
  };
}
