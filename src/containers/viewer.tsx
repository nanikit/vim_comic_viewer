/** @jsx createElement */
import { FullscreenIcon } from "../components/icons.tsx";
import {
  Container,
  ScrollableLayout,
} from "../components/scrollable_layout.ts";
import { useFullscreenElement } from "../hooks/use_fullscreen_element.ts";
import { useViewerController } from "../hooks/use_viewer_controller.ts";
import { ViewerController, ViewerOptions } from "../types.ts";
import {
  createElement,
  forwardRef,
  HTMLProps,
  MouseEventHandler,
  Ref,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Page } from "./page.tsx";
import { useDefault } from "../hooks/use_default.ts";
import { DownloadIndicator } from "./download_indicator.tsx";

export const Viewer = forwardRef((
  props: HTMLProps<HTMLDivElement> & {
    useDefault?: boolean;
    options: ViewerOptions;
  },
  refHandle: Ref<ViewerController>,
) => {
  const { useDefault: enableDefault, options: viewerOptions, ...otherProps } =
    props;
  const ref = useRef<HTMLDivElement>();
  const scrollRef = useRef<HTMLDivElement>();
  const fullscreenElement = useFullscreenElement();
  const controller = useViewerController({ ref, scrollRef });
  const {
    options,
    pages,
    status,
    downloader,
    toggleFullscreen,
    compactWidthIndex,
  } = controller;

  const navigate: MouseEventHandler<Element> = useCallback((event) => {
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

  const blockSelection: MouseEventHandler<Element> = useCallback(
    (event) => {
      if (event.detail >= 2) {
        event.preventDefault();
      }

      if (event.buttons === 3) {
        controller.toggleFullscreen();
        event.preventDefault();
      }
    },
    [controller],
  );

  useDefault({ enable: props.useDefault, controller });

  useImperativeHandle(refHandle, () => controller, [controller]);

  useEffect(() => {
    controller.setOptions(viewerOptions);
  }, [controller, viewerOptions]);

  useEffect(() => {
    if (ref.current && fullscreenElement === ref.current) {
      ref.current?.focus?.();
    }
  }, [ref.current, fullscreenElement]);

  return (
    <Container
      ref={ref as RefObject<HTMLDivElement>}
      tabIndex={-1}
      className="vim_comic_viewer"
    >
      <ScrollableLayout
        // deno-lint-ignore no-explicit-any
        ref={scrollRef as any}
        fullscreen={fullscreenElement === ref.current}
        onClick={navigate}
        onMouseDown={blockSelection}
        children={status === "complete"
          ? pages.map((controller, index) => (
            <Page
              key={index}
              controller={controller}
              fullWidth={index < compactWidthIndex}
              {...options?.imageProps}
            />
          ))
          : <p>{status === "error" ? "에러가 발생했습니다" : "로딩 중..."}</p>}
        {...otherProps}
      />
      <FullscreenIcon onClick={toggleFullscreen} />
      {downloader ? <DownloadIndicator downloader={downloader} /> : false}
    </Container>
  );
});
