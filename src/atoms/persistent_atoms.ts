import { gmValueAtom, sessionAtom } from "./helper/storage_atoms.ts";

type PageDirection = "leftToRight" | "rightToLeft";

export const backgroundColorAtom = gmValueAtom("vim_comic_viewer.background_color", "#eeeeee");
export const compactWidthIndexAtom = gmValueAtom("vim_comic_viewer.single_page_count", 1);
// maxZoomOutRatio = Math.sqrt(2) ** maxZoomOutExponent
export const maxZoomOutExponentAtom = gmValueAtom("vim_comic_viewer.max_zoom_out_exponent", 3);
export const maxZoomInExponentAtom = gmValueAtom("vim_comic_viewer.max_zoom_in_exponent", 3);
export const pageDirectionAtom = gmValueAtom<PageDirection>(
  "vim_comic_viewer.page_direction",
  "rightToLeft",
);

export const modeAtom = sessionAtom<"normal" | "fullscreen">("vim_comic_viewer.mode", "normal");
