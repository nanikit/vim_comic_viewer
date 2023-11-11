export type ViewerOptions = {
  source?: ComicSource;
  imageProps?: Record<string, string>;
  /**
   * false(default): synchronize scroll position with image out of viewer.
   *
   * true: do not synchronize scroll position.
   */
  noSyncScroll?: boolean;
};

export type ComicSource = () => ImageSource[] | Promise<ImageSource[]>;

// Can I really use AsyncIterable for throttling?
export type ImageSource = string | string[] | (() => AsyncIterable<string>);
