import type { SetStateAction } from "jotai";
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
import {
  reloadErroredAtom,
  rootAtom,
  setViewerImmersiveAtom,
  toggleFullscreenAtom,
  toggleImmersiveAtom,
  viewerModeAtom,
} from "../atoms/viewer_atoms.ts";
import { atom, Getter, Setter } from "../deps.ts";
import {
  anchorSinglePageCountAtom,
  goNextAtom,
  goPreviousAtom,
} from "../features/navigation/atoms.ts";
import {
  effectivePreferencesAtom,
  preferencesPresetAtom,
  scriptPreferencesAtom,
} from "../features/preferences/atoms.ts";
import { PersistentPreferences } from "../features/preferences/models.ts";
import { isTyping } from "../utils.ts";
import { pageAtomsAtom } from "./create_page_atom.ts";
import { type ViewerOptions, viewerOptionsAtom, viewerStatusAtom } from "./viewer_base_atoms.ts";

export type ViewerController = InstanceType<typeof Controller>;

const controllerPrimitiveAtom = atom<ViewerController | null>(null);
export const controllerAtom = atom((get) => get(controllerPrimitiveAtom), (get, set) => {
  const existing = get(controllerPrimitiveAtom);
  if (existing) {
    return existing;
  }

  const controller = new Controller(get, set);
  set(controllerPrimitiveAtom, controller);
  return controller;
});
controllerAtom.onMount = (set) => void set();

class Controller {
  private currentElementKeyHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor(private get: Getter, private set: Setter) {
    addEventListener("keydown", this.defaultGlobalKeyHandler);
    this.elementKeyHandler = this.defaultElementKeyHandler;
  }

  get options() {
    return this.get(viewerOptionsAtom);
  }

  get status() {
    return this.get(viewerStatusAtom);
  }

  get container() {
    return this.get(scrollBarStyleFactorAtom).viewerElement;
  }

  downloader = {
    download: (options?: UserDownloadOptions) => this.set(startDownloadAtom, options),
    downloadAndSave: (options?: UserDownloadOptions) => this.set(downloadAndSaveAtom, options),
    cancel: () => this.set(cancelDownloadAtom),
  };

  get pages() {
    return this.get(pageAtomsAtom).map(this.get);
  }

  get viewerMode() {
    return this.get(viewerModeAtom);
  }

  get effectivePreferences() {
    return this.get(effectivePreferencesAtom);
  }

  set elementKeyHandler(handler: ((event: KeyboardEvent) => void) | null) {
    const { currentElementKeyHandler, container } = this;
    const scrollable = this.container?.querySelector("div[data-overlayscrollbars-viewport]") as
      | HTMLDivElement
      | null;

    if (currentElementKeyHandler) {
      container?.removeEventListener("keydown", currentElementKeyHandler);
      scrollable?.removeEventListener("keydown", currentElementKeyHandler);
    }

    if (handler) {
      container?.addEventListener("keydown", handler);
      scrollable?.addEventListener("keydown", handler);
    }
  }

  setOptions = (value: ViewerOptions) => {
    this.set(viewerOptionsAtom, value);
  };

  goPrevious = () => {
    this.set(goPreviousAtom);
  };

  goNext = () => {
    this.set(goNextAtom);
  };

  setManualPreferences = (
    value: SetStateAction<Partial<Omit<PersistentPreferences, "isFullscreenPreferred">>>,
  ) => {
    return this.set(effectivePreferencesAtom, value);
  };

  setScriptPreferences = ({
    manualPreset,
    preferences,
  }: {
    manualPreset?: string;
    preferences?: Partial<PersistentPreferences>;
  }) => {
    if (manualPreset) {
      this.set(preferencesPresetAtom, manualPreset);
    }
    if (preferences) {
      this.set(scriptPreferencesAtom, preferences);
    }
  };

  setImmersive = (value: boolean) => {
    return this.set(setViewerImmersiveAtom, value);
  };

  setIsFullscreenPreferred = (value: boolean) => {
    return this.set(isFullscreenPreferredSettingsAtom, value);
  };

  toggleImmersive = () => {
    this.set(toggleImmersiveAtom);
  };

  toggleFullscreen = () => {
    this.set(toggleFullscreenAtom);
  };

  reloadErrored = () => {
    this.set(reloadErroredAtom);
  };

  unmount = () => {
    return this.get(rootAtom)?.unmount();
  };

  defaultElementKeyHandler = (event: KeyboardEvent) => {
    if (maybeNotHotkey(event)) {
      return false;
    }

    const isHandled = this.handleElementKey(event);
    if (isHandled) {
      event.stopPropagation();
      event.preventDefault();
    }

    return isHandled;
  };

  defaultGlobalKeyHandler = (event: KeyboardEvent): boolean => {
    if (maybeNotHotkey(event)) {
      return false;
    }

    if (["KeyI", "Numpad0", "Enter"].includes(event.code)) {
      if (event.shiftKey) {
        this.toggleFullscreen();
      } else {
        this.toggleImmersive();
      }
      return true;
    }
    return false;
  };

  private handleElementKey(event: KeyboardEvent) {
    switch (event.key) {
      case "j":
      case "ArrowDown":
      case "q":
        this.goNext();
        return true;
      case "k":
      case "ArrowUp":
        this.goPrevious();
        return true;
      case "h":
      case "ArrowLeft":
        if (this.options.onPreviousSeries) {
          this.options.onPreviousSeries();
          return true;
        }
        return false;
      case "l":
      case "ArrowRight":
      case "w":
        if (this.options.onNextSeries) {
          this.options.onNextSeries();
          return true;
        }
        return false;
      case ";":
        this.downloader?.downloadAndSave();
        return true;
      case ",":
        void this.addSinglePageCount(-1);
        return true;
      case ".":
        void this.addSinglePageCount(1);
        return true;
      case "/":
        this.set(anchorSinglePageCountAtom);
        return true;
      case "'":
        this.reloadErrored();
        return true;
      default:
        return false;
    }
  }

  private async addSinglePageCount(diff: number) {
    await this.setManualPreferences((preferences) => ({
      ...preferences,
      singlePageCount: this.effectivePreferences.singlePageCount + diff,
    }));
  }
}

function maybeNotHotkey(event: KeyboardEvent) {
  const { ctrlKey, altKey, metaKey } = event;
  return ctrlKey || altKey || metaKey || isTyping(event);
}
