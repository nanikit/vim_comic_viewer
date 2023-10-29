import { atomWithStorage, createJSONStorage } from "../../deps.ts";

const gmStorage = {
  getItem: GM_getValue,
  setItem: GM_setValue,
  removeItem: (key: string) => GM_deleteValue(key),
};

export function gmValueAtom<T>(key: string, defaultValue: T) {
  return atomWithStorage<T>(key, GM_getValue(key, defaultValue), gmStorage);
}

const jsonSessionStorage = createJSONStorage(() => sessionStorage);
export function sessionAtom<T>(key: string, defaultValue: T) {
  const atom = atomWithStorage<T>(
    key,
    jsonSessionStorage.getItem(key, defaultValue) as T,
    jsonSessionStorage as unknown as ReturnType<typeof createJSONStorage<T>>,
  );
  return atom;
}
