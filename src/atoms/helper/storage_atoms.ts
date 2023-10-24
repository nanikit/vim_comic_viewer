import { atomWithStorage, createJSONStorage } from "../../deps.ts";

const gmStorage = {
  getItem: <T>(key: string, initialValue: T) => {
    return GM_getValue(key, initialValue);
  },
  setItem: <T>(key: string, value: T) => GM_setValue(key, value),
  removeItem: (key: string) => GM_deleteValue(key),
};

export function gmValueAtom<T>(key: string, defaultValue: T) {
  return atomWithStorage<T>(key, defaultValue, gmStorage);
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
