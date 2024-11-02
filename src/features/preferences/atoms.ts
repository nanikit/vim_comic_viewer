import { atom, type Getter, SetStateAction, type WritableAtom } from "jotai";
import { atomWithCache, loadable, RESET, type Setter } from "../../deps.ts";
import { atomWithGmValue, atomWithSession } from "./helpers/atoms_with_storage.ts";
import { defaultPreferences, PersistentPreferences } from "./models.ts";

/**
 * Default preferences that the library user can set.
 *
 * These values will override the default preferences but can be further overridden by user-set manual preferences.
 */
export const scriptPreferencesAtom = atom<Partial<PersistentPreferences>>({});

/** Userscript can be run on multiple sites, so apply different preferences by this. */
export const preferencesPresetAtom = atom("default");

export const [backgroundColorAtom] = atomWithPreferences("backgroundColor");

const [singlePageCountPersistentAtom] = atomWithPreferences("singlePageCount");
export const singlePageCountAtom = atom(
  (get) => get(singlePageCountPersistentAtom),
  (_get, set, value: number | typeof RESET) => {
    const clampedValue = typeof value === "number" ? Math.max(0, value) : value;
    return set(singlePageCountPersistentAtom, clampedValue);
  },
);

/** maxZoomOutRatio = Math.sqrt(2) ** maxZoomOutExponent */
export const [maxZoomOutExponentAtom] = atomWithPreferences("maxZoomOutExponent");
export const [maxZoomInExponentAtom] = atomWithPreferences("maxZoomInExponent");
export const [pageDirectionAtom] = atomWithPreferences("pageDirection");
export const [isFullscreenPreferredAtom, isFullscreenPreferredPromiseAtom] = atomWithPreferences(
  "isFullscreenPreferred",
);
export const [fullscreenNoticeCountAtom, fullscreenNoticeCountPromiseAtom] = atomWithPreferences(
  "fullscreenNoticeCount",
);

/** Whether the viewer was in immersive mode when the page was unloaded. */
export const wasImmersiveAtom = atomWithSession("vim_comic_viewer.was_immersive", false);

export const effectivePreferencesAtom = atom(
  (get) => ({
    backgroundColor: get(backgroundColorAtom),
    singlePageCount: get(singlePageCountAtom),
    maxZoomOutExponent: get(maxZoomOutExponentAtom),
    maxZoomInExponent: get(maxZoomInExponentAtom),
    pageDirection: get(pageDirectionAtom),
    isFullscreenPreferred: get(isFullscreenPreferredAtom),
    fullscreenNoticeCount: get(fullscreenNoticeCountAtom),
  }),
  (get, set, update: SetStateAction<Partial<PersistentPreferences>>): Promise<unknown> => {
    if (typeof update === "function") {
      const preferences = get(effectivePreferencesAtom);
      const newPreferences = update(preferences);
      return updatePreferences(newPreferences);
    }

    return updatePreferences(update);

    function updatePreferences(preferences: Partial<PersistentPreferences>) {
      return Promise.all([
        updateIfDefined(backgroundColorAtom, preferences.backgroundColor),
        updateIfDefined(singlePageCountAtom, preferences.singlePageCount),
        updateIfDefined(maxZoomOutExponentAtom, preferences.maxZoomOutExponent),
        updateIfDefined(maxZoomInExponentAtom, preferences.maxZoomInExponent),
        updateIfDefined(pageDirectionAtom, preferences.pageDirection),
        updateIfDefined(isFullscreenPreferredAtom, preferences.isFullscreenPreferred),
        updateIfDefined(fullscreenNoticeCountAtom, preferences.fullscreenNoticeCount),
      ]);
    }

    function updateIfDefined<T>(atom: WritableAtom<T, [T], Promise<void>>, value?: T) {
      return value !== undefined ? set(atom, value) : Promise.resolve();
    }
  },
);

function atomWithPreferences<T extends keyof PersistentPreferences>(key: T) {
  const asyncAtomAtom = atom((get) => {
    const preset = get(preferencesPresetAtom);
    const qualifiedKey = `vim_comic_viewer.preferences.${preset}.${key}`;
    return atomWithGmValue<PersistentPreferences[T] | undefined>(qualifiedKey, undefined);
  });

  const cacheAtom = atomWithCache((get) => get(get(asyncAtomAtom)));
  const manualAtom = atom((get) => get(cacheAtom), updater);

  const loadableAtom = loadable(manualAtom);
  const effectiveAtom = atom((get) => {
    const value = get(loadableAtom);
    if (value.state === "hasData" && value.data !== undefined) {
      return value.data;
    }
    return get(scriptPreferencesAtom)[key] ?? defaultPreferences[key];
  }, updater);

  return [effectiveAtom, manualAtom] as const;

  function updater(
    get: Getter,
    set: Setter,
    update:
      | PersistentPreferences[T]
      | typeof RESET
      | ((value?: PersistentPreferences[T]) => PersistentPreferences[T]),
  ) {
    return set(
      get(asyncAtomAtom),
      (value) => typeof update === "function" ? Promise.resolve(value).then(update) : update,
    );
  }
}
