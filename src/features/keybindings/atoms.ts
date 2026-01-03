import { atom } from "jotai";
import { atomWithCache, loadable, RESET } from "../../deps.ts";
import { preferencesPresetAtom } from "../preferences/atoms.ts";
import { atomWithGmValue } from "../preferences/helpers/atoms_with_storage.ts";
import {
  defaultKeyBindings,
  elementActions,
  globalActions,
  type KeyAction,
  type KeyBindings,
} from "./models.ts";

const keyBindingsStorageAtomAtom = atom((get) => {
  const preset = get(preferencesPresetAtom);
  return atomWithGmValue<Partial<KeyBindings> | undefined>(
    `vim_comic_viewer.keybindings.${preset}`,
    undefined,
  );
});

const keyBindingsCacheAtom = atomWithCache((get) => get(get(keyBindingsStorageAtomAtom)));

const keyBindingsLoadableAtom = loadable(keyBindingsCacheAtom);

export const keyBindingsAtom = atom(
  (get) => {
    const loaded = get(keyBindingsLoadableAtom);
    const stored = loaded.state === "hasData" ? loaded.data : undefined;
    return { ...defaultKeyBindings, ...stored };
  },
  async (get, set, update: Partial<KeyBindings> | typeof RESET) => {
    const storageAtom = get(keyBindingsStorageAtomAtom);
    if (update === RESET) {
      await set(storageAtom, undefined);
      return;
    }
    const current = await get(storageAtom);
    await set(storageAtom, { ...current, ...update });
  },
);

export const globalKeyToActionAtom = atom((get) => {
  const bindings = get(keyBindingsAtom);
  const map = new Map<string, KeyAction>();
  for (const action of globalActions) {
    for (const key of bindings[action]) {
      map.set(key, action);
    }
  }
  return map;
});

export const elementKeyToActionAtom = atom((get) => {
  const bindings = get(keyBindingsAtom);
  const map = new Map<string, KeyAction>();
  for (const action of elementActions) {
    for (const key of bindings[action]) {
      map.set(key, action);
    }
  }
  return map;
});
