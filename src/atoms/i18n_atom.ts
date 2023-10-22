import { atom } from "../deps.ts";
import en from "./i18n/en.json" assert { type: "json" };
import ko from "./i18n/ko.json" assert { type: "json" };

const translations = { en, ko } as Record<string, typeof en>;

const i18nStateAtom = atom(en);
export const i18nAtom = atom((get) => get(i18nStateAtom), (_get, set) => {
  for (const language of navigator.languages) {
    const locale = language.split("-")[0];
    const translation = translations[locale];
    if (translation) {
      set(i18nStateAtom, translation);
      return;
    }
  }
});
i18nAtom.onMount = (set) => {
  set();
  addEventListener("languagechange", set);
  return () => {
    removeEventListener("languagechange", set);
  };
};
