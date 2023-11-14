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
  pagesAtom,
  reloadErroredAtom,
  rootAtom,
  setViewerImmersiveAtom,
  setViewerOptionsAtom,
  toggleFullscreenAtom,
  toggleImmersiveAtom,
  viewerModeAtom,
  viewerStateAtom,
} from "../atoms/viewer_atoms.ts";
import { atom, Getter, Setter } from "../deps.ts";
import { ViewerOptions } from "../types.ts";
import { isTyping } from "../utils.ts";

export type ViewerController = ReturnType<typeof createViewerController>;

const controllerAtom = atom<ViewerController | null>(null);
export const controllerCreationAtom = atom((get) => get(controllerAtom), (get, set) => {
  if (!get(controllerAtom)) {
    set(controllerAtom, createViewerController(get, set));
  }
  return get(controllerAtom);
});
controllerCreationAtom.onMount = (set) => {
  set();
};

function createViewerController(get: Getter, set: Setter) {
  const downloader = {
    download: (options?: UserDownloadOptions) => set(startDownloadAtom, options),
    downloadAndSave: (options?: UserDownloadOptions) => set(downloadAndSaveAtom, options),
    cancel: () => set(cancelDownloadAtom),
  };

  const elementKeyHandler = (event: KeyboardEvent): boolean => {
    if (maybeNotHotkey(event)) {
      return false;
    }

    switch (event.key) {
      case "j":
      case "ArrowDown":
        controller.goNext();
        event.preventDefault();
        break;
      case "k":
      case "ArrowUp":
        controller.goPrevious();
        event.preventDefault();
        break;
      case ";":
        controller.downloader?.downloadAndSave();
        break;
      case "/":
        controller.compactWidthIndex++;
        break;
      case "?":
        controller.compactWidthIndex--;
        break;
      case "'":
        controller.reloadErrored();
        break;
      default:
        return false;
    }

    event.stopPropagation();
    return true;
  };

  const globalKeyHandler = (event: KeyboardEvent): boolean => {
    if (maybeNotHotkey(event)) {
      return false;
    }

    if (["KeyI", "Numpad0", "Enter"].includes(event.code)) {
      if (event.shiftKey) {
        controller.toggleFullscreen();
      } else {
        controller.toggleImmersive();
      }
      return true;
    }
    return false;
  };

  const controller = {
    get options() {
      return get(viewerStateAtom).options;
    },
    get status() {
      return get(viewerStateAtom).status;
    },
    get container() {
      return get(scrollBarStyleFactorAtom).viewerElement;
    },
    get compactWidthIndex() {
      return get(singlePageCountAtom);
    },
    downloader,
    get pages() {
      return get(pagesAtom);
    },
    get viewerMode() {
      return get(viewerModeAtom);
    },
    get isFullscreenPreferred() {
      return get(isFullscreenPreferredAtom);
    },
    set compactWidthIndex(value: number) {
      set(singlePageCountAtom, Math.max(0, value));
    },

    setOptions: (value: ViewerOptions) => set(setViewerOptionsAtom, value),
    goPrevious: () => set(goPreviousAtom),
    goNext: () => set(goNextAtom),
    setImmersive: (value: boolean) => {
      return set(setViewerImmersiveAtom, value);
    },
    setIsFullscreenPreferred: (value: boolean) => {
      return set(isFullscreenPreferredSettingsAtom, value);
    },
    toggleImmersive: () => set(toggleImmersiveAtom),
    toggleFullscreen: () => set(toggleFullscreenAtom),
    reloadErrored: () => set(reloadErroredAtom),
    elementKeyHandler,
    globalKeyHandler,
    unmount: () => get(rootAtom)?.unmount(),
  };

  return controller;
}

function maybeNotHotkey(event: KeyboardEvent) {
  const { ctrlKey, altKey, metaKey } = event;
  return ctrlKey || altKey || metaKey || isTyping(event);
}
