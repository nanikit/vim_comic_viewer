import { atom, SetStateAction } from "jotai";
import { loadable } from "../../deps.ts";
import { atomWithGmValue, atomWithSession } from "./helpers/atoms_with_storage.ts";
import { defaultPreferences, getEffectivePreferences, PersistentPreferences } from "./models.ts";

export const scriptPreferencesAtom = atom<Partial<PersistentPreferences>>({});
export const preferencesPresetAtom = atom("default");
const manualPreferencesAtomAtom = atom((get) => {
  const preset = get(preferencesPresetAtom);
  const key = `vim_comic_viewer.preferences.${preset}`;
  return atomWithGmValue<Partial<PersistentPreferences>>(key, {});
});
export const manualPreferencesAtom = atom(
  (get) => get(get(manualPreferencesAtomAtom)),
  (get, set, update: SetStateAction<Partial<PersistentPreferences>>) => {
    const preferencesAtom = get(manualPreferencesAtomAtom);
    if (typeof update !== "function") {
      return set(preferencesAtom, update);
    }

    return set(preferencesAtom, async (preferencesPromise) => {
      return update(await preferencesPromise);
    });
  },
);
export const preferencesAtom = atom((get) => {
  const script = get(scriptPreferencesAtom);
  const manual = get(manualPreferencesAtom);

  if ("then" in manual) {
    return new Promise<PersistentPreferences>((resolve) => {
      manual.then((manual) => resolve(getEffectivePreferences(script, manual)));
    });
  }
  return getEffectivePreferences(script, manual);
});

export const backgroundColorAtom = atomWithPreferences("backgroundColor");
export const singlePageCountAtom = atomWithPreferences("singlePageCount");
/** maxZoomOutRatio = Math.sqrt(2) ** maxZoomOutExponent */
export const maxZoomOutExponentAtom = atomWithPreferences("maxZoomOutExponent");
export const maxZoomInExponentAtom = atomWithPreferences("maxZoomInExponent");
export const pageDirectionAtom = atomWithPreferences("pageDirection");
export const isFullscreenPreferredAtom = atomWithPreferences("isFullscreenPreferred");
export const fullscreenNoticeCountAtom = atomWithPreferences("fullscreenNoticeCount");

/** Whether the viewer was in immersive mode when the page was unloaded. */
export const wasImmersiveAtom = atomWithSession("vim_comic_viewer.was_immersive", false);

function atomWithPreferences<T extends keyof PersistentPreferences>(key: T) {
  const loadableAtom = loadable(preferencesAtom);
  return atom(
    (get) => {
      const preferences = get(loadableAtom);
      return preferences.state === "hasData" ? preferences.data[key] : defaultPreferences[key];
    },
    (_get, set, update: SetStateAction<PersistentPreferences[T] | undefined>) => {
      return set(manualPreferencesAtom, (preferences) => ({
        ...preferences,
        [key]: typeof update === "function" ? update(preferences[key]) : update,
      }));
    },
  );
}
