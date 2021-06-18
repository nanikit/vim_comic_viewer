/** @jsx createElement */
import { CircularProgress } from "../components/circular_progress.tsx";
import { DownloadIcon, FullscreenIcon } from "../components/icons.tsx";
import {
  Container,
  ScrollableLayout,
} from "../components/scrollable_layout.ts";
import { useFullscreenElement } from "../hooks/use_fullscreen_element.ts";
import { useViewerController } from "../hooks/use_viewer_controller.ts";
import type { DownloadProgress } from "../services/downloader.ts";
import { ViewerController } from "../types.ts";
import {
  createElement,
  forwardRef,
  HTMLProps,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Page } from "./page.tsx";

const Viewer_ = (
  props: HTMLProps<HTMLDivElement>,
  refHandle: Ref<ViewerController>,
) => {
  const ref = useRef<HTMLDivElement>();
  const scrollRef = useRef<HTMLDivElement>();
  const fullscreenElement = useFullscreenElement();
  const controller = useViewerController({ ref, scrollRef });
  const {
    options,
    images,
    navigator,
    status,
    downloadAndSave,
    cancelDownload,
    toggleFullscreen,
  } = controller;

  const [{ value, text, error }, setProgress] = useState({
    value: 0,
    text: "",
    error: false,
  });
  const cache = { text: "" };
  const reportProgress = useCallback((event: DownloadProgress) => {
    const { total, started, settled, rejected, isCancelled, zipPercent } =
      event;
    const value = (started / total) * 0.1 + (settled / total) * 0.7 +
      zipPercent * 0.002;
    const text = `${(value * 100).toFixed(1)}%`;
    const error = !!rejected;
    if ((value === 1 && !error) || isCancelled) {
      setProgress({ value: 0, text: "", error: false });
    } else if (text !== cache.text) {
      cache.text = text;
      setProgress({ value, text, error });
    }
  }, []);

  const downloadWithProgress = () => {
    downloadAndSave({ onProgress: reportProgress, onError: console.log });
  };

  const navigate = useCallback((event: MouseEvent) => {
    const height = ref.current?.clientHeight;
    if (!height || event.button !== 0) {
      return;
    }
    event.preventDefault();

    const isTop = event.clientY < height / 2;
    if (isTop) {
      controller.goPrevious();
    } else {
      controller.goNext();
    }
  }, [controller]);

  const blockSelection = useCallback((event: MouseEvent) => {
    if (event.detail >= 2) {
      event.preventDefault();
    }

    if (event.buttons === 3) {
      controller.toggleFullscreen();
      event.preventDefault();
    }
  }, [controller]);

  useImperativeHandle(refHandle, () => controller, [controller]);

  useEffect(() => {
    if (ref.current && fullscreenElement === ref.current) {
      ref.current?.focus?.();
    }
  }, [ref.current, fullscreenElement]);

  useEffect(() => {
    if (error || !text) {
      return;
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#Example
    const guard = (event: Event) => {
      event.preventDefault();
      event.returnValue = "" as any;
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [error || !text]);

  return (
    <Container ref={ref} tabIndex={-1} className="vim_comic_viewer">
      <ScrollableLayout
        ref={scrollRef}
        fullscreen={fullscreenElement === ref.current}
        onClick={navigate}
        onMouseDown={blockSelection}
        {...props}
      >
        {status === "complete"
          ? (
            images?.map?.((image, index) => (
              <Page
                key={index}
                source={image}
                observer={navigator.observer}
                {...options?.imageProps}
              />
            )) || false
          )
          : (
            <p>{status === "error" ? "에러가 발생했습니다" : "로딩 중..."}</p>
          )}
      </ScrollableLayout>
      <FullscreenIcon onClick={toggleFullscreen} />
      {text
        ? (
          <CircularProgress
            radius={50}
            strokeWidth={10}
            value={value}
            text={text}
            error={error}
            onClick={cancelDownload}
          />
        )
        : (
          <DownloadIcon onClick={downloadWithProgress} />
        )}
    </Container>
  );
};

export const Viewer = forwardRef(Viewer_);
