import { ButtonHTMLAttributes, SVGAttributes } from "../deps.ts";
import { styled } from "../modules/stitches.ts";

const Svg = styled("svg", {
  opacity: "50%",
  filter: "drop-shadow(0 0 1px white) drop-shadow(0 0 1px white)",
  color: "black",
});

const downloadCss = { width: "40px" };
const fullscreenCss = {
  position: "absolute",
  right: "1%",
  bottom: "1%",
};

const IconButton = styled("button", {
  display: "flex",

  padding: 0,
  border: "none",

  background: "transparent",
  cursor: "pointer",

  "& > svg": {
    pointerEvents: "none",
  },
  "&:hover > svg": {
    opacity: "100%",
    transform: "scale(1.1)",
  },
  "&:focus > svg": {
    opacity: "100%",
  },
});

export const DownloadButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <IconButton {...props}>
    <Svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 -34.51 122.88 122.87"
      css={downloadCss}
    >
      <g>
        <path d="M58.29,42.08V3.12C58.29,1.4,59.7,0,61.44,0s3.15,1.4,3.15,3.12v38.96L79.1,29.4c1.3-1.14,3.28-1.02,4.43,0.27 s1.03,3.25-0.27,4.39L63.52,51.3c-1.21,1.06-3.01,1.03-4.18-0.02L39.62,34.06c-1.3-1.14-1.42-3.1-0.27-4.39 c1.15-1.28,3.13-1.4,4.43-0.27L58.29,42.08L58.29,42.08L58.29,42.08z M0.09,47.43c-0.43-1.77,0.66-3.55,2.43-3.98 c1.77-0.43,3.55,0.66,3.98,2.43c1.03,4.26,1.76,7.93,2.43,11.3c3.17,15.99,4.87,24.57,27.15,24.57h52.55 c20.82,0,22.51-9.07,25.32-24.09c0.67-3.6,1.4-7.5,2.44-11.78c0.43-1.77,2.21-2.86,3.98-2.43c1.77,0.43,2.85,2.21,2.43,3.98 c-0.98,4.02-1.7,7.88-2.36,11.45c-3.44,18.38-5.51,29.48-31.8,29.48H36.07C8.37,88.36,6.3,77.92,2.44,58.45 C1.71,54.77,0.98,51.08,0.09,47.43L0.09,47.43z" />
      </g>
    </Svg>
  </IconButton>
);

export const FullscreenButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <IconButton css={fullscreenCss} {...props}>
    <Svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 122.88 122.87"
      width="40px"
    >
      <g>
        <path d="M122.88,77.63v41.12c0,2.28-1.85,4.12-4.12,4.12H77.33v-9.62h35.95c0-12.34,0-23.27,0-35.62H122.88L122.88,77.63z M77.39,9.53V0h41.37c2.28,0,4.12,1.85,4.12,4.12v41.18h-9.63V9.53H77.39L77.39,9.53z M9.63,45.24H0V4.12C0,1.85,1.85,0,4.12,0h41 v9.64H9.63V45.24L9.63,45.24z M45.07,113.27v9.6H4.12c-2.28,0-4.12-1.85-4.12-4.13V77.57h9.63v35.71H45.07L45.07,113.27z" />
      </g>
    </Svg>
  </IconButton>
);

const ErrorIcon = styled("svg", {
  width: "10vmin",
  height: "10vmin",
  fill: "hsl(0, 50%, 20%)",
  margin: "2rem",
});

export const CircledX = (props: SVGAttributes<SVGSVGElement>) => {
  return (
    <ErrorIcon
      x="0px"
      y="0px"
      viewBox="0 0 122.881 122.88"
      enable-background="new 0 0 122.881 122.88"
      {...props}
    >
      <g>
        <path d="M61.44,0c16.966,0,32.326,6.877,43.445,17.996c11.119,11.118,17.996,26.479,17.996,43.444 c0,16.967-6.877,32.326-17.996,43.444C93.766,116.003,78.406,122.88,61.44,122.88c-16.966,0-32.326-6.877-43.444-17.996 C6.877,93.766,0,78.406,0,61.439c0-16.965,6.877-32.326,17.996-43.444C29.114,6.877,44.474,0,61.44,0L61.44,0z M80.16,37.369 c1.301-1.302,3.412-1.302,4.713,0c1.301,1.301,1.301,3.411,0,4.713L65.512,61.444l19.361,19.362c1.301,1.301,1.301,3.411,0,4.713 c-1.301,1.301-3.412,1.301-4.713,0L60.798,66.157L41.436,85.52c-1.301,1.301-3.412,1.301-4.713,0c-1.301-1.302-1.301-3.412,0-4.713 l19.363-19.362L36.723,42.082c-1.301-1.302-1.301-3.412,0-4.713c1.301-1.302,3.412-1.302,4.713,0l19.363,19.362L80.16,37.369 L80.16,37.369z M100.172,22.708C90.26,12.796,76.566,6.666,61.44,6.666c-15.126,0-28.819,6.13-38.731,16.042 C12.797,32.62,6.666,46.314,6.666,61.439c0,15.126,6.131,28.82,16.042,38.732c9.912,9.911,23.605,16.042,38.731,16.042 c15.126,0,28.82-6.131,38.732-16.042c9.912-9.912,16.043-23.606,16.043-38.732C116.215,46.314,110.084,32.62,100.172,22.708 L100.172,22.708z" />
      </g>
    </ErrorIcon>
  );
};

export const SettingsButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <IconButton {...props}>
      <Svg
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 24 24"
        height="40px"
        width="40px"
      >
        <path d="M15 12 A3 3 0 0 1 12 15 A3 3 0 0 1 9 12 A3 3 0 0 1 15 12 z" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </Svg>
    </IconButton>
  );
};

export const RightArrow = (props: SVGAttributes<SVGSVGElement>) => {
  return (
    <Svg viewBox="0 0 330 330" {...props}>
      <path d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001
	c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213
	C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606
	C255,161.018,253.42,157.202,250.606,154.389z" />
    </Svg>
  );
};

export const LeftArrow = (props: SVGAttributes<SVGSVGElement>) => {
  return <RightArrow {...props} transform="rotate(180)" />;
};
