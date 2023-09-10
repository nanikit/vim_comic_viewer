import { createStore, Provider } from "jotai";
import { FullscreenIcon } from "../components/icons.tsx";
import {
  Container,
  ScrollableLayout,
} from "../components/scrollable_layout.ts";
import {
  forwardRef,
  HTMLProps,
  MouseEventHandler,
  Ref,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "../deps.ts";
import { useDefault } from "../hooks/use_default.ts";
import { useFullscreenElement } from "../hooks/use_fullscreen_element.ts";
import { useViewerController } from "../hooks/use_viewer_controller.ts";
import { tampermonkeyApi } from "../services/tampermonkey.ts";
import { ViewerController, ViewerOptions } from "../types.ts";
import { Page } from "./page.tsx";
import { SupplementaryActionMenu } from "./supplementary_action_menu.tsx";

const InnerViewer = forwardRef((
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

  const backgroundColorKey = "vim_comic_viewer.background_color";
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return tampermonkeyApi.GM_getValue?.(backgroundColorKey, "#eeeeee") ??
      "#eeeeee";
  });

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
      css={{ backgroundColor }}
    >
      <ScrollableLayout
        // deno-lint-ignore no-explicit-any
        ref={scrollRef as any}
        dark={isDarkColor(backgroundColor)}
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
      {downloader
        ? (
          <SupplementaryActionMenu
            downloader={downloader}
            color={backgroundColor}
            onColorChange={(newColor) => {
              tampermonkeyApi.GM_setValue?.(backgroundColorKey, newColor);
              setBackgroundColor(newColor);
            }}
          />
        )
        : false}
    </Container>
  );
});

export const Viewer = forwardRef(({ options }: {
  options: ViewerOptions;
}, ref: Ref<ViewerController>) => {
  const store = useMemo(createStore, []);
  return (
    <Provider store={store}>
      <InnerViewer options={options} ref={ref} useDefault />
    </Provider>
  );
});

// #878787 -> true, #888888 -> false,
function isDarkColor(rgbColor: string) {
  const match = rgbColor.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/);
  if (!match) {
    return false;
  }

  const [_, r, g, b] = match.map((x) => parseInt(x, 16));
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}
