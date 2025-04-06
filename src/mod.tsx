// ==UserScript==
// @name           vim comic viewer
// @name:ko        vim comic viewer
// @description    Universal comic reader
// @description:ko 만화 뷰어 라이브러리
// @version        20.0.0
// @namespace      https://greasyfork.org/en/users/713014-nanikit
// @exclude        *
// @match          http://unused-field.space/
// @author         nanikit
// @license        MIT
// @grant          GM.addValueChangeListener
// @grant          GM.getValue
// @grant          GM.removeValueChangeListener
// @grant          GM.setValue
// @grant          GM.xmlHttpRequest
// @grant          unsafeWindow
// @resource       link:@headlessui/react       https://cdn.jsdelivr.net/npm/@headlessui/react@2.2.1/dist/headlessui.prod.cjs
// @resource       link:@stitches/react         https://cdn.jsdelivr.net/npm/@stitches/react@1.3.1-1/dist/index.cjs
// @resource       link:clsx                    https://cdn.jsdelivr.net/npm/clsx@2.1.1/dist/clsx.js
// @resource       link:fflate                  https://cdn.jsdelivr.net/npm/fflate@0.8.2/lib/browser.cjs
// @resource       link:jotai                   https://cdn.jsdelivr.net/npm/jotai@2.10.0/index.js
// @resource       link:jotai/react             https://cdn.jsdelivr.net/npm/jotai@2.10.0/react.js
// @resource       link:jotai/react/utils       https://cdn.jsdelivr.net/npm/jotai@2.10.0/react/utils.js
// @resource       link:jotai/utils             https://cdn.jsdelivr.net/npm/jotai@2.10.0/utils.js
// @resource       link:jotai/vanilla           https://cdn.jsdelivr.net/npm/jotai@2.10.0/vanilla.js
// @resource       link:jotai/vanilla/utils     https://cdn.jsdelivr.net/npm/jotai@2.10.0/vanilla/utils.js
// @resource       link:jotai-cache             https://cdn.jsdelivr.net/npm/jotai-cache@0.5.0/dist/cjs/atomWithCache.js
// @resource       link:overlayscrollbars       https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.0/overlayscrollbars.cjs
// @resource       link:overlayscrollbars-react https://cdn.jsdelivr.net/npm/overlayscrollbars-react@0.5.6/overlayscrollbars-react.cjs.js
// @resource       link:react                   https://cdn.jsdelivr.net/npm/react@19.0.0/cjs/react.production.js
// @resource       link:react/jsx-runtime       https://cdn.jsdelivr.net/npm/react@19.0.0/cjs/react-jsx-runtime.production.js
// @resource       link:react-dom               https://cdn.jsdelivr.net/npm/react-dom@19.0.0/cjs/react-dom.production.js
// @resource       link:react-dom/client        https://cdn.jsdelivr.net/npm/react-dom@19.0.0/cjs/react-dom-client.production.js
// @resource       link:react-toastify          https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/react-toastify.js
// @resource       link:scheduler               https://cdn.jsdelivr.net/npm/scheduler@0.23.2/cjs/scheduler.production.min.js
// @resource       link:vcv-inject-node-env     data:,unsafeWindow.process=%7Benv:%7BNODE_ENV:%22production%22%7D%7D
// @resource       overlayscrollbars-css        https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.0/styles/overlayscrollbars.min.css
// @resource       react-toastify-css           https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/ReactToastify.css
// ==/UserScript==
import "vcv-inject-node-env";
import { ViewerController } from "./atoms/controller_atom.ts";
import { rootAtom, type ViewerOptions } from "./atoms/viewer_base_atoms.ts";
import { InnerViewer } from "./containers/viewer.tsx";
import { createRoot, createStore, forwardRef, Provider, useMemo } from "./deps.ts";

export type { ViewerController } from "./atoms/controller_atom.ts";
export type { ViewerOptions } from "./atoms/viewer_base_atoms.ts";
export type { ComicSource, ComicSourceParams, MediaSource } from "./helpers/comic_source.ts";
export { download } from "./helpers/downloader.ts";
export * as utils from "./utils.ts";

export function initialize(options: ViewerOptions): Promise<ViewerController> {
  const store = createStore();
  const root = createRoot(getDefaultRoot());
  store.set(rootAtom, root);

  return new Promise<ViewerController>((resolve) =>
    root.render(
      <Provider store={store}>
        <InnerViewer options={options} onInitialized={resolve} />
      </Provider>,
    )
  );
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
