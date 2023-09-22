import { atom } from "jotai";
import { makeDownloader } from "../hooks/make_downloader.ts";
import { makePageController } from "../hooks/make_page_controller.ts";
import { ViewerOptions } from "../types.ts";
import { gmValueAtom } from "./helper/gm_value_atom.ts";

export const viewerElementAtom = atom<HTMLDivElement | null>(null);
export const scrollElementAtom = atom<HTMLDivElement | null>(null);

export const backgroundColorAtom = gmValueAtom("vim_comic_viewer.background_color", "#eeeeee");
export const compactWidthIndexAtom = gmValueAtom("vim_comic_viewer.single_page_count", 1);

type ViewerState =
  & { options: ViewerOptions }
  & ({
    status: "loading" | "error";
  } | {
    status: "complete";
    pages: ReturnType<typeof makePageController>[];
    downloader: ReturnType<typeof makeDownloader>;
  });
export const viewerStateAtom = atom<ViewerState>({ options: {}, status: "loading" });
