// ==UserScript==
// @name           vim comic viewer
// @name:ko        vim comic viewer
// @description    Universal comic reader
// @description:ko 만화 뷰어 라이브러리
// @version        15.0.0
// @namespace      https://greasyfork.org/en/users/713014-nanikit
// @exclude        *
// @match          http://unused-field.space/
// @author         nanikit
// @license        MIT
// @grant          GM_addValueChangeListener
// @grant          GM_getValue
// @grant          GM_removeValueChangeListener
// @grant          GM_setValue
// @grant          GM_xmlhttpRequest
// @grant          unsafeWindow
// @resource       link:@headlessui/react   https://cdn.jsdelivr.net/npm/@headlessui/react@2.1.8/dist/headlessui.prod.cjs
// @resource       link:@stitches/react     https://cdn.jsdelivr.net/npm/@stitches/react@1.3.1-1/dist/index.cjs
// @resource       link:clsx                https://cdn.jsdelivr.net/npm/clsx@2.1.1/dist/clsx.js
// @resource       link:fflate              https://cdn.jsdelivr.net/npm/fflate@0.8.2/lib/browser.cjs
// @resource       link:jotai               https://cdn.jsdelivr.net/npm/jotai@2.10.0/index.js
// @resource       link:jotai/react         https://cdn.jsdelivr.net/npm/jotai@2.10.0/react.js
// @resource       link:jotai/react/utils   https://cdn.jsdelivr.net/npm/jotai@2.10.0/react/utils.js
// @resource       link:jotai/utils         https://cdn.jsdelivr.net/npm/jotai@2.10.0/utils.js
// @resource       link:jotai/vanilla       https://cdn.jsdelivr.net/npm/jotai@2.10.0/vanilla.js
// @resource       link:jotai/vanilla/utils https://cdn.jsdelivr.net/npm/jotai@2.10.0/vanilla/utils.js
// @resource       link:react               https://cdn.jsdelivr.net/npm/react@18.3.1/cjs/react.production.min.js
// @resource       link:react-dom           https://cdn.jsdelivr.net/npm/react-dom@18.3.1/cjs/react-dom.production.min.js
// @resource       link:react-toastify      https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/react-toastify.js
// @resource       link:scheduler           https://cdn.jsdelivr.net/npm/scheduler@0.23.2/cjs/scheduler.production.min.js
// @resource       link:vcv-inject-node-env data:,unsafeWindow.process=%7Benv:%7BNODE_ENV:%22production%22%7D%7D
// @resource       react-toastify-css       https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/ReactToastify.css
// ==/UserScript==
import { ViewerController } from "./atoms/controller_atom.ts";
import { rootAtom } from "./atoms/viewer_atoms.ts";
import { InnerViewer } from "./containers/viewer.tsx";
import { createRoot, createStore, deferred, forwardRef, Provider, useMemo } from "./deps.ts";
import { ViewerOptions } from "./types.ts";
export { download } from "./services/downloader.ts";
export * as types from "./types.ts";
export * as utils from "./utils.ts";

export function initialize(options: ViewerOptions): Promise<ViewerController> {
  const store = createStore();
  const root = createRoot(getDefaultRoot());
  const deferredController = deferred<ViewerController>();
  root.render(
    <Provider store={store}>
      <InnerViewer onInitialized={deferredController.resolve} options={options} />
    </Provider>,
  );
  store.set(rootAtom, root);
  return deferredController;
}

export const Viewer = forwardRef(({ options, onInitialized }: {
  options: ViewerOptions;
  onInitialized?: (controller: ViewerController) => void;
}) => {
  const store = useMemo(createStore, []);
  return (
    <Provider store={store}>
      <InnerViewer options={options} onInitialized={onInitialized} />
    </Provider>
  );
});

function getDefaultRoot() {
  const div = document.createElement("div");
  // if not fixed, scroll go to end when press tab.
  div.setAttribute("style", "width: 0; height: 0; z-index: 9999999; position: fixed;");
  document.body.append(div);
  return div;
}
