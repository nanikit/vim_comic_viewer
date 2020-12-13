export type ViewerController = {
  goNext: () => void;
  goPrevious: () => void;
  toggleFullscreen: () => void;
  refPromise: Promise<HTMLDivElement>;
  setSource: (source: ComicSource) => void;
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
