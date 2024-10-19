import { DownloadCancel } from "../components/download_cancel.tsx";
import { atom } from "../deps.ts";
import type { ComicSource } from "../helpers/comic_source.ts";
import { download, DownloadProgress } from "../helpers/downloader.ts";
import { i18nAtom } from "../modules/i18n/atoms.ts";
import { type Id, toast } from "../modules/toast.ts";
import { save, timeout } from "../utils.ts";
import { viewerStateAtom } from "./viewer_base_atoms.ts";

const aborterAtom = atom<AbortController | null>(null);
export const cancelDownloadAtom = atom(null, (get) => {
  get(aborterAtom)?.abort();
});

export type UserDownloadOptions = { source?: ComicSource };

export const startDownloadAtom = atom(null, async (get, set, options?: UserDownloadOptions) => {
  const aborter = new AbortController();
  set(aborterAtom, (previous) => {
    previous?.abort();
    return aborter;
  });

  const viewerState = get(viewerStateAtom);
  const source = options?.source ?? viewerState.options.source;
  if (!source) {
    return;
  }

  let toastId: Id | null = null;
  addEventListener("beforeunload", confirmDownloadAbort);
  try {
    toastId = toast(<DownloadCancel onClick={aborter.abort} />, { autoClose: false, progress: 0 });
    return await download(source, {
      onProgress: reportProgress,
      onError: logIfNotAborted,
      signal: aborter.signal,
    });
  } finally {
    removeEventListener("beforeunload", confirmDownloadAbort);
  }

  async function reportProgress(event: DownloadProgress) {
    if (!toastId) {
      return;
    }

    const { total, started, settled, rejected, status } = event;
    const value = (started / total) * 0.1 + (settled / total) * 0.89;
    switch (status) {
      case "ongoing":
        toast.update(toastId, { type: rejected > 0 ? "warning" : "default", progress: value });
        break;
      case "complete":
        toast.update(toastId, {
          type: "success",
          render: get(i18nAtom).downloadComplete,
          progress: 0.9999,
        });
        await timeout(1000);
        toast.done(toastId);
        break;
      case "error":
        toast.update(toastId, {
          type: "error",
          render: get(i18nAtom).errorOccurredWhileDownloading,
          progress: 0,
        });
        break;
      case "cancelled":
        toast.done(toastId);
        break;
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
