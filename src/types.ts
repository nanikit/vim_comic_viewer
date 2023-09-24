export type ViewerOptions = {
  source?: ComicSource;
  imageProps?: Record<string, string>;
};

export type ComicSource = () => ImageSource[] | Promise<ImageSource[]>;

// Can I really use AsyncIterable for throttling?
export type ImageSource = string | string[] | (() => AsyncIterable<string>);
