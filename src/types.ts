export type ViewerSource = {
  name: string;
  isApplicable: () => boolean;
  comicSource: ComicSource;
  getRoot: () => HTMLElement;
};
export type ComicSource = () => Promise<ImageSource[]>;
export type ImageSource = string | string[];
