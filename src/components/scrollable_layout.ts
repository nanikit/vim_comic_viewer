import { styled } from "../vendors/stitches.ts";

const defaultScrollbar = {
  "scrollbarWidth": "initial",
  "scrollbarColor": "initial",
  "&::-webkit-scrollbar": { all: "initial" },
  "&::-webkit-scrollbar-thumb": { all: "initial", background: "gray" },
  "&::-webkit-scrollbar-track": { all: "initial" },
};

export const Container = styled("div", {
  position: "relative",
  height: "100%",
  ...defaultScrollbar,
});

export const ScrollableLayout = styled("div", {
  // chrome user-agent style override
  outline: 0,
  position: "relative",
  backgroundColor: "#eee",
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
        display: "flex",
        position: "fixed",
        top: 0,
        bottom: 0,
        overflow: "auto",
      },
    },
  },
});
