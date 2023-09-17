import { atomWithStorage } from "jotai/utils";

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
