export type ViewerOptions = {
  source?: ComicSource;
  imageProps?: Record<string, string>;
  /** do not synchronize scroll position if true. */
  noSyncScroll?: boolean;
  /** do not bind predefined keyboard shortcut if true. */
  noDefaultBinding?: boolean;
};

export type ComicSource = () => ImageSource[] | Promise<ImageSource[]>;

// Can I really use AsyncIterable for throttling?
export type ImageSource = string | string[] | (() => AsyncIterable<string>);
