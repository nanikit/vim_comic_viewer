import { atom, selectAtom } from "../deps.ts";
import { ImageSource, ViewerOptions } from "../types.ts";
import { PageAtom } from "./create_page_atom.ts";

const viewerElementStateAtom = atom<
  { div: HTMLDivElement; resizeObserver: ResizeObserver } | null
>(null);
export const viewerSizeAtom = atom<{ width: number; height: number } | null>(null);
export const viewerElementAtom = atom(
  (get) => get(viewerElementStateAtom)?.div ?? null,
  (_get, set, div: HTMLDivElement | null) => {
    set(viewerElementStateAtom, (previous) => {
      previous?.resizeObserver.disconnect();

      if (!div) {
        return null;
      }

      const observer = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        set(viewerSizeAtom, { width, height });
      });
      observer.observe(div);
      return { div, resizeObserver: observer };
    });
  },
);

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
