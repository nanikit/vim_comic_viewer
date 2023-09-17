import { atom } from "jotai";
import { gmValueAtom } from "./helper/gm_value_atom.ts";

export const viewerElementAtom = atom<HTMLDivElement | null>(null);
export const scrollElementAtom = atom<HTMLDivElement | null>(null);

export const backgroundColorAtom = gmValueAtom("vim_comic_viewer.background_color", "#eeeeee");
