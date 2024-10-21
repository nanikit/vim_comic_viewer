import { atom } from "../deps.ts";
import { type ComicSource } from "../helpers/comic_source.ts";

export type ViewerOptions = {
  source?: ComicSource;
  mediaProps?: Record<string, string>;
  /** do not synchronize scroll position if true. */
  noSyncScroll?: boolean;
  onNextSeries?: () => void;
  onPreviousSeries?: () => void;
};

export const viewerOptionsAtom = atom<ViewerOptions>({});
export const viewerStatusAtom = atom<"idle" | "loading" | "error" | "complete">("idle");
export const viewerStateAtom = atom((get) => ({
  options: get(viewerOptionsAtom),
  status: get(viewerStatusAtom),
}));
