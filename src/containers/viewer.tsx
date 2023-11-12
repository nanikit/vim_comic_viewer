import { viewerFullscreenAtom } from "../atoms/fullscreen_atom.ts";
import { i18nAtom } from "../atoms/i18n_atom.ts";
import {
  navigateAtom,
  scrollElementAtom,
  synchronizeScrollAtom,
} from "../atoms/navigation_atoms.ts";
import { backgroundColorAtom, pageDirectionAtom } from "../atoms/persistent_atoms.ts";
import {
  blockSelectionAtom,
  fullscreenSynchronizationAtom,
  setViewerElementAtom,
  setViewerOptionsAtom,
  toggleImmersiveAtom,
  viewerModeAtom,
  viewerStateAtom,
} from "../atoms/viewer_atoms.ts";
import { FullscreenButton } from "../components/icons.tsx";
import { Container, ScrollableLayout } from "../components/scrollable_layout.ts";
import { HTMLProps, ToastContainer, useAtomValue, useEffect, useSetAtom } from "../deps.ts";
import { useDefault } from "../hooks/use_default.ts";
import { useViewerController, ViewerController } from "../hooks/use_viewer_controller.ts";
import { ViewerOptions } from "../types.ts";
import { LeftBottomControl } from "./left_bottom_control.tsx";
import { Page } from "./page.tsx";

export function InnerViewer(
  props: HTMLProps<HTMLDivElement> & {
    useDefault?: boolean;
    options: ViewerOptions;
    onInitialized?: (controller: ViewerController) => void;
  },
) {
  const { useDefault: enableDefault, options: viewerOptions, onInitialized, ...otherProps } = props;
  const setViewerElement = useSetAtom(setViewerElementAtom);
  const setScrollElement = useSetAtom(scrollElementAtom);
  const isFullscreen = useAtomValue(viewerFullscreenAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);
  const viewer = useAtomValue(viewerStateAtom);
  const setViewerOptions = useSetAtom(setViewerOptionsAtom);
  const navigate = useSetAtom(navigateAtom);
  const blockSelection = useSetAtom(blockSelectionAtom);
  const synchronizeScroll = useSetAtom(synchronizeScrollAtom);
  const pageDirection = useAtomValue(pageDirectionAtom);
  const strings = useAtomValue(i18nAtom);
  const mode = useAtomValue(viewerModeAtom);
  useAtomValue(fullscreenSynchronizationAtom);
  const { status } = viewer;

  const controller = useViewerController();
  const { options } = controller;

  useDefault({ enable: props.useDefault, controller });

  useEffect(() => {
    onInitialized?.(controller);
  }, [controller]);

  useEffect(() => {
    setViewerOptions(viewerOptions);
  }, [viewerOptions]);

  return (
    <Container
      ref={setViewerElement}
      css={{ backgroundColor }}
      immersive={mode === "window"}
    >
      <ScrollableLayout
        tabIndex={0}
        // deno-lint-ignore no-explicit-any
        ref={setScrollElement as any}
        dark={isDarkColor(backgroundColor)}
        fullscreen={isFullscreen}
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
      {status === "complete" ? <LeftBottomControl /> : false}
      <FullscreenButton onClick={useSetAtom(toggleImmersiveAtom)} />
      <ToastContainer />
    </Container>
  );
}

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
