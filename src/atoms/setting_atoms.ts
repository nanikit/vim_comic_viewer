import { gmValueAtom } from "./helper/gm_value_atom.ts";

type PageDirection = "leftToRight" | "rightToLeft";

export const backgroundColorAtom = gmValueAtom("vim_comic_viewer.background_color", "#eeeeee");
export const compactWidthIndexAtom = gmValueAtom("vim_comic_viewer.single_page_count", 1);
export const minMagnificationRatioAtom = gmValueAtom(
  "vim_comic_viewer.min_magnification_ratio",
  0.5,
);
export const maxMagnificationRatioAtom = gmValueAtom("vim_comic_viewer.max_magnification_ratio", 3);
export const pageDirectionAtom = gmValueAtom<PageDirection>(
  "vim_comic_viewer.page_direction",
  "rightToLeft",
);
