/** @jsx createElement */
/// <reference lib="dom" />
import { Viewer } from "./containers/viewer.tsx";
import { ViewerController, ViewerOptions } from "./types.ts";
import { createElement, createRef } from "react";
import { render } from "react-dom";
export { Viewer } from "./containers/viewer.tsx";
export { download } from "./services/downloader.ts";
export { transformToBlobUrl } from "./services/user_utils.ts";
export * as types from "./types.ts";
export * as utils from "./utils.ts";

const getDefaultRoot = () => {
  const div = document.createElement("div");
  div.setAttribute(
    "style",
    "width: 0; height: 0; position: fixed;",
  );
  document.body.append(div);
  return div;
};

export const initialize = (
  options: ViewerOptions,
): Promise<ViewerController> => {
  const ref = createRef<ViewerController>();
  render(<Viewer ref={ref} options={options} useDefault />, getDefaultRoot());
  return Promise.resolve(ref.current!);
};
