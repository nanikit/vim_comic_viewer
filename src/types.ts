import type { JSZip } from 'jszip';

export type ViewerOptions = {
  source?: ComicSource;
  imageProps?: Record<string, string>;
};
export type ViewerController = {
  setOptions: (options: ViewerOptions) => void;
  goNext: () => void;
  goPrevious: () => void;
  toggleFullscreen: () => void;
  download: () => Promise<JSZip | undefined>;
  refPromise: Promise<HTMLDivElement>;
  unmount: () => void;
};
export type ViewerSource = {
  name: string;
  isApplicable: () => boolean;
  comicSource: ComicSource;
  getRoot?: () => HTMLElement;
  withController?: (controller: ViewerController, ref: HTMLDivElement) => void;
};
export type ComicSource = () => ImageSource[] | Promise<ImageSource[]>;
export type ImageSource = string | string[];
