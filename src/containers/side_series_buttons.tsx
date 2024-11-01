import { viewerOptionsAtom } from "../atoms/viewer_base_atoms.ts";
import { LeftArrow, RightArrow } from "../components/icons.tsx";
import { useAtomValue } from "../deps.ts";
import { styled } from "../modules/stitches.ts";

type Props = {
  /** Swipe gesture progress ratio between -1 ~ 1 */
  seriesGestureRatio?: number;
};

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
};

const LeftSideHiddenButton = styled("button", {
  ...sideButtonCss,

  left: 0,

  "&:hover > *": {
    transform: "translateX(-20%)",
  },
  "&:not(:hover) > *": {
    transform: "translateX(-100%)",
  },
});

const RightSideHiddenButton = styled("button", {
  ...sideButtonCss,

  right: 0,

  "&:hover > *": {
    transform: "translateX(+20%)",
  },
  "&:not(:hover) > *": {
    transform: "translateX(+100%)",
  },
});

const FlexCenter = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  width: "100%",
  height: "100%",
});

export function SideSeriesButtons({}: Props) {
  const { onNextSeries, onPreviousSeries } = useAtomValue(viewerOptionsAtom);

  return (
    <>
      {onPreviousSeries && (
        <LeftSideHiddenButton onClick={onPreviousSeries}>
          <FlexCenter>
            <LeftArrow height="3vmin" width="3vmin" />
          </FlexCenter>
        </LeftSideHiddenButton>
      )}
      {onNextSeries && (
        <RightSideHiddenButton onClick={onNextSeries}>
          <FlexCenter>
            <RightArrow height="3vmin" width="3vmin" />
          </FlexCenter>
        </RightSideHiddenButton>
      )}
    </>
  );
}
