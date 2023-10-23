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
  fontSize: "1vmin",
  color: "black",

  // CSS reset https://elad2412.github.io/the-new-css-reset/
  "*:where(:not(html, iframe, canvas, img, svg, video, audio):not(svg *, symbol *))": {
    all: "unset",
    display: "revert",
  },
  "*, *::before, *::after": {
    boxSizing: "border-box",
  },
  "a, button": {
    cursor: "revert",
  },
  "ol, ul, menu": {
    listStyle: "none",
  },
  "img": {
    maxInlineSize: "100%",
    maxBlockSize: "100%",
  },
  "table": {
    borderCollapse: "collapse",
  },
  "input, textarea": {
    userSelect: "auto",
  },
  "textarea": {
    whiteSpace: "revert",
  },
  "meter": {
    appearance: "revert",
  },
  ":where(pre)": {
    all: "revert",
  },
  "::placeholder": {
    color: "unset",
  },
  "::marker": {
    content: "initial",
  },
  ":where([hidden])": {
    display: "none",
  },
});

export const ScrollableLayout = styled("div", {
  // chrome user-agent style override
  outline: 0,
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexFlow: "row-reverse wrap",
  overflowY: "auto",
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
