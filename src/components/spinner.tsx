import { keyframes, styled } from "../vendors/stitches.ts";

const stretch = keyframes({
  "0%": {
    top: "8px",
    height: "64px",
  },
  "50%": {
    top: "24px",
    height: "32px",
  },
  "100%": {
    top: "24px",
    height: "32px",
  },
});

const SpinnerContainer = styled("div", {
  position: "absolute",
  left: "0",
  top: "0",
  right: "0",
  bottom: "0",
  margin: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  div: {
    display: "inline-block",
    width: "16px",
    margin: "0 4px",
    background: "#fff",
    animation: `${stretch} 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite`,
  },
  "div:nth-child(1)": {
    "animation-delay": "-0.24s",
  },
  "div:nth-child(2)": {
    "animation-delay": "-0.12s",
  },
  "div:nth-child(3)": {
    "animation-delay": "0",
  },
});

export const Spinner = () => (
  <SpinnerContainer>
    <div />
    <div />
    <div />
  </SpinnerContainer>
);

export const Overlay = styled("div", {
  position: "relative",

  maxWidth: "100%",
  height: "100%",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  "@media print": {
    margin: 0,
  },

  variants: {
    placeholder: {
      true: { width: "45%", height: "100%" },
    },
    fullWidth: {
      true: { width: "100%" },
    },
    originalSize: {
      true: {
        minHeight: "100%",
        height: "auto",
      },
    },
  },
});

export const LinkColumn = styled("div", {
  display: "flex",
  flexFlow: "column nowrap",
  alignItems: "center",
  justifyContent: "center",

  cursor: "pointer",
  boxShadow: "1px 1px 3px",
  padding: "1rem 1.5rem",
  transition: "box-shadow 1s easeOutExpo",
  lineBreak: "anywhere",

  "&:hover": {
    boxShadow: "2px 2px 5px",
  },
  "&:active": {
    boxShadow: "0 0 2px",
  },
});

export const Image = styled("img", {
  position: "relative",

  height: "100%",
  maxWidth: "100%",

  objectFit: "contain",

  variants: {
    originalSize: {
      true: { height: "auto" },
    },
  },
});
