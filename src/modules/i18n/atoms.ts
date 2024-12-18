import { atom } from "../../deps.ts";
import en from "./languages/en.json" with { type: "json" };
import ko from "./languages/ko.json" with { type: "json" };

const translations = { en, ko } as Record<string, typeof en>;

const i18nStringsAtom = atom(getLanguage());
export const i18nAtom = atom((get) => get(i18nStringsAtom), (_get, set) => {
  set(i18nStringsAtom, getLanguage());
});
i18nAtom.onMount = (set) => {
  addEventListener("languagechange", set);
  return () => {
    removeEventListener("languagechange", set);
  };
};

function getLanguage() {
  for (const language of navigator.languages) {
    const locale = language.split("-")[0];
    if (!locale) {
      continue;
    }

    const translation = translations[locale];
    if (translation) {
      return translation;
    }
  }
  return en;
}
