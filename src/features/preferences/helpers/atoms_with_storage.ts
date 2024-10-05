import { atomWithStorage, createJSONStorage } from "../../../deps.ts";

const gmStorage = {
  getItem: GM.getValue,
  setItem: GM.setValue,
  removeItem: (key: string) => GM.deleteValue(key),
  subscribe: <T>(key: string, callback: (value: T) => void) => {
    const idPromise = GM.addValueChangeListener(
      key,
      (_key, _oldValue, newValue) => callback(newValue),
    );

    return async () => {
      const id = await idPromise;
      await GM.removeValueChangeListener(id);
    };
  },
};

export function atomWithGmValue<T>(key: string, defaultValue: T) {
  return atomWithStorage<T>(key, defaultValue, gmStorage, { getOnInit: true });
}

const jsonSessionStorage = createJSONStorage(() => sessionStorage);
export function atomWithSession<T>(key: string, defaultValue: T) {
  return atomWithStorage<T>(
    key,
    defaultValue,
    jsonSessionStorage as ReturnType<typeof createJSONStorage<T>>,
    { getOnInit: true },
  );
}
