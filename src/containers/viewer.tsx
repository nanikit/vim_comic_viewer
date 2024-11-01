import { controllerCreationAtom, ViewerController } from "../atoms/controller_atom.ts";
import { pageAtomsAtom } from "../atoms/create_page_atom.ts";
import { viewerFullscreenAtom } from "../atoms/fullscreen_atom.ts";
import { setScrollElementAtom } from "../atoms/set_scroll_element_atom.ts";
import {
  blockSelectionAtom,
  fullscreenSynchronizationAtom,
  setViewerElementAtom,
  setViewerOptionsAtom,
  toggleImmersiveAtom,
  viewerModeAtom,
} from "../atoms/viewer_atoms.ts";
import { type ViewerOptions, viewerStatusAtom } from "../atoms/viewer_base_atoms.ts";
import { FullscreenButton } from "../components/icons.tsx";
import { Container, OverlayScroller } from "../components/scrollable_layout.ts";
import { HTMLProps, useAtomValue, useEffect, useRef, useSetAtom } from "../deps.ts";
import { navigateAtom, synchronizeScrollAtom } from "../features/navigation/atoms.ts";
import { backgroundColorAtom, pageDirectionAtom } from "../features/preferences/atoms.ts";
import { styled } from "../modules/stitches.ts";
import { LeftBottomControl } from "./left_bottom_control.tsx";
import { Page } from "./page.tsx";

import { i18nAtom } from "../modules/i18n/atoms.ts";
import { useOverlayScrollbars } from "../modules/overlayscrollbars.ts";
import { ToastContainer } from "../modules/toast.ts";
import { useBeforeRepaint } from "../modules/use_before_repaint.ts";

export function InnerViewer(
  props: HTMLProps<HTMLDivElement> & {
    options: ViewerOptions;
    onInitialized?: (controller: ViewerController) => void;
  },
) {
  const { options: viewerOptions, onInitialized, ...otherProps } = props;
  const isFullscreen = useAtomValue(viewerFullscreenAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);
  const status = useAtomValue(viewerStatusAtom);
  const setViewerOptions = useSetAtom(setViewerOptionsAtom);
  const pageDirection = useAtomValue(pageDirectionAtom);
  const strings = useAtomValue(i18nAtom);
  const mode = useAtomValue(viewerModeAtom);
  const controller = useAtomValue(controllerCreationAtom);
  const virtualContainerRef = useRef<HTMLDivElement | null>(null);
  const virtualContainer = virtualContainerRef.current;
  const setScrollElement = useSetAtom(setScrollElementAtom);

  const options = controller?.options;

  const pageAtoms = useAtomValue(pageAtomsAtom);

  const [initialize] = useOverlayScrollbars({
    defer: true,
    events: { scroll: useSetAtom(synchronizeScrollAtom), initialized: setupScroll },
  });

  useAtomValue(fullscreenSynchronizationAtom);
  useBeforeRepaint();

  async function setupScroll() {
    const selector = "div[data-overlayscrollbars-viewport]";
    await setScrollElement(virtualContainerRef.current?.querySelector(selector)!);
  }

  useEffect(() => {
    if (controller) {
      onInitialized?.(controller);
    }
  }, [controller, onInitialized]);

  useEffect(() => {
    setViewerOptions(viewerOptions);
  }, [viewerOptions]);

  useEffect(() => {
    if (virtualContainer) {
      initialize(virtualContainer);
    }
  }, [initialize, virtualContainer]);

  return (
    <Container
      ref={useSetAtom(setViewerElementAtom)}
      css={{ backgroundColor }}
      immersive={mode === "window"}
    >
      <OverlayScroller
        tabIndex={0}
        // deno-lint-ignore no-explicit-any
        ref={virtualContainerRef as any}
        fullscreen={isFullscreen}
        onClick={useSetAtom(navigateAtom)}
        onMouseDown={useSetAtom(blockSelectionAtom)}
        {...otherProps}
      >
        <Pages ltr={pageDirection === "leftToRight"}>
          {status === "complete"
            ? pageAtoms.map((atom) => (
              <Page
                key={`${atom}`}
                atom={atom}
                {...options?.mediaProps}
              />
            ))
            : <p>{status === "error" ? strings.errorIsOccurred : strings.loading}</p>}
        </Pages>
      </OverlayScroller>
      {status === "complete" ? <LeftBottomControl /> : false}
      <FullscreenButton onClick={useSetAtom(toggleImmersiveAtom)} />
      <ToastContainer />
    </Container>
  );
}

const Pages = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexFlow: "row-reverse wrap",

  overflowY: "auto",

  variants: {
    ltr: {
      true: {
        flexFlow: "row wrap",
      },
    },
  },
});
