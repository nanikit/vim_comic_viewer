import type { Size } from "../helpers/size.ts";

type MediaSizeSource = {
  naturalWidth?: number;
  naturalHeight?: number;
  videoWidth?: number;
  videoHeight?: number;
};

export function getStableMediaSize(
  { source, rememberedSize }: { source: MediaSizeSource; rememberedSize?: Partial<Size> },
): Partial<Size> {
  const width = getPositive(source.naturalWidth) ?? getPositive(source.videoWidth) ??
    rememberedSize?.width;
  const height = getPositive(source.naturalHeight) ?? getPositive(source.videoHeight) ??
    rememberedSize?.height;

  return { width, height };
}

function getPositive(value?: number) {
  return value && value > 0 ? value : undefined;
}
