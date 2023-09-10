// ==UserScript==
// @name           vim comic viewer
// @name:ko        vim comic viewer
// @description    Universal comic reader
// @description:ko 만화 뷰어 라이브러리
// @version        9.0.2
// @namespace      https://greasyfork.org/en/users/713014-nanikit
// @exclude        *
// @match          http://unused-field.space/
// @author         nanikit
// @license        MIT
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_xmlhttpRequest
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@1.2.8/dist/index.cjs
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.8.0/lib/browser.cjs
// @resource       jotai            https://cdn.jsdelivr.net/npm/jotai@2.2.0/index.js
// @resource       jotai/react      https://cdn.jsdelivr.net/npm/jotai@2.2.0/react.js
// @resource       jotai/vanilla    https://cdn.jsdelivr.net/npm/jotai@2.2.0/vanilla.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@18.2.0/cjs/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@18.2.0/cjs/react-dom.production.min.js
// @resource       scheduler        https://cdn.jsdelivr.net/npm/scheduler@0.23.0/cjs/scheduler.production.min.js
// ==/UserScript==
import { Viewer } from "./containers/viewer.tsx";
import { createRef, render } from "./deps.ts";
import { ViewerController, ViewerOptions } from "./types.ts";
export { Viewer } from "./containers/viewer.tsx";
export { download } from "./services/downloader.ts";
export { setTampermonkeyApi } from "./services/tampermonkey.ts";
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
  render(<Viewer ref={ref} options={options} />, getDefaultRoot());
  return Promise.resolve(ref.current!);
};
