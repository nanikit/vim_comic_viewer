import { atom } from "../deps.ts";
import { download, DownloadProgress } from "../services/downloader.ts";
import { ImageSource } from "../types.ts";
import { save } from "../utils.ts";
import { viewerStateAtom } from "./viewer_atoms.ts";

const aborterAtom = atom<AbortController | null>(null);
export const cancelDownloadAtom = atom(null, (get) => {
  get(aborterAtom)?.abort();
});

export const downloadProgressAtom = atom({
  value: 0,
  text: "",
  error: false,
});

export type UserDownloadOptions = { images?: ImageSource[] };

export const startDownloadAtom = atom(null, async (get, set, options?: UserDownloadOptions) => {
  const viewerState = get(viewerStateAtom);
  if (viewerState.status !== "complete") {
    return;
  }

  const aborter = new AbortController();
  set(aborterAtom, (previous) => {
    previous?.abort();
    return aborter;
  });

  addEventListener("beforeunload", confirmDownloadAbort);
  try {
    return await download(options?.images ?? viewerState.images, {
      onProgress: reportProgress,
      onError: logIfNotAborted,
      signal: aborter.signal,
    });
  } finally {
    removeEventListener("beforeunload", confirmDownloadAbort);
  }

  function reportProgress(event: DownloadProgress) {
    const { total, started, settled, rejected, isCancelled, isComplete } = event;
    const value = (started / total) * 0.1 + (settled / total) * 0.89;
    const text = `${(value * 100).toFixed(1)}%`;
    const error = !!rejected;
    if (isComplete || isCancelled) {
      set(downloadProgressAtom, { value: 0, text: "", error: false });
    } else {
      set(downloadProgressAtom, (previous) => {
        if (text !== previous.text) {
          return { value, text, error };
        }
        return previous;
      });
    }
  }
});

export const downloadAndSaveAtom = atom(null, async (_get, set, options?: UserDownloadOptions) => {
  const zip = await set(startDownloadAtom, options);
  if (zip) {
    await save(new Blob([zip]));
  }
});

function logIfNotAborted(error: unknown) {
  if (isNotAbort(error)) {
    console.error(error);
  }
}

function isNotAbort(error: unknown) {
  return !/aborted/i.test(`${error}`);
}
// https://stackoverflow.com/a/25763325
function confirmDownloadAbort(event: BeforeUnloadEvent) {
  event.preventDefault();
  event.returnValue = "";
}
