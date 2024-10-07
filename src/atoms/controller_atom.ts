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
import { goNextAtom, goPreviousAtom } from "../atoms/navigation_atoms.ts";
import {
  reloadErroredAtom,
  rootAtom,
  setViewerImmersiveAtom,
  setViewerOptionsAtom,
  toggleFullscreenAtom,
  toggleImmersiveAtom,
  viewerModeAtom,
} from "../atoms/viewer_atoms.ts";
import { atom, Getter, Setter } from "../deps.ts";
import {
  manualPreferencesAtom,
  preferencesAtom,
  preferencesPresetAtom,
  scriptPreferencesAtom,
} from "../features/preferences/atoms.ts";
import { PersistentPreferences } from "../features/preferences/models.ts";
import { isTyping } from "../utils.ts";
import { pageAtomsAtom } from "./create_page_atom.ts";
import { type ViewerOptions, viewerStateAtom } from "./viewer_base_atoms.ts";

export type ViewerController = InstanceType<typeof Controller>;

const controllerAtom = atom<ViewerController | null>(null);
export const controllerCreationAtom = atom((get) => get(controllerAtom), (get, set) => {
  const existing = get(controllerAtom);
  if (existing) {
    return existing;
  }

  const controller = new Controller(get, set);
  set(controllerAtom, controller);
  return controller;
});
controllerCreationAtom.onMount = (set) => void set();

class Controller {
  private currentElementKeyHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor(private get: Getter, private set: Setter) {
    addEventListener("keydown", this.defaultGlobalKeyHandler);
    this.elementKeyHandler = this.defaultElementKeyHandler;
  }

  get options() {
    return this.get(viewerStateAtom).options;
  }

  get status() {
    return this.get(viewerStateAtom).status;
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
    return this.get(preferencesAtom);
  }

  get manualPreferences() {
    return this.get(manualPreferencesAtom);
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
    this.set(setViewerOptionsAtom, value);
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
    return this.set(manualPreferencesAtom, value);
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

    switch (event.key) {
      case "j":
      case "ArrowDown":
        event.stopPropagation();
        event.preventDefault();
        this.goNext();
        break;
      case "k":
      case "ArrowUp":
        event.stopPropagation();
        event.preventDefault();
        this.goPrevious();
        break;
      case ";":
        event.stopPropagation();
        this.downloader?.downloadAndSave();
        break;
      case "/":
        event.stopPropagation();
        (async () => {
          const effectivePreferences = await this.effectivePreferences;
          await this.setManualPreferences((preferences) => ({
            ...preferences,
            singlePageCount: effectivePreferences.singlePageCount + 1,
          }));
        })();
        break;
      case "?":
        event.stopPropagation();
        (async () => {
          const effectivePreferences = await this.effectivePreferences;
          await this.setManualPreferences((preferences) => ({
            ...preferences,
            singlePageCount: Math.max(0, effectivePreferences.singlePageCount - 1),
          }));
        })();
        break;
      case "'":
        event.stopPropagation();
        this.reloadErrored();
        break;
      default:
        return false;
    }

    return true;
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
}

function maybeNotHotkey(event: KeyboardEvent) {
  const { ctrlKey, altKey, metaKey } = event;
  return ctrlKey || altKey || metaKey || isTyping(event);
}
