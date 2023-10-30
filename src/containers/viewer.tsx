import { settableFullscreenElementAtom } from "../atoms/fullscreen_atom.ts";
import { i18nAtom } from "../atoms/i18n_atom.ts";
import {
  navigateAtom,
  scrollElementAtom,
  synchronizeScrollAtom,
} from "../atoms/navigation_atoms.ts";
import { backgroundColorAtom, pageDirectionAtom } from "../atoms/persistent_atoms.ts";
import {
  blockSelectionAtom,
  setViewerOptionsAtom,
  viewerElementAtom,
  viewerModeAtom,
  viewerStateAtom,
} from "../atoms/viewer_atoms.ts";
import { FullscreenIcon } from "../components/icons.tsx";
import { Container, ScrollableLayout } from "../components/scrollable_layout.ts";
import {
  forwardRef,
  HTMLProps,
  Ref,
  ToastContainer,
  useAtom,
  useAtomValue,
  useEffect,
  useImperativeHandle,
  useSetAtom,
} from "../deps.ts";
import { useDefault } from "../hooks/use_default.ts";
import { useViewerController, ViewerController } from "../hooks/use_viewer_controller.ts";
import { ViewerOptions } from "../types.ts";
import { LeftBottomControl } from "./left_bottom_control.tsx";
import { Page } from "./page.tsx";

export const InnerViewer = forwardRef((
  props: HTMLProps<HTMLDivElement> & {
    useDefault?: boolean;
    options: ViewerOptions;
  },
  refHandle: Ref<ViewerController>,
) => {
  const { useDefault: enableDefault, options: viewerOptions, ...otherProps } = props;
  const [viewerElement, setViewerElement] = useAtom(viewerElementAtom);
  const setScrollElement = useSetAtom(scrollElementAtom);
  const fullscreenElement = useAtomValue(settableFullscreenElementAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);
  const viewer = useAtomValue(viewerStateAtom);
  const setViewerOptions = useSetAtom(setViewerOptionsAtom);
  const navigate = useSetAtom(navigateAtom);
  const blockSelection = useSetAtom(blockSelectionAtom);
  const synchronizeScroll = useSetAtom(synchronizeScrollAtom);
  const pageDirection = useAtomValue(pageDirectionAtom);
  const strings = useAtomValue(i18nAtom);
  const mode = useAtomValue(viewerModeAtom);
  const { status } = viewer;

  const controller = useViewerController();
  const { options, toggleFullscreen } = controller;

  useDefault({ enable: props.useDefault, controller });

  useImperativeHandle(refHandle, () => controller, [controller]);

  useEffect(() => {
    setViewerOptions(viewerOptions);
  }, [viewerOptions]);

  return (
    <Container
      ref={setViewerElement}
      tabIndex={-1}
      css={{ backgroundColor }}
      immersive={mode === "window"}
    >
      <ScrollableLayout
        // deno-lint-ignore no-explicit-any
        ref={setScrollElement as any}
        dark={isDarkColor(backgroundColor)}
        fullscreen={fullscreenElement === viewerElement}
        ltr={pageDirection === "leftToRight"}
        onScroll={synchronizeScroll}
        onClick={navigate}
        onMouseDown={blockSelection}
        children={status === "complete"
          ? viewer.pages.map((atom) => (
            <Page
              key={`${atom}`}
              atom={atom}
              {...options?.imageProps}
            />
          ))
          : <p>{status === "error" ? strings.errorIsOccurred : strings.loading}</p>}
        {...otherProps}
      />
      <FullscreenIcon onClick={toggleFullscreen} />
      {status === "complete" ? <LeftBottomControl /> : false}
      <ToastContainer />
    </Container>
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
