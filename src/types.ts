import type { JSZip } from 'jszip';

export type ViewerController = {
  setSource: (source: ComicSource) => void;
  goNext: () => void;
  goPrevious: () => void;
  toggleFullscreen: () => void;
  download: () => Promise<JSZip> | undefined;
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
export type ComicSource = () => Promise<ImageSource[]>;
export type ImageSource = string | string[];
