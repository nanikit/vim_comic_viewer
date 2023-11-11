import {
  cancelDownloadAtom,
  downloadAndSaveAtom,
  startDownloadAtom,
  UserDownloadOptions,
} from "../atoms/downloader_atoms.tsx";
import {
  isFullscreenPreferredSettingsAtom,
  scrollBarStyleFactorAtom,
} from "../atoms/fullscreen_atom.ts";
import { goNextAtom, goPreviousAtom } from "../atoms/navigation_atoms.ts";
import { isFullscreenPreferredAtom, singlePageCountAtom } from "../atoms/persistent_atoms.ts";
import {
  isViewerImmersiveAtom,
  pagesAtom,
  reloadErroredAtom,
  rootAtom,
  setViewerOptionsAtom,
  viewerModeAtom,
  viewerStateAtom,
} from "../atoms/viewer_atoms.ts";
import { useMemo, useStore } from "../deps.ts";
import { ViewerOptions } from "../types.ts";

export type ViewerController = ReturnType<typeof createViewerController>;

export function useViewerController() {
  const store = useStore();
  return useMemo(() => createViewerController(store), [store]);
}

function createViewerController(store: ReturnType<typeof useStore>) {
  const downloader = {
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
      return store.get(scrollBarStyleFactorAtom).viewerElement;
    },
    get compactWidthIndex() {
      return store.get(singlePageCountAtom);
    },
    downloader,
    get pages() {
      return store.get(pagesAtom);
    },
    get viewerMode() {
      return store.get(viewerModeAtom);
    },
    get isFullscreenPreferred() {
      return store.get(isFullscreenPreferredAtom);
    },
    set compactWidthIndex(value: number) {
      store.set(singlePageCountAtom, Math.max(0, value));
    },

    setOptions: (value: ViewerOptions) => store.set(setViewerOptionsAtom, value),
    goPrevious: () => store.set(goPreviousAtom),
    goNext: () => store.set(goNextAtom),
    setImmersive: (value: boolean) => {
      return store.set(isViewerImmersiveAtom, value);
    },
    setIsFullscreenPreferred: (value: boolean) => {
      return store.set(isFullscreenPreferredSettingsAtom, value);
    },
    reloadErrored: () => store.set(reloadErroredAtom),
    unmount: () => store.get(rootAtom)?.unmount(),
  };
}
