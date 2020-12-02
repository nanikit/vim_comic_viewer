export type ViewerSource = {
  name: string;
  isApplicable: () => boolean;
  comicSource: ComicSource;
  // goEpisodeRelative: (n: number) => void;
};
export type ComicSource = () => Promise<ImageSource[]>;
export type ImageSource = string | string[];
