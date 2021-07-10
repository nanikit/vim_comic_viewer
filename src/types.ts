export type ViewerOptions = {
  source?: ComicSource;
  imageProps?: Record<string, string>;
};

export type ViewerController = {
  readonly container: HTMLDivElement | undefined;
  setOptions: (options: ViewerOptions) => void;
  goNext: () => void;
  goPrevious: () => void;
  toggleFullscreen: () => void;
  download: () => Promise<Uint8Array>;
  set compactWidthIndex(value: number);
  get compactWidthIndex(): number;
  unmount: () => void;
};

export type ComicSource = () => ImageSource[] | Promise<ImageSource[]>;

export type ImageSource = string | string[] | (() => AsyncIterable<string>);
