import { atomWithStorage, createJSONStorage } from "../../deps.ts";

const gmStorage = {
  getItem: GM_getValue,
  setItem: GM_setValue,
  removeItem: (key: string) => GM_deleteValue(key),
};

export function atomWithGmValue<T>(key: string, defaultValue: T) {
  return atomWithStorage<T>(key, GM_getValue(key, defaultValue), gmStorage);
}

const jsonSessionStorage = createJSONStorage(() => sessionStorage);
export function atomWithSession<T>(key: string, defaultValue: T) {
  const atom = atomWithStorage<T>(
    key,
    jsonSessionStorage.getItem(key, defaultValue) as T,
    jsonSessionStorage as unknown as ReturnType<typeof createJSONStorage<T>>,
  );
  return atom;
}
