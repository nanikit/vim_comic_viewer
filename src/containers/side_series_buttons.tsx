import { viewerOptionsAtom } from "../atoms/viewer_base_atoms.ts";
import { LeftArrow, RightArrow } from "../components/icons.tsx";
import { useAtomValue } from "../deps.ts";
import { scrollElementAtom } from "../features/navigation/atoms.ts";
import { useHorizontalSwipe } from "../hooks/use_horizontal_swipe.ts";
import { styled } from "../modules/stitches.ts";

const sideButtonCss = {
  position: "absolute",
  top: 0,
  bottom: "60px",

  width: "10%",
  height: "100%",
  border: "none",
  backgroundColor: "transparent",

  "& > *": {
    transition: "transform 0.2s ease-in-out",
  },

  variants: {
    touchDevice: {
      true: {
        transition: "unset",
        pointerEvents: "none",
      },
    },
  },
};

const LeftSideHiddenButton = styled("button", {
  ...sideButtonCss,

  left: 0,

  "&:not(:hover) > *": {
    transform: "translateX(-60%)",
  },
  "&:hover > *, &:focus > *, &:focus-visible > *": {
    transform: "translateX(-20%)",
  },
});

const RightSideHiddenButton = styled("button", {
  ...sideButtonCss,

  right: 0,

  "&:not(:hover) > *": {
    transform: "translateX(+60%)",
  },
  "&:hover > *, &:focus > *, &:focus-visible > *": {
    transform: "translateX(+20%)",
  },
});

const FlexCenter = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  width: "100%",
  height: "100%",
});

export function SideSeriesButtons() {
  const { onNextSeries, onPreviousSeries } = useAtomValue(viewerOptionsAtom);
  const scrollElement = useAtomValue(scrollElementAtom);
  const swipeRatio = useHorizontalSwipe({
    element: scrollElement,
    onPrevious: onPreviousSeries,
    onNext: onNextSeries,
  });
  const isTouchDevice = navigator.maxTouchPoints > 0;

  function forwardWheelEvent(event: React.WheelEvent) {
    scrollElement?.scrollBy({ top: event.deltaY });
  }

  return (
    <>
      {onPreviousSeries && (
        <LeftSideHiddenButton
          onClick={onPreviousSeries}
          onWheel={forwardWheelEvent}
          touchDevice={isTouchDevice}
        >
          <FlexCenter
            style={swipeRatio <= 0 ? {} : { transform: `translateX(${swipeRatio * 40 - 60}%)` }}
          >
            <LeftArrow height="3vmin" width="3vmin" />
          </FlexCenter>
        </LeftSideHiddenButton>
      )}
      {onNextSeries && (
        <RightSideHiddenButton
          onClick={onNextSeries}
          onWheel={forwardWheelEvent}
          touchDevice={isTouchDevice}
        >
          <FlexCenter
            style={swipeRatio >= 0 ? {} : { transform: `translateX(${swipeRatio * 40 + 60}%)` }}
          >
            <RightArrow height="3vmin" width="3vmin" />
          </FlexCenter>
        </RightSideHiddenButton>
      )}
    </>
  );
}
