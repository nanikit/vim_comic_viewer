/** @jsx createElement */
/** @jsxFrag Fragment */
import { CircularProgress } from "../components/circular_progress.tsx";
import { DownloadIcon } from "../components/icons.tsx";
import { createElement, Fragment } from "react";
import { makeDownloader } from "../hooks/make_downloader.ts";

export const DownloadIndicator = (
  { downloader }: { downloader: ReturnType<typeof makeDownloader> },
) => {
  const { value, text, error } = downloader.progress ?? {};
  downloader.useInstance();

  return <>
    {text
      ? (
        <CircularProgress
          radius={50}
          strokeWidth={10}
          value={value ?? 0}
          text={text}
          error={error}
          onClick={downloader.cancelDownload}
        />
      )
      : (
        <DownloadIcon onClick={downloader.downloadWithProgress} />
      )}
  </>;
};
