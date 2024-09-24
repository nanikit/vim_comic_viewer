import { controllerCreationAtom, ViewerController } from "../atoms/controller_atom.ts";
import { viewerFullscreenAtom } from "../atoms/fullscreen_atom.ts";
import { i18nAtom } from "../atoms/i18n_atom.ts";
import { navigateAtom, synchronizeScrollAtom } from "../atoms/navigation_atoms.ts";
import { setScrollElementAtom } from "../atoms/set_scroll_element_atom.ts";
import {
  blockSelectionAtom,
  fullscreenSynchronizationAtom,
  setViewerElementAtom,
  setViewerOptionsAtom,
  toggleImmersiveAtom,
  viewerModeAtom,
  type ViewerOptions,
  viewerStateAtom,
} from "../atoms/viewer_atoms.ts";
import { FullscreenButton } from "../components/icons.tsx";
import { Container, ScrollableLayout } from "../components/scrollable_layout.ts";
import { HTMLProps, ToastContainer, useAtomValue, useEffect, useSetAtom } from "../deps.ts";
import { backgroundColorAtom, pageDirectionAtom } from "../features/preferences/atoms.ts";
import { useDefault } from "../hooks/use_default.ts";
import { LeftBottomControl } from "./left_bottom_control.tsx";
import { Page } from "./page.tsx";

export function InnerViewer(
  props: HTMLProps<HTMLDivElement> & {
    options: ViewerOptions;
    onInitialized?: (controller: ViewerController) => void;
  },
) {
  const { options: viewerOptions, onInitialized, ...otherProps } = props;
  const isFullscreen = useAtomValue(viewerFullscreenAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);
  const viewer = useAtomValue(viewerStateAtom);
  const setViewerOptions = useSetAtom(setViewerOptionsAtom);
  const pageDirection = useAtomValue(pageDirectionAtom);
  const strings = useAtomValue(i18nAtom);
  const mode = useAtomValue(viewerModeAtom);
  useAtomValue(fullscreenSynchronizationAtom);
  const { status } = viewer;

  const controller = useAtomValue(controllerCreationAtom);
  const options = controller?.options;

  useDefault({ enable: !options?.noDefaultBinding, controller });

  useEffect(() => {
    if (controller) {
      onInitialized?.(controller);
    }
  }, [controller, onInitialized]);

  useEffect(() => {
    setViewerOptions(viewerOptions);
  }, [viewerOptions]);

  return (
    <Container
      ref={useSetAtom(setViewerElementAtom)}
      css={{ backgroundColor }}
      immersive={mode === "window"}
    >
      <ScrollableLayout
        tabIndex={0}
        // deno-lint-ignore no-explicit-any
        ref={useSetAtom(setScrollElementAtom) as any}
        dark={isDarkColor(backgroundColor)}
        fullscreen={isFullscreen}
        ltr={pageDirection === "leftToRight"}
        onScroll={useSetAtom(synchronizeScrollAtom)}
        onClick={useSetAtom(navigateAtom)}
        onMouseDown={useSetAtom(blockSelectionAtom)}
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
