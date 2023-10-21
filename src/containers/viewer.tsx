import { fullScreenElementAtom } from "../atoms/fullscreen_element_atom.ts";
import {
  backgroundColorAtom,
  blockSelectionAtom,
  compactWidthIndexAtom,
  navigateAtom,
  pageDirectionAtom,
  scrollElementAtom,
  setViewerOptionsAtom,
  viewerElementAtom,
  viewerStateAtom,
} from "../atoms/viewer_atoms.ts";
import { FullscreenIcon } from "../components/icons.tsx";
import { Container, ScrollableLayout } from "../components/scrollable_layout.ts";
import {
  forwardRef,
  HTMLProps,
  Ref,
  useAtom,
  useAtomValue,
  useEffect,
  useImperativeHandle,
  useSetAtom,
} from "../deps.ts";
import { useDefault } from "../hooks/use_default.ts";
import { useViewerController, ViewerController } from "../hooks/use_viewer_controller.ts";
import { ViewerOptions } from "../types.ts";
import { Page } from "./page.tsx";
import { SupplementaryActionMenu } from "./supplementary_action_menu.tsx";

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
  const fullscreenElement = useAtomValue(fullScreenElementAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);
  const compactWidthIndex = useAtomValue(compactWidthIndexAtom);
  const viewer = useAtomValue(viewerStateAtom);
  const setViewerOptions = useSetAtom(setViewerOptionsAtom);
  const navigate = useSetAtom(navigateAtom);
  const blockSelection = useSetAtom(blockSelectionAtom);
  const pageDirection = useAtomValue(pageDirectionAtom);
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
      className="vim_comic_viewer"
      css={{ backgroundColor }}
    >
      <ScrollableLayout
        // deno-lint-ignore no-explicit-any
        ref={setScrollElement as any}
        dark={isDarkColor(backgroundColor)}
        fullscreen={fullscreenElement === viewerElement}
        ltr={pageDirection === "leftToRight"}
        onClick={navigate}
        onMouseDown={blockSelection}
        children={status === "complete"
          ? viewer.pages.map((atom, index) => (
            <Page
              key={`${atom}`}
              atom={atom}
              fullWidth={index < compactWidthIndex}
              {...options?.imageProps}
            />
          ))
          : <p>{status === "error" ? "에러가 발생했습니다" : "로딩 중..."}</p>}
        {...otherProps}
      />
      <FullscreenIcon onClick={toggleFullscreen} />
      {status === "complete" ? <SupplementaryActionMenu /> : false}
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
