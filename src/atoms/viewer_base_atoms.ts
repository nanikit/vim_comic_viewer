import { atom } from "../deps.ts";
import { type ComicSource } from "../helpers/comic_source.ts";
import { refreshMediaSourceAtom } from "./create_page_atom.ts";

export type ViewerOptions = {
  source?: ComicSource;
  mediaProps?: Record<string, string>;
  /** do not synchronize scroll position if true. */
  noSyncScroll?: boolean;
  onNextSeries?: () => void;
  onPreviousSeries?: () => void;
};

const viewerOptionsPrimitiveAtom = atom<ViewerOptions>({});
export const viewerOptionsAtom = atom(
  (get) => get(viewerOptionsPrimitiveAtom),
  async (get, set, options: ViewerOptions) => {
    try {
      const { source } = options;
      const previousOptions = get(viewerOptionsPrimitiveAtom);
      const shouldLoadSource = source && source !== previousOptions.source;
      if (!shouldLoadSource) {
        return;
      }

      set(viewerStatusAtom, (previous) => previous === "complete" ? "complete" : "loading");
      set(viewerOptionsPrimitiveAtom, options);

      await set(refreshMediaSourceAtom, { cause: "load" });

      set(viewerStatusAtom, "complete");
    } catch (error) {
      set(viewerStatusAtom, "error");
      throw error;
    }
  },
);

export const viewerStatusAtom = atom<"idle" | "loading" | "error" | "complete">("idle");
