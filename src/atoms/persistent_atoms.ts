import { atomWithGmValue, atomWithSession } from "./helper/atoms_with_storage.ts";

type PageDirection = "leftToRight" | "rightToLeft";

export const backgroundColorAtom = atomWithGmValue("vim_comic_viewer.background_color", "#eeeeee");
export const compactWidthIndexAtom = atomWithGmValue("vim_comic_viewer.single_page_count", 1);
// maxZoomOutRatio = Math.sqrt(2) ** maxZoomOutExponent
export const maxZoomOutExponentAtom = atomWithGmValue("vim_comic_viewer.max_zoom_out_exponent", 3);
export const maxZoomInExponentAtom = atomWithGmValue("vim_comic_viewer.max_zoom_in_exponent", 3);
export const pageDirectionAtom = atomWithGmValue<PageDirection>(
  "vim_comic_viewer.page_direction",
  "rightToLeft",
);
export const isFullscreenPreferredAtom = atomWithGmValue("vim_comic_viewer.use_full_screen", true);
export const fullscreenNoticeCountAtom = atomWithGmValue(
  "vim_comic_viewer.full_screen_notice_count",
  0,
);

export const wasImmersiveAtom = atomWithSession("vim_comic_viewer.was_immersive", false);
