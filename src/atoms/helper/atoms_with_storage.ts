import { atomWithStorage, createJSONStorage } from "../../deps.ts";

const gmStorage = {
  getItem: GM_getValue,
  setItem: GM_setValue,
  removeItem: (key: string) => GM_deleteValue(key),
  subscribe: <T>(key: string, callback: (value: T) => void) => {
    const id = GM_addValueChangeListener(key, (_key, _oldValue, newValue) => callback(newValue));
    return () => GM_removeValueChangeListener(id);
  },
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
