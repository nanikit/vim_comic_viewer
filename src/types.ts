import { ExtractAtomValue } from "jotai";
import { downloadProgressAtom } from "./atoms/downloader_atoms.ts";

export type ViewerOptions = {
  source?: ComicSource;
  imageProps?: Record<string, string>;
};

export type ViewerController = {
  readonly container: HTMLDivElement | null;
  setOptions: (options: ViewerOptions) => void;
  goNext: () => void;
  goPrevious: () => void;
  toggleFullscreen: () => void;
  downloader: {
    readonly progress: ExtractAtomValue<typeof downloadProgressAtom>;
    download: () => Promise<Uint8Array | undefined>;
    downloadAndSave: () => Promise<void>;
    cancel: () => void;
  };
  set compactWidthIndex(value: number);
  get compactWidthIndex(): number;
  unmount: () => void;
};

export type ComicSource = () => ImageSource[] | Promise<ImageSource[]>;

// Can I really use AsyncIterable for throttling?
export type ImageSource = string | string[] | (() => AsyncIterable<string>);
