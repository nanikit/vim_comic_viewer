import { atom, SetStateAction } from "jotai";
import { atomWithGmValue, atomWithSession } from "./helpers/atoms_with_storage.ts";
import { getEffectivePreferences, PersistentPreferences } from "./models.ts";

export const scriptPreferencesAtom = atom<Partial<PersistentPreferences>>({});
export const manualPreferencesAtom = atomWithGmValue<Partial<PersistentPreferences>>(
  "vim_comic_viewer.preferences",
  {},
);
export const preferencesAtom = atom((get) => {
  return getEffectivePreferences(get(scriptPreferencesAtom), get(manualPreferencesAtom));
});

export const backgroundColorAtom = atomWithPreferences("backgroundColor");
export const singlePageCountAtom = atomWithPreferences("singlePageCount");
/** maxZoomOutRatio = Math.sqrt(2) ** maxZoomOutExponent */
export const maxZoomOutExponentAtom = atomWithPreferences("maxZoomOutExponent");
export const maxZoomInExponentAtom = atomWithPreferences("maxZoomInExponent");
export const pageDirectionAtom = atomWithPreferences("pageDirection");
export const isFullscreenPreferredAtom = atomWithPreferences("isFullscreenPreferred");
export const fullscreenNoticeCountAtom = atomWithPreferences("fullscreenNoticeCount");

export const wasImmersiveAtom = atomWithSession("vim_comic_viewer.was_immersive", false);

function atomWithPreferences<T extends keyof PersistentPreferences>(key: T) {
  return atom(
    (get) => get(preferencesAtom)[key],
    (get, set, update: SetStateAction<PersistentPreferences[T]>) => {
      const effective = typeof update === "function" ? update(get(preferencesAtom)[key]) : update;
      set(manualPreferencesAtom, (preferences) => ({ ...preferences, [key]: effective }));
    },
  );
}
