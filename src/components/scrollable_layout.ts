import { styled } from "../vendors/stitches.ts";

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

export const OverlayScroller = styled("div", {
  position: "relative",

  width: "100%",
  height: "100%",

  // For overriding Chrome 118.0.5993.118 UA style sheet
  // :focus-visible { outline: -webkit-focus-ring-color auto 1px; }
  outline: "none",

  "& > div[data-overlayscrollbars-viewport]:focus-visible": {
    // For overriding Chrome 118.0.5993.118 UA style sheet
    // :focus-visible { outline: -webkit-focus-ring-color auto 1px; }
    outline: "none",
  },
  "& .os-scrollbar-handle": {
    backdropFilter: "brightness(0.5)",
    background: "none",
    border: "#fff8 1px solid",
  },

  variants: {
    fullscreen: {
      true: {
        position: "fixed",
        top: 0,
        bottom: 0,
        overflow: "auto",
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
