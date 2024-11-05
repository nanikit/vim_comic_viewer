import { atom } from "jotai";

const logAtom = atom<unknown[]>([]);

export const loggerAtom = atom(null, (_get, set, message: unknown) => {
  set(logAtom, (prev) => [...prev, message].slice(-100));
  console.log(message);
});
