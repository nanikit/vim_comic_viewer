import { getCurrentRow, getInPageRatio, hasNoticeableDifference, isVisible } from "./common.ts";

export function toViewerScroll({ scrollable, lastWindowToViewerMiddle }: {
  scrollable: HTMLDivElement | null;
  lastWindowToViewerMiddle: number;
}) {
  if (!scrollable) {
    return;
  }

  const viewerMedia = [
    ...scrollable.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img[src], video[src]"),
  ];

  const urlToViewerPages = new Map<string, HTMLElement>();
  for (const media of viewerMedia) {
    urlToViewerPages.set(media.src, media);
  }

  const urls = [...urlToViewerPages.keys()];
  const media = getUrlMedia(urls);
  const siteMedia = media.filter((medium) => !viewerMedia.includes(medium as HTMLImageElement));
  const visibleMedia = siteMedia.filter(isVisible);

  const viewportHeight = visualViewport?.height ?? innerHeight;
  const currentRow = getCurrentRow({ elements: visibleMedia, viewportHeight });
  if (!currentRow) {
    return;
  }

  const indexed = currentRow.map((sized) => [sized, getUrlIndex(sized.page, urls)] as const);
  const last = lastWindowToViewerMiddle - 0.5;
  const sorted = indexed.sort((a, b) => Math.abs(a[1] - last) - Math.abs(b[1] - last));
  const [page, index] = sorted[0] ?? [];
  if (!page || index === undefined) {
    return;
  }

  const pageRatio = getInPageRatio({ page, viewportHeight });
  const snappedRatio = Math.abs(pageRatio - 0.5) < 0.1 ? 0.5 : pageRatio;
  if (!hasNoticeableDifference(index + snappedRatio, lastWindowToViewerMiddle)) {
    return;
  }

  return index + snappedRatio;
}

function getUrlMedia(urls: string[]) {
  const media = document.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video");
  return [...media].filter((medium) => getUrlIndex(medium, urls) !== -1);
}

function getUrlIndex(medium: HTMLElement, urls: string[]) {
  if (medium instanceof HTMLImageElement) {
    const img = medium;
    const parent = img.parentElement;

    const imgUrlIndex = urls.findIndex((x) => x === img.src);
    const pictureUrlIndex = parent instanceof HTMLPictureElement
      ? getUrlIndexFromSrcset(parent, urls)
      : -1;
    return imgUrlIndex === -1 ? pictureUrlIndex : imgUrlIndex;
  } else if (medium instanceof HTMLVideoElement) {
    const video = medium;
    const videoUrlIndex = urls.findIndex((x) => x === video.src);
    const srcsetUrlIndex = getUrlIndexFromSrcset(video, urls);
    return videoUrlIndex === -1 ? srcsetUrlIndex : videoUrlIndex;
  }

  return -1;
}

function getUrlIndexFromSrcset(media: HTMLPictureElement | HTMLVideoElement, urls: string[]) {
  for (const url of getUrlsFromSources(media)) {
    const index = urls.findIndex((x) => x === url);
    if (index !== -1) {
      return index;
    }
  }

  return -1;
}

function getUrlsFromSources(picture: HTMLPictureElement | HTMLVideoElement) {
  const sources = [...picture.querySelectorAll("source")];
  return sources.flatMap((x) => getSrcFromSrcset(x.srcset));
}

function getSrcFromSrcset(srcset: string) {
  return srcset.split(",").map((x) => x.split(/\s+/)[0]).filter((x) => x !== undefined);
}
