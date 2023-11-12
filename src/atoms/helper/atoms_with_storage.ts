import { atomWithStorage, createJSONStorage } from "../../deps.ts";

const gmStorage = {
  getItem: GM_getValue,
  setItem: GM_setValue,
  removeItem: (key: string) => GM_deleteValue(key),
};

export function atomWithGmValue<T>(key: string, defaultValue: T) {
  return atomWithStorage<T>(key, defaultValue, gmStorage, { unstable_getOnInit: true });
}

const jsonSessionStorage = createJSONStorage(() => sessionStorage);
export function atomWithSession<T>(key: string, defaultValue: T) {
  return atomWithStorage<T>(
    key,
    defaultValue,
    jsonSessionStorage as ReturnType<typeof createJSONStorage<T>>,
    { unstable_getOnInit: true },
  );
}
