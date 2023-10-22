import { atom, selectAtom } from "../deps.ts";
import { ImageSource, ViewerOptions } from "../types.ts";
import { PageAtom } from "./create_page_atom.ts";

export const viewerElementAtom = atom<HTMLDivElement | null>(null);

type ViewerState =
  & { options: ViewerOptions }
  & ({
    status: "loading" | "error";
  } | {
    status: "complete";
    images: ImageSource[];
    pages: PageAtom[];
  });
export const viewerStateAtom = atom<ViewerState>({ options: {}, status: "loading" });
export const pagesAtom = selectAtom(
  viewerStateAtom,
  (state) => (state as { pages?: PageAtom[] }).pages,
);
