import { styled } from "../vendors/stitches.ts";

const defaultScrollbar = {
  "scrollbarWidth": "initial",
  "scrollbarColor": "initial",
  "&::-webkit-scrollbar": { all: "initial" },
  "&::-webkit-scrollbar-thumb": {
    all: "initial",
    background: "#00000088",
  },
  "&::-webkit-scrollbar-track": { all: "initial" },
};

export const Container = styled("div", {
  position: "relative",

  height: "100%",
  overflow: "hidden",
  userSelect: "none",

  fontFamily: "Pretendard, NanumGothic, sans-serif",
  fontSize: "16px",
  color: "black",

  variants: {
    immersive: {
      true: {
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    },
  },
});

export const ScrollableLayout = styled("div", {
  position: "relative",

  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexFlow: "row-reverse wrap",

  overflowY: "auto",
  // For overriding Chrome 118.0.5993.118 UA style sheet
  // :focus-visible { outline: -webkit-focus-ring-color auto 1px; }
  outline: "none",
  ...defaultScrollbar,

  variants: {
    fullscreen: {
      true: {
        position: "fixed",
        top: 0,
        bottom: 0,
        overflow: "auto",
      },
    },
    ltr: {
      true: {
        flexFlow: "row wrap",
      },
    },
    dark: {
      true: {
        "&::-webkit-scrollbar-thumb": {
          all: "initial",
          background: "#ffffff88",
        },
      },
    },
  },
});
