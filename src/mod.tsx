// ==UserScript==
// @name           vim comic viewer
// @name:ko        vim comic viewer
// @description    Universal comic reader
// @description:ko 만화 뷰어 라이브러리
// @version        11.0.1
// @namespace      https://greasyfork.org/en/users/713014-nanikit
// @exclude        *
// @match          http://unused-field.space/
// @author         nanikit
// @license        MIT
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_xmlhttpRequest
// @grant          unsafeWindow
// @resource       @stitches/react     https://cdn.jsdelivr.net/npm/@stitches/react@1.3.1-1/dist/index.cjs
// @resource       fflate              https://cdn.jsdelivr.net/npm/fflate@0.8.1/lib/browser.cjs
// @resource       jotai               https://cdn.jsdelivr.net/npm/jotai@2.4.2/index.js
// @resource       jotai/react         https://cdn.jsdelivr.net/npm/jotai@2.4.2/react.js
// @resource       jotai/react/utils   https://cdn.jsdelivr.net/npm/jotai@2.4.2/react/utils.js
// @resource       jotai/utils         https://cdn.jsdelivr.net/npm/jotai@2.4.2/utils.js
// @resource       jotai/vanilla       https://cdn.jsdelivr.net/npm/jotai@2.4.2/vanilla.js
// @resource       jotai/vanilla/utils https://cdn.jsdelivr.net/npm/jotai@2.4.2/vanilla/utils.js
// @resource       react               https://cdn.jsdelivr.net/npm/react@18.2.0/cjs/react.production.min.js
// @resource       react-dom           https://cdn.jsdelivr.net/npm/react-dom@18.2.0/cjs/react-dom.production.min.js
// @resource       scheduler           https://cdn.jsdelivr.net/npm/scheduler@0.23.0/cjs/scheduler.production.min.js
// @resource       vcv-inject-node-env data:,unsafeWindow.process=%7Benv:%7BNODE_ENV:%22production%22%7D%7D
// ==/UserScript==
import { InnerViewer } from "./containers/viewer.tsx";
import { createRef, createStore, forwardRef, Provider, Ref, render, useMemo } from "./deps.ts";
import { ViewerController } from "./hooks/use_viewer_controller.ts";
import { ViewerOptions } from "./types.ts";
export { download } from "./services/downloader.ts";
export * as types from "./types.ts";
export * as utils from "./utils.ts";

export function initialize(options: ViewerOptions): Promise<ViewerController> {
  const store = createStore();
  const ref = createRef<ViewerController>();
  render(
    <Provider store={store}>
      <InnerViewer ref={ref} options={options} useDefault />
    </Provider>,
    getDefaultRoot(),
  );
  return Promise.resolve(ref.current!);
}

export const Viewer = forwardRef(({ options, useDefault }: {
  options: ViewerOptions;
  useDefault?: boolean;
}, ref: Ref<ViewerController>) => {
  const store = useMemo(createStore, []);
  return (
    <Provider store={store}>
      <InnerViewer {...{ options, ref, useDefault }} />
    </Provider>
  );
});

function getDefaultRoot() {
  const div = document.createElement("div");
  div.setAttribute("style", "width: 0; height: 0; position: fixed;");
  document.body.append(div);
  return div;
}
