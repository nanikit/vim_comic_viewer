export type PersistentPreferences = {
  backgroundColor: string;
  singlePageCount: number;
  maxZoomOutExponent: number;
  maxZoomInExponent: number;
  pageDirection: "leftToRight" | "rightToLeft";
  isFullscreenPreferred: boolean;
  fullscreenNoticeCount: number;
};

export const defaultPreferences: PersistentPreferences = {
  backgroundColor: "#eeeeee",
  singlePageCount: 1,
  maxZoomOutExponent: 3,
  maxZoomInExponent: 3,
  pageDirection: "rightToLeft",
  isFullscreenPreferred: false,
  fullscreenNoticeCount: 0,
};

export function getEffectivePreferences(
  scriptPreferences: Partial<PersistentPreferences>,
  manualPreferences: Partial<PersistentPreferences>,
) {
  return { ...defaultPreferences, ...scriptPreferences, ...manualPreferences };
}
