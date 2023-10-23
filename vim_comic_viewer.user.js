// ==UserScript==
// @name           vim comic viewer
// @name:ko        vim comic viewer
// @description    Universal comic reader
// @description:ko 만화 뷰어 라이브러리
// @version        10.0.2
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
"use strict";

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var mod_exports = {};
__export(mod_exports, {
  Viewer: () => Viewer,
  download: () => download,
  initialize: () => initialize,
  types: () => types_exports,
  utils: () => utils_exports
});
module.exports = __toCommonJS(mod_exports);
var React = __toESM(require("react"));
var import_vcv_inject_node_env = require("vcv-inject-node-env");
var deps_exports = {};
__export(deps_exports, {
  Fragment: () => import_react2.Fragment,
  Provider: () => import_jotai.Provider,
  atom: () => import_jotai.atom,
  atomWithStorage: () => import_utils.atomWithStorage,
  createRef: () => import_react2.createRef,
  createStitches: () => import_react.createStitches,
  createStore: () => import_jotai.createStore,
  deferred: () => deferred,
  forwardRef: () => import_react2.forwardRef,
  selectAtom: () => import_utils.selectAtom,
  useAtom: () => import_jotai.useAtom,
  useAtomValue: () => import_jotai.useAtomValue,
  useCallback: () => import_react2.useCallback,
  useEffect: () => import_react2.useEffect,
  useId: () => import_react2.useId,
  useImperativeHandle: () => import_react2.useImperativeHandle,
  useLayoutEffect: () => import_react2.useLayoutEffect,
  useMemo: () => import_react2.useMemo,
  useReducer: () => import_react2.useReducer,
  useRef: () => import_react2.useRef,
  useSetAtom: () => import_jotai.useSetAtom,
  useState: () => import_react2.useState,
  useStore: () => import_jotai.useStore
});
var import_react = require("@stitches/react");
__reExport(deps_exports, require("fflate"));
function deferred() {
  let methods;
  let state = "pending";
  const promise = new Promise((resolve, reject) => {
    methods = {
      async resolve(value) {
        await value;
        state = "fulfilled";
        resolve(value);
      },
      reject(reason) {
        state = "rejected";
        reject(reason);
      }
    };
  });
  Object.defineProperty(promise, "state", { get: () => state });
  return Object.assign(promise, methods);
}
var import_jotai = require("jotai");
var import_utils = require("jotai/utils");
var import_react2 = require("react");
__reExport(deps_exports, require("react-dom"));
var en_default = {
  "@@locale": "en",
  settings: "Settings",
  minMagnificationRatio: "Minimal magnification ratio",
  maxMagnificationRatio: "Maximal magnification ratio",
  backgroundColor: "Background color",
  leftToRight: "Left to right",
  errorIsOccurred: "Error is occurred.",
  failedToLoadImage: "Failed to load image.",
  loading: "Loading..."
};
var ko_default = {
  "@@locale": "ko",
  settings: "설정",
  minMagnificationRatio: "최대 축소율",
  maxMagnificationRatio: "최대 확대율",
  backgroundColor: "배경색",
  leftToRight: "왼쪽부터 보기",
  errorIsOccurred: "에러가 발생했습니다.",
  failedToLoadImage: "이미지를 불러오지 못했습니다.",
  loading: "로딩 중..."
};
var translations = { en: en_default, ko: ko_default };
var i18nStateAtom = (0, import_jotai.atom)(en_default);
var i18nAtom = (0, import_jotai.atom)((get) => get(i18nStateAtom), (_get, set) => {
  for (const language of navigator.languages) {
    const locale = language.split("-")[0];
    const translation = translations[locale];
    if (translation) {
      set(i18nStateAtom, translation);
      return;
    }
  }
});
i18nAtom.onMount = (set) => {
  set();
  addEventListener("languagechange", set);
  return () => {
    removeEventListener("languagechange", set);
  };
};
var beforeRepaintStateAtom = (0, import_jotai.atom)({ repaint: null });
var beforeRepaintAtom = (0, import_jotai.atom)((get) => get(beforeRepaintStateAtom), async (get, set) => {
  const { repaint } = get(beforeRepaintStateAtom);
  if (repaint?.state === "pending") {
    await repaint;
  } else {
    const newRepaint = deferred();
    set(beforeRepaintStateAtom, { repaint: newRepaint });
    await newRepaint;
  }
});
var useBeforeRepaint = () => {
  const { repaint } = (0, import_jotai.useAtomValue)(beforeRepaintAtom);
  (0, import_react2.useLayoutEffect)(() => {
    repaint?.resolve(null);
  }, [repaint]);
};
var scrollElementStateAtom = (0, import_jotai.atom)(null);
var initialPageScrollState = { page: null, ratio: 0.5 };
var shouldIgnoreScrollAtom = (0, import_jotai.atom)(false);
var pageScrollStateAtom = (0, import_jotai.atom)(initialPageScrollState);
var synchronizeScrollAtom = (0, import_jotai.atom)(null, (get, set) => {
  const { page, ratio } = getCurrentPage(get(scrollElementAtom));
  const isViewerExitScroll = !page;
  if (isViewerExitScroll) {
    return;
  }
  if (get(shouldIgnoreScrollAtom)) {
    set(shouldIgnoreScrollAtom, false);
    return;
  }
  set(pageScrollStateAtom, { page, ratio });
});
var restoreScrollAtom = (0, import_jotai.atom)(null, (get, set) => {
  const { page, ratio } = get(pageScrollStateAtom);
  const element = get(scrollElementAtom);
  if (!element || !page) {
    return;
  }
  const { offsetTop, clientHeight } = page;
  const restoredY = offsetTop + clientHeight * ratio - element.clientHeight / 2;
  set(shouldIgnoreScrollAtom, true);
  element.scroll({ top: restoredY });
});
var scrollElementSizeAtom = (0, import_jotai.atom)({ width: 0, height: 0 });
var scrollElementAtom = (0, import_jotai.atom)(
  (get) => get(scrollElementStateAtom)?.div ?? null,
  (_get, set, div) => {
    set(scrollElementStateAtom, (previous) => {
      if (previous?.div === div) {
        return previous;
      }
      previous?.resizeObserver.disconnect();
      if (div === null) {
        return null;
      }
      set(scrollElementSizeAtom, { width: div.clientWidth, height: div.clientHeight });
      const resizeObserver = new ResizeObserver(async () => {
        set(scrollElementSizeAtom, { width: div.clientWidth, height: div.clientHeight });
        await set(beforeRepaintAtom);
        set(restoreScrollAtom);
      });
      resizeObserver.observe(div);
      return { div, resizeObserver };
    });
  }
);
scrollElementAtom.onMount = (set) => () => set(null);
var goNextAtom = (0, import_jotai.atom)(null, (get) => {
  const scrollElement = get(scrollElementAtom);
  const { page } = getCurrentPage(scrollElement);
  if (!page) {
    return;
  }
  const viewerHeight = scrollElement.clientHeight;
  const ignorableHeight = viewerHeight * 0.05;
  const scrollBottom = scrollElement.scrollTop + viewerHeight;
  const remainingHeight = page.offsetTop + page.clientHeight - scrollBottom;
  if (remainingHeight > ignorableHeight) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    scrollElement.scrollBy({ top: remainingHeight / divisor });
  } else {
    scrollToNextPageTopOrEnd(page);
  }
});
var goPreviousAtom = (0, import_jotai.atom)(null, (get) => {
  const scrollElement = get(scrollElementAtom);
  const { page } = getCurrentPage(scrollElement);
  if (!page) {
    return;
  }
  const viewerHeight = scrollElement.clientHeight;
  const ignorableHeight = viewerHeight * 0.05;
  const remainingHeight = scrollElement.scrollTop - page.offsetTop;
  if (remainingHeight > ignorableHeight) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    scrollElement.scrollBy({ top: -(remainingHeight / divisor) });
  } else {
    scrollToPreviousPageBottomOrStart(page);
  }
});
var navigateAtom = (0, import_jotai.atom)(null, (get, set, event) => {
  const height = get(scrollElementAtom)?.clientHeight;
  if (!height || event.button !== 0) {
    return;
  }
  event.preventDefault();
  const isTop = event.clientY < height / 2;
  if (isTop) {
    set(goPreviousAtom);
  } else {
    set(goNextAtom);
  }
});
function scrollToNextPageTopOrEnd(page) {
  const originBound = page.getBoundingClientRect();
  let cursor = page;
  while (cursor.nextElementSibling) {
    const next = cursor.nextElementSibling;
    const nextBound = next.getBoundingClientRect();
    if (originBound.bottom < nextBound.top) {
      next.scrollIntoView({ block: "start" });
      return;
    }
    cursor = next;
  }
  cursor.scrollIntoView({ block: "end" });
}
function scrollToPreviousPageBottomOrStart(page) {
  const originBound = page.getBoundingClientRect();
  let cursor = page;
  while (cursor.previousElementSibling) {
    const previous = cursor.previousElementSibling;
    const previousBound = previous.getBoundingClientRect();
    if (previousBound.bottom < originBound.top) {
      previous.scrollIntoView({ block: "end" });
      return;
    }
    cursor = previous;
  }
  cursor.scrollIntoView({ block: "start" });
}
function getCurrentPage(container) {
  const clientHeight = container?.clientHeight;
  if (!clientHeight) {
    return initialPageScrollState;
  }
  const children = [...container.children];
  if (!children.length) {
    return initialPageScrollState;
  }
  const viewportTop = container.scrollTop;
  const viewportBottom = viewportTop + container.clientHeight;
  const fullyVisiblePages = children.filter(
    (x) => x.offsetTop >= viewportTop && x.offsetTop + x.clientHeight <= viewportBottom
  );
  if (fullyVisiblePages.length) {
    return { page: fullyVisiblePages[Math.floor(fullyVisiblePages.length / 2)], ratio: 0.5 };
  }
  const scrollCenter = (viewportTop + viewportBottom) / 2;
  const centerCrossingPage = children.find(
    (x) => x.offsetTop <= scrollCenter && x.offsetTop + x.clientHeight >= scrollCenter
  );
  const ratio = (scrollCenter - centerCrossingPage.offsetTop) / centerCrossingPage.clientHeight;
  return { page: centerCrossingPage, ratio };
}
var gmStorage = {
  getItem: (key, initialValue) => {
    return GM_getValue(key, initialValue);
  },
  setItem: (key, value) => GM_setValue(key, value),
  removeItem: (key) => GM_deleteValue(key)
};
function gmValueAtom(key, defaultValue) {
  return (0, import_utils.atomWithStorage)(key, defaultValue, gmStorage);
}
var backgroundColorAtom = gmValueAtom("vim_comic_viewer.background_color", "#eeeeee");
var compactWidthIndexAtom = gmValueAtom("vim_comic_viewer.single_page_count", 1);
var minMagnificationRatioAtom = gmValueAtom(
  "vim_comic_viewer.min_magnification_ratio",
  0.5
);
var maxMagnificationRatioAtom = gmValueAtom("vim_comic_viewer.max_magnification_ratio", 3);
var pageDirectionAtom = gmValueAtom(
  "vim_comic_viewer.page_direction",
  "rightToLeft"
);
function imageSourceToIterable(source) {
  if (typeof source === "string") {
    return async function* () {
      yield source;
    }();
  } else if (Array.isArray(source)) {
    return async function* () {
      for (const url of source) {
        yield url;
      }
    }();
  } else {
    return source();
  }
}
function createPageAtom({ index, source }) {
  let imageLoad = deferred();
  const stateAtom = (0, import_jotai.atom)({ state: "loading" });
  const loadAtom = (0, import_jotai.atom)(null, async (_get, set) => {
    const urls = [];
    for await (const url of imageSourceToIterable(source)) {
      urls.push(url);
      imageLoad = deferred();
      set(stateAtom, { src: url, state: "loading" });
      const result = await imageLoad;
      switch (result) {
        case false:
          continue;
        case null:
          return;
        default: {
          const img = result;
          set(stateAtom, { src: url, naturalHeight: img.naturalHeight, state: "complete" });
          return;
        }
      }
    }
    set(stateAtom, { urls, state: "error" });
  });
  loadAtom.onMount = (set) => {
    set();
  };
  const reloadAtom = (0, import_jotai.atom)(null, async (_get, set) => {
    imageLoad.resolve(null);
    await set(loadAtom);
  });
  const magnificationRatioAtom = (0, import_jotai.atom)((get) => {
    const viewerSize = get(scrollElementSizeAtom);
    if (!viewerSize) {
      return 1;
    }
    const state = get(stateAtom);
    if (state.state !== "complete") {
      return 1;
    }
    return viewerSize.height / state.naturalHeight;
  });
  const viewAsOriginalSizeAtom = (0, import_jotai.atom)((get) => {
    const minRatio = get(minMagnificationRatioAtom);
    const maxRatio = get(maxMagnificationRatioAtom);
    const ratio = get(magnificationRatioAtom);
    const isFit = minRatio <= ratio && ratio <= maxRatio;
    return !isFit;
  });
  const aggregateAtom = (0, import_jotai.atom)((get) => {
    get(loadAtom);
    const state = get(stateAtom);
    const compactWidthIndex = get(compactWidthIndexAtom);
    const isOriginalSize = get(viewAsOriginalSizeAtom);
    const ratio = get(magnificationRatioAtom);
    const isOverScreen = isOriginalSize && ratio < 1;
    return {
      state,
      reloadAtom,
      fullWidth: index < compactWidthIndex || isOverScreen,
      isOriginalSize,
      imageProps: {
        ..."src" in state ? { src: state.src } : {},
        onError: () => imageLoad.resolve(false),
        onLoad: (event) => imageLoad.resolve(event.currentTarget)
      }
    };
  });
  return aggregateAtom;
}
var viewerElementAtom = (0, import_jotai.atom)(null);
var viewerStateAtom = (0, import_jotai.atom)({ options: {}, status: "loading" });
var pagesAtom = (0, import_utils.selectAtom)(
  viewerStateAtom,
  (state) => state.pages
);
var setViewerOptionsAtom = (0, import_jotai.atom)(
  null,
  async (get, set, options) => {
    try {
      const { source } = options;
      if (source === get(viewerStateAtom).options.source) {
        return;
      }
      if (!source) {
        set(viewerStateAtom, (state) => ({
          ...state,
          status: "complete",
          images: [],
          pages: []
        }));
        return;
      }
      set(viewerStateAtom, (state) => ({ ...state, status: "loading" }));
      const images = await source();
      if (!Array.isArray(images)) {
        throw new Error(`Invalid comic source type: ${typeof images}`);
      }
      set(viewerStateAtom, (state) => ({
        ...state,
        status: "complete",
        images,
        pages: images.map((source2, index) => createPageAtom({ source: source2, index }))
      }));
    } catch (error) {
      set(viewerStateAtom, (state) => ({ ...state, status: "error" }));
      console.error(error);
      throw error;
    }
  }
);
var reloadErroredAtom = (0, import_jotai.atom)(null, (get, set) => {
  window.stop();
  const pages = get(pagesAtom);
  for (const atom2 of pages ?? []) {
    const page = get(atom2);
    if (page.state.state !== "complete") {
      set(page.reloadAtom);
    }
  }
});
var fullscreenElementStateAtom = (0, import_jotai.atom)(
  document.fullscreenElement ?? null
);
fullscreenElementStateAtom.onMount = (set) => {
  const notify = () => set(document.fullscreenElement ?? null);
  document.addEventListener("fullscreenchange", notify);
  return () => document.removeEventListener("fullscreenchange", notify);
};
var fullScreenElementAtom = (0, import_jotai.atom)(
  (get) => get(fullscreenElementStateAtom),
  async (get, set, element) => {
    const fullscreenElement = get(fullscreenElementStateAtom);
    if (element === fullscreenElement) {
      return;
    }
    if (element) {
      await element.requestFullscreen?.();
      const viewer = get(viewerElementAtom);
      if (viewer === element) {
        viewer.focus();
      }
    } else {
      await document.exitFullscreen?.();
    }
    set(fullscreenElementStateAtom, element);
  }
);
var toggleFullscreenAtom = (0, import_jotai.atom)(null, async (get, set) => {
  const fullscreen = get(fullScreenElementAtom);
  await set(fullScreenElementAtom, fullscreen ? null : get(viewerElementAtom));
});
var blockSelectionAtom = (0, import_jotai.atom)(null, (_get, set, event) => {
  if (event.detail >= 2) {
    event.preventDefault();
  }
  if (event.buttons === 3) {
    set(toggleFullscreenAtom);
    event.preventDefault();
  }
});
var { styled, css, keyframes } = (0, import_react.createStitches)({});
var Svg = styled("svg", {
  opacity: "50%",
  filter: "drop-shadow(0 0 1px white) drop-shadow(0 0 1px white)",
  color: "black",
  cursor: "pointer",
  "&:hover": {
    opacity: "100%",
    transform: "scale(1.1)"
  }
});
var downloadCss = { width: "40px" };
var fullscreenCss = {
  position: "absolute",
  right: "1%",
  bottom: "1%",
  width: "40px"
};
var DownloadIcon = (props) =>  React.createElement(
  Svg,
  {
    version: "1.1",
    xmlns: "http://www.w3.org/2000/svg",
    x: "0px",
    y: "0px",
    viewBox: "0 -34.51 122.88 122.87",
    css: downloadCss,
    ...props
  },
   React.createElement("g", null,  React.createElement("path", { d: "M58.29,42.08V3.12C58.29,1.4,59.7,0,61.44,0s3.15,1.4,3.15,3.12v38.96L79.1,29.4c1.3-1.14,3.28-1.02,4.43,0.27 s1.03,3.25-0.27,4.39L63.52,51.3c-1.21,1.06-3.01,1.03-4.18-0.02L39.62,34.06c-1.3-1.14-1.42-3.1-0.27-4.39 c1.15-1.28,3.13-1.4,4.43-0.27L58.29,42.08L58.29,42.08L58.29,42.08z M0.09,47.43c-0.43-1.77,0.66-3.55,2.43-3.98 c1.77-0.43,3.55,0.66,3.98,2.43c1.03,4.26,1.76,7.93,2.43,11.3c3.17,15.99,4.87,24.57,27.15,24.57h52.55 c20.82,0,22.51-9.07,25.32-24.09c0.67-3.6,1.4-7.5,2.44-11.78c0.43-1.77,2.21-2.86,3.98-2.43c1.77,0.43,2.85,2.21,2.43,3.98 c-0.98,4.02-1.7,7.88-2.36,11.45c-3.44,18.38-5.51,29.48-31.8,29.48H36.07C8.37,88.36,6.3,77.92,2.44,58.45 C1.71,54.77,0.98,51.08,0.09,47.43L0.09,47.43z" }))
);
var FullscreenIcon = (props) =>  React.createElement(
  Svg,
  {
    version: "1.1",
    xmlns: "http://www.w3.org/2000/svg",
    x: "0px",
    y: "0px",
    viewBox: "0 0 122.88 122.87",
    css: fullscreenCss,
    ...props
  },
   React.createElement("g", null,  React.createElement("path", { d: "M122.88,77.63v41.12c0,2.28-1.85,4.12-4.12,4.12H77.33v-9.62h35.95c0-12.34,0-23.27,0-35.62H122.88L122.88,77.63z M77.39,9.53V0h41.37c2.28,0,4.12,1.85,4.12,4.12v41.18h-9.63V9.53H77.39L77.39,9.53z M9.63,45.24H0V4.12C0,1.85,1.85,0,4.12,0h41 v9.64H9.63V45.24L9.63,45.24z M45.07,113.27v9.6H4.12c-2.28,0-4.12-1.85-4.12-4.13V77.57h9.63v35.71H45.07L45.07,113.27z" }))
);
var ErrorIcon = styled("svg", {
  width: "10vmin",
  height: "10vmin",
  fill: "hsl(0, 50%, 20%)",
  margin: "2rem"
});
var CircledX = (props) => {
  return  React.createElement(
    ErrorIcon,
    {
      x: "0px",
      y: "0px",
      viewBox: "0 0 122.881 122.88",
      "enable-background": "new 0 0 122.881 122.88",
      ...props
    },
     React.createElement("g", null,  React.createElement("path", { d: "M61.44,0c16.966,0,32.326,6.877,43.445,17.996c11.119,11.118,17.996,26.479,17.996,43.444 c0,16.967-6.877,32.326-17.996,43.444C93.766,116.003,78.406,122.88,61.44,122.88c-16.966,0-32.326-6.877-43.444-17.996 C6.877,93.766,0,78.406,0,61.439c0-16.965,6.877-32.326,17.996-43.444C29.114,6.877,44.474,0,61.44,0L61.44,0z M80.16,37.369 c1.301-1.302,3.412-1.302,4.713,0c1.301,1.301,1.301,3.411,0,4.713L65.512,61.444l19.361,19.362c1.301,1.301,1.301,3.411,0,4.713 c-1.301,1.301-3.412,1.301-4.713,0L60.798,66.157L41.436,85.52c-1.301,1.301-3.412,1.301-4.713,0c-1.301-1.302-1.301-3.412,0-4.713 l19.363-19.362L36.723,42.082c-1.301-1.302-1.301-3.412,0-4.713c1.301-1.302,3.412-1.302,4.713,0l19.363,19.362L80.16,37.369 L80.16,37.369z M100.172,22.708C90.26,12.796,76.566,6.666,61.44,6.666c-15.126,0-28.819,6.13-38.731,16.042 C12.797,32.62,6.666,46.314,6.666,61.439c0,15.126,6.131,28.82,16.042,38.732c9.912,9.911,23.605,16.042,38.731,16.042 c15.126,0,28.82-6.131,38.732-16.042c9.912-9.912,16.043-23.606,16.043-38.732C116.215,46.314,110.084,32.62,100.172,22.708 L100.172,22.708z" }))
  );
};
var IconSettings = (props) => {
  return  React.createElement(
    Svg,
    {
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      viewBox: "0 0 24 24",
      height: "40px",
      width: "40px",
      ...props
    },
     React.createElement("path", { d: "M15 12 A3 3 0 0 1 12 15 A3 3 0 0 1 9 12 A3 3 0 0 1 15 12 z" }),
     React.createElement("path", { d: "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" })
  );
};
var defaultScrollbar = {
  "scrollbarWidth": "initial",
  "scrollbarColor": "initial",
  "&::-webkit-scrollbar": { all: "initial" },
  "&::-webkit-scrollbar-thumb": {
    all: "initial",
    background: "#00000088"
  },
  "&::-webkit-scrollbar-track": { all: "initial" }
};
var Container = styled("div", {
  position: "relative",
  height: "100%",
  overflow: "hidden",
  userSelect: "none",
  fontFamily: "Pretendard, NanumGothic, sans-serif",
  fontSize: "1vmin",
  color: "black",
  "*:where(:not(html, iframe, canvas, img, svg, video, audio):not(svg *, symbol *))": {
    all: "unset",
    display: "revert"
  },
  "*, *::before, *::after": {
    boxSizing: "border-box"
  },
  "a, button": {
    cursor: "revert"
  },
  "ol, ul, menu": {
    listStyle: "none"
  },
  "img": {
    maxInlineSize: "100%",
    maxBlockSize: "100%"
  },
  "table": {
    borderCollapse: "collapse"
  },
  "input, textarea": {
    userSelect: "auto"
  },
  "textarea": {
    whiteSpace: "revert"
  },
  "meter": {
    appearance: "revert"
  },
  ":where(pre)": {
    all: "revert"
  },
  "::placeholder": {
    color: "unset"
  },
  "::marker": {
    content: "initial"
  },
  ":where([hidden])": {
    display: "none"
  }
});
var ScrollableLayout = styled("div", {
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
        overflow: "auto"
      }
    },
    ltr: {
      true: {
        flexFlow: "row wrap"
      }
    },
    dark: {
      true: {
        "&::-webkit-scrollbar-thumb": {
          all: "initial",
          background: "#ffffff88"
        }
      }
    }
  }
});
var utils_exports = {};
__export(utils_exports, {
  getSafeFileName: () => getSafeFileName,
  insertCss: () => insertCss,
  isTyping: () => isTyping,
  save: () => save,
  saveAs: () => saveAs,
  timeout: () => timeout,
  waitDomContent: () => waitDomContent
});
var timeout = (millisecond) => new Promise((resolve) => setTimeout(resolve, millisecond));
var waitDomContent = (document2) => document2.readyState === "loading" ? new Promise((r) => document2.addEventListener("readystatechange", r, { once: true })) : true;
var insertCss = (css2) => {
  const style = document.createElement("style");
  style.innerHTML = css2;
  document.head.append(style);
};
var isTyping = (event) => event.target?.tagName?.match?.(/INPUT|TEXTAREA/) || event.target?.isContentEditable;
var saveAs = async (blob, name) => {
  const a = document.createElement("a");
  a.download = name;
  a.rel = "noopener";
  a.href = URL.createObjectURL(blob);
  a.click();
  await timeout(4e4);
  URL.revokeObjectURL(a.href);
};
var getSafeFileName = (str) => {
  return str.replace(/[<>:"/\\|?*\x00-\x1f]+/gi, "").trim() || "download";
};
var save = (blob) => {
  return saveAs(blob, `${getSafeFileName(document.title)}.zip`);
};
function useDefault({ enable, controller }) {
  const defaultKeyHandler = async (event) => {
    if (maybeNotHotkey(event)) {
      return;
    }
    switch (event.key) {
      case "j":
      case "ArrowDown":
        controller.goNext();
        break;
      case "k":
      case "ArrowUp":
        controller.goPrevious();
        break;
      case ";":
        await controller.downloader?.downloadAndSave();
        break;
      case "/":
        controller.compactWidthIndex++;
        break;
      case "?":
        controller.compactWidthIndex--;
        break;
      case "'":
        controller.reloadErrored();
        break;
      default:
        return;
    }
    event.stopPropagation();
  };
  const defaultGlobalKeyHandler = (event) => {
    if (maybeNotHotkey(event)) {
      return;
    }
    if (["KeyI", "Numpad0", "Enter"].includes(event.code)) {
      controller.toggleFullscreen();
    }
  };
  (0, import_react2.useEffect)(() => {
    if (!controller || !enable) {
      return;
    }
    controller.container?.addEventListener("keydown", defaultKeyHandler);
    addEventListener("keydown", defaultGlobalKeyHandler);
    return () => {
      controller.container?.removeEventListener("keydown", defaultKeyHandler);
      removeEventListener("keydown", defaultGlobalKeyHandler);
    };
  }, [controller, enable]);
}
function maybeNotHotkey(event) {
  const { ctrlKey, altKey, metaKey } = event;
  return ctrlKey || altKey || metaKey || isTyping(event);
}
async function fetchBlob(url, init) {
  try {
    const response = await fetch(url, init);
    return await response.blob();
  } catch (error) {
    if (init?.signal?.aborted) {
      throw error;
    }
    const isOriginDifferent = new URL(url).origin !== location.origin;
    if (isOriginDifferent) {
      return await gmFetch(url, init).blob();
    } else {
      throw new Error("CORS blocked and cannot use GM_xmlhttpRequest", {
        cause: error
      });
    }
  }
}
function gmFetch(resource, init) {
  const method = init?.body ? "POST" : "GET";
  const xhr = (type) => {
    return new Promise((resolve, reject) => {
      const request = GM_xmlhttpRequest({
        method,
        url: resource,
        headers: init?.headers,
        responseType: type === "text" ? void 0 : type,
        data: init?.body,
        onload: (response) => {
          if (type === "text") {
            resolve(response.responseText);
          } else {
            resolve(response.response);
          }
        },
        onerror: reject,
        onabort: reject
      });
      init?.signal?.addEventListener(
        "abort",
        () => {
          request.abort();
        },
        { once: true }
      );
    });
  };
  return {
    blob: () => xhr("blob"),
    json: () => xhr("json"),
    text: () => xhr("text")
  };
}
var isGmCancelled = (error) => {
  return error instanceof Function;
};
async function* downloadImage({ source, signal }) {
  for await (const url of imageSourceToIterable(source)) {
    if (signal?.aborted) {
      break;
    }
    try {
      const blob = await fetchBlob(url, { signal });
      yield { url, blob };
    } catch (error) {
      if (isGmCancelled(error)) {
        yield { error: new Error("download aborted") };
      } else {
        yield { error };
      }
    }
  }
}
var getExtension = (url) => {
  if (!url) {
    return ".txt";
  }
  const extension = url.match(/\.[^/?#]{3,4}?(?=[?#]|$)/);
  return extension?.[0] || ".jpg";
};
var guessExtension = (array) => {
  const { 0: a, 1: b, 2: c, 3: d } = array;
  if (a === 255 && b === 216 && c === 255) {
    return ".jpg";
  }
  if (a === 137 && b === 80 && c === 78 && d === 71) {
    return ".png";
  }
  if (a === 82 && b === 73 && c === 70 && d === 70) {
    return ".webp";
  }
  if (a === 71 && b === 73 && c === 70 && d === 56) {
    return ".gif";
  }
};
var download = (images, options) => {
  const { onError, onProgress, signal } = options || {};
  let startedCount = 0;
  let resolvedCount = 0;
  let rejectedCount = 0;
  let hasCancelled = false;
  const reportProgress = ({ isCancelled, isComplete } = {}) => {
    if (hasCancelled) {
      return;
    }
    if (isCancelled) {
      hasCancelled = true;
    }
    const total = images.length;
    const settled = resolvedCount + rejectedCount;
    onProgress?.({
      total,
      started: startedCount,
      settled,
      rejected: rejectedCount,
      isCancelled: hasCancelled,
      isComplete
    });
  };
  const downloadWithReport = async (source) => {
    const errors = [];
    startedCount++;
    reportProgress();
    for await (const event of downloadImage({ source, signal })) {
      if ("error" in event) {
        errors.push(event.error);
        onError?.(event.error);
        continue;
      }
      if (event.url) {
        resolvedCount++;
      } else {
        rejectedCount++;
      }
      reportProgress();
      return event;
    }
    return {
      url: "",
      blob: new Blob([errors.map((x) => `${x}`).join("\n\n")])
    };
  };
  const cipher = Math.floor(Math.log10(images.length)) + 1;
  const toPair = async ({ url, blob }, index) => {
    const array = new Uint8Array(await blob.arrayBuffer());
    const pad = `${index}`.padStart(cipher, "0");
    const name = `${pad}${guessExtension(array) ?? getExtension(url)}`;
    return { [name]: array };
  };
  const archiveWithReport = async (sources) => {
    const result = await Promise.all(sources.map(downloadWithReport));
    if (signal?.aborted) {
      reportProgress({ isCancelled: true });
      throw new Error("aborted");
    }
    const pairs = await Promise.all(result.map(toPair));
    const data = Object.assign({}, ...pairs);
    const value = deferred();
    const abort = (0, deps_exports.zip)(data, { level: 0 }, (error, array) => {
      if (error) {
        value.reject(error);
      } else {
        reportProgress({ isComplete: true });
        value.resolve(array);
      }
    });
    signal?.addEventListener("abort", abort, { once: true });
    return value;
  };
  return archiveWithReport(images);
};
var aborterAtom = (0, import_jotai.atom)(null);
var cancelDownloadAtom = (0, import_jotai.atom)(null, (get) => {
  get(aborterAtom)?.abort();
});
var downloadProgressAtom = (0, import_jotai.atom)({
  value: 0,
  text: "",
  error: false
});
var startDownloadAtom = (0, import_jotai.atom)(null, async (get, set, options) => {
  const viewerState = get(viewerStateAtom);
  if (viewerState.status !== "complete") {
    return;
  }
  const aborter = new AbortController();
  set(aborterAtom, (previous) => {
    previous?.abort();
    return aborter;
  });
  addEventListener("beforeunload", confirmDownloadAbort);
  try {
    return await download(options?.images ?? viewerState.images, {
      onProgress: reportProgress,
      onError: logIfNotAborted,
      signal: aborter.signal
    });
  } finally {
    removeEventListener("beforeunload", confirmDownloadAbort);
  }
  function reportProgress(event) {
    const { total, started, settled, rejected, isCancelled, isComplete } = event;
    const value = started / total * 0.1 + settled / total * 0.89;
    const text = `${(value * 100).toFixed(1)}%`;
    const error = !!rejected;
    if (isComplete || isCancelled) {
      set(downloadProgressAtom, { value: 0, text: "", error: false });
    } else {
      set(downloadProgressAtom, (previous) => {
        if (text !== previous.text) {
          return { value, text, error };
        }
        return previous;
      });
    }
  }
});
var downloadAndSaveAtom = (0, import_jotai.atom)(null, async (_get, set, options) => {
  const zip2 = await set(startDownloadAtom, options);
  if (zip2) {
    await save(new Blob([zip2]));
  }
});
function logIfNotAborted(error) {
  if (isNotAbort(error)) {
    console.error(error);
  }
}
function isNotAbort(error) {
  return !/aborted/i.test(`${error}`);
}
function confirmDownloadAbort(event) {
  event.preventDefault();
  event.returnValue = "";
}
function useViewerController() {
  const store = (0, import_jotai.useStore)();
  return (0, import_react2.useMemo)(() => createViewerController(store), [store]);
}
function createViewerController(store) {
  const downloader = {
    get progress() {
      return store.get(downloadProgressAtom);
    },
    download: (options) => store.set(startDownloadAtom, options),
    downloadAndSave: (options) => store.set(downloadAndSaveAtom, options),
    cancel: () => store.set(cancelDownloadAtom)
  };
  return {
    get options() {
      return store.get(viewerStateAtom).options;
    },
    get status() {
      return store.get(viewerStateAtom).status;
    },
    get container() {
      return store.get(viewerElementAtom);
    },
    get compactWidthIndex() {
      return store.get(compactWidthIndexAtom);
    },
    downloader,
    get pages() {
      return store.get(pagesAtom);
    },
    set compactWidthIndex(value) {
      store.set(compactWidthIndexAtom, Math.max(0, value));
    },
    setOptions: (value) => store.set(setViewerOptionsAtom, value),
    goPrevious: () => store.set(goPreviousAtom),
    goNext: () => store.set(goNextAtom),
    toggleFullscreen: () => store.set(toggleFullscreenAtom),
    reloadErrored: () => store.set(reloadErroredAtom),
    unmount: () => (0, deps_exports.unmountComponentAtNode)(store.get(viewerElementAtom))
  };
}
var Svg2 = styled("svg", {
  position: "absolute",
  bottom: "8px",
  left: "8px",
  cursor: "pointer",
  "&:hover": {
    filter: "hue-rotate(-145deg)"
  },
  variants: {
    error: {
      true: {
        filter: "hue-rotate(140deg)"
      }
    }
  }
});
var Circle = styled("circle", {
  transform: "rotate(-90deg)",
  transformOrigin: "50% 50%",
  stroke: "url(#aEObn)",
  fill: "#fff8"
});
var GradientDef =  React.createElement("defs", null,  React.createElement("linearGradient", { id: "aEObn", x1: "100%", y1: "0%", x2: "0%", y2: "100%" },  React.createElement("stop", { offset: "0%", style: { stopColor: "#53baff", stopOpacity: 1 } }),  React.createElement("stop", { offset: "100%", style: { stopColor: "#0067bb", stopOpacity: 1 } })));
var CenterText = styled("text", {
  dominantBaseline: "middle",
  textAnchor: "middle",
  fontSize: "30px",
  fontWeight: "bold",
  fill: "#004b9e"
});
var CircularProgress = (props) => {
  const { radius, strokeWidth, value, text, ...otherProps } = props;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - value * circumference;
  const center = radius + strokeWidth / 2;
  const side = center * 2;
  return  React.createElement(Svg2, { height: side, width: side, ...otherProps }, GradientDef,  React.createElement(
    Circle,
    {
      ...{
        strokeWidth,
        strokeDasharray: `${circumference} ${circumference}`,
        strokeDashoffset,
        r: radius,
        cx: center,
        cy: center
      }
    }
  ),  React.createElement(CenterText, { x: "50%", y: "50%" }, text || ""));
};
var import_jotai2 = require("jotai");
var Backdrop = styled("div", {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0, 0, 0, 0.5)",
  transition: "0.2s",
  variants: {
    isOpen: {
      true: {
        opacity: 1,
        pointerEvents: "auto"
      },
      false: {
        opacity: 0,
        pointerEvents: "none"
      }
    }
  }
});
var CenterDialog = styled("div", {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  display: "flex",
  flexFlow: "column nowrap",
  alignItems: "stretch",
  justifyContent: "center",
  transition: "0.2s",
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.2)"
});
function BackdropDialog({ onClose, ...props }) {
  const [isOpen, setIsOpen] = (0, import_react2.useState)(false);
  const close = async () => {
    setIsOpen(false);
    await timeout(200);
    onClose();
  };
  (0, import_react2.useEffect)(() => {
    setIsOpen(true);
  }, []);
  return  React.createElement(Backdrop, { isOpen, onClick: close },  React.createElement(
    CenterDialog,
    {
      onClick: (event) => {
        event.stopPropagation();
      },
      ...props
    }
  ));
}
var ColorInput = styled("input", {
  height: "1.5em"
});
var ConfigRow = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10%",
  "&& > *": {
    fontSize: "1.3em",
    fontWeight: "medium",
    minWidth: "0",
    margin: 0,
    padding: 0
  },
  "& > input": {
    appearance: "meter",
    border: "gray 1px solid",
    borderRadius: "0.2em",
    textAlign: "center"
  },
  ":first-child": {
    flex: "2 1 0"
  },
  ":nth-child(2)": {
    flex: "1 1 0"
  }
});
var HiddenInput = styled("input", {
  opacity: 0,
  width: 0,
  height: 0
});
var Toggle = styled("span", {
  "--width": "60px",
  "label": {
    position: "relative",
    display: "inline-flex",
    margin: 0,
    width: "var(--width)",
    height: "calc(var(--width) / 2)",
    borderRadius: "calc(var(--width) / 2)",
    cursor: "pointer",
    textIndent: "-9999px",
    background: "grey"
  },
  "label:after": {
    position: "absolute",
    top: "calc(var(--width) * 0.025)",
    left: "calc(var(--width) * 0.025)",
    width: "calc(var(--width) * 0.45)",
    height: "calc(var(--width) * 0.45)",
    borderRadius: "calc(var(--width) * 0.45)",
    content: "",
    background: "#fff",
    transition: "0.3s"
  },
  "input:checked + label": {
    background: "#bada55"
  },
  "input:checked + label:after": {
    left: "calc(var(--width) * 0.975)",
    transform: "translateX(-100%)"
  },
  "label:active:after": {
    width: "calc(var(--width) * 0.65)"
  }
});
var Title = styled("h3", {
  fontSize: "2em",
  fontWeight: "bold",
  lineHeight: 1.5
});
function SettingsDialog({ onClose }) {
  const [minMagnificationRatio, setMinMagnificationRatio] = (0, import_jotai.useAtom)(minMagnificationRatioAtom);
  const [maxMagnificationRatio, setMaxMagnificationRatio] = (0, import_jotai.useAtom)(maxMagnificationRatioAtom);
  const [backgroundColor, setBackgroundColor] = (0, import_jotai.useAtom)(backgroundColorAtom);
  const [pageDirection, setPageDirection] = (0, import_jotai.useAtom)(pageDirectionAtom);
  const minRatioInputId = (0, import_react2.useId)();
  const maxRatioInputId = (0, import_react2.useId)();
  const colorInputId = (0, import_react2.useId)();
  const pageDirectionInputId = (0, import_react2.useId)();
  const strings = (0, import_jotai2.useAtomValue)(i18nAtom);
  return  React.createElement(BackdropDialog, { css: { gap: "1.3em" }, onClose },  React.createElement(Title, null, strings.settings),  React.createElement(ConfigRow, null,  React.createElement("label", { htmlFor: minRatioInputId }, strings.minMagnificationRatio),  React.createElement(
    "input",
    {
      type: "number",
      step: 0.1,
      id: minRatioInputId,
      value: minMagnificationRatio,
      onChange: (event) => {
        setMinMagnificationRatio(event.currentTarget.valueAsNumber);
      }
    }
  )),  React.createElement(ConfigRow, null,  React.createElement("label", { htmlFor: maxRatioInputId }, strings.maxMagnificationRatio),  React.createElement(
    "input",
    {
      type: "number",
      step: 0.1,
      id: maxRatioInputId,
      value: maxMagnificationRatio,
      onChange: (event) => {
        setMaxMagnificationRatio(event.currentTarget.valueAsNumber);
      }
    }
  )),  React.createElement(ConfigRow, null,  React.createElement("label", { htmlFor: colorInputId }, strings.backgroundColor),  React.createElement(
    ColorInput,
    {
      type: "color",
      id: colorInputId,
      value: backgroundColor,
      onChange: (event) => {
        setBackgroundColor(event.currentTarget.value);
      }
    }
  )),  React.createElement(ConfigRow, null,  React.createElement("p", null, strings.leftToRight),  React.createElement(Toggle, null,  React.createElement(
    HiddenInput,
    {
      type: "checkbox",
      id: pageDirectionInputId,
      checked: pageDirection === "leftToRight",
      onChange: (event) => {
        setPageDirection(event.currentTarget.checked ? "leftToRight" : "rightToLeft");
      }
    }
  ),  React.createElement("label", { htmlFor: pageDirectionInputId }, strings.leftToRight))));
}
var LeftBottomFloat = styled("div", {
  position: "absolute",
  bottom: "1%",
  left: "1%",
  display: "flex",
  flexFlow: "column"
});
var MenuActions = styled("div", {
  display: "flex",
  flexFlow: "column nowrap",
  alignItems: "center",
  gap: "16px"
});
function LeftBottomControl() {
  const { value, text, error } = (0, import_jotai.useAtomValue)(downloadProgressAtom);
  const cancelDownload = (0, import_jotai.useSetAtom)(downloadProgressAtom);
  const downloadAndSave = (0, import_jotai.useSetAtom)(downloadAndSaveAtom);
  const [isOpen, setIsOpen] = (0, import_react2.useState)(false);
  return  React.createElement(React.Fragment, null,  React.createElement(LeftBottomFloat, null, !!text &&  React.createElement(
    CircularProgress,
    {
      radius: 50,
      strokeWidth: 10,
      value: value ?? 0,
      text,
      error,
      onClick: cancelDownload
    }
  ),  React.createElement(MenuActions, null,  React.createElement(
    IconSettings,
    {
      onClick: () => {
        setIsOpen((value2) => !value2);
      }
    }
  ),  React.createElement(DownloadIcon, { onClick: () => downloadAndSave() }))), isOpen &&  React.createElement(SettingsDialog, { onClose: () => setIsOpen(false) }));
}
var stretch = keyframes({
  "0%": {
    top: "8px",
    height: "64px"
  },
  "50%": {
    top: "24px",
    height: "32px"
  },
  "100%": {
    top: "24px",
    height: "32px"
  }
});
var SpinnerContainer = styled("div", {
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
    animation: `${stretch} 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite`
  },
  "div:nth-child(1)": {
    "animation-delay": "-0.24s"
  },
  "div:nth-child(2)": {
    "animation-delay": "-0.12s"
  },
  "div:nth-child(3)": {
    "animation-delay": "0"
  }
});
var Spinner = () =>  React.createElement(SpinnerContainer, null,  React.createElement("div", null),  React.createElement("div", null),  React.createElement("div", null));
var Overlay = styled("div", {
  position: "relative",
  margin: "0.5px 0.5px",
  maxWidth: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "@media print": {
    margin: 0
  },
  variants: {
    placeholder: {
      true: { width: "45%", height: "100%" }
    },
    fullWidth: {
      true: { width: "100%" }
    },
    originalSize: {
      true: {
        minHeight: "100%",
        height: "auto"
      }
    }
  }
});
var LinkColumn = styled("div", {
  display: "flex",
  flexFlow: "column nowrap",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "1px 1px 3px",
  padding: "1rem 1.5rem",
  transition: "box-shadow 1s easeOutExpo",
  "&:hover": {
    boxShadow: "2px 2px 5px"
  },
  "&:active": {
    boxShadow: "0 0 2px"
  }
});
var Image = styled("img", {
  position: "relative",
  height: "100%",
  maxWidth: "100%",
  objectFit: "contain",
  variants: {
    originalSize: {
      true: { height: "auto" }
    }
  }
});
var Page = ({ atom: atom2, ...props }) => {
  const { imageProps, fullWidth, reloadAtom, isOriginalSize, state: pageState } = (0, import_jotai.useAtomValue)(
    atom2
  );
  const strings = (0, import_jotai.useAtomValue)(i18nAtom);
  const reload = (0, import_jotai.useSetAtom)(reloadAtom);
  const { state } = pageState;
  const reloadErrored = async (event) => {
    event.stopPropagation();
    await reload();
  };
  return  React.createElement(
    Overlay,
    {
      placeholder: state !== "complete",
      originalSize: isOriginalSize,
      fullWidth
    },
    state === "loading" &&  React.createElement(Spinner, null),
    state === "error" &&  React.createElement(LinkColumn, { onClick: reloadErrored },  React.createElement(CircledX, null),  React.createElement("p", null, strings.failedToLoadImage),  React.createElement("p", null, pageState.urls?.join("\n"))),
     React.createElement(Image, { ...imageProps, originalSize: isOriginalSize, ...props })
  );
};
var InnerViewer = (0, import_react2.forwardRef)((props, refHandle) => {
  const { useDefault: enableDefault, options: viewerOptions, ...otherProps } = props;
  const [viewerElement, setViewerElement] = (0, import_jotai.useAtom)(viewerElementAtom);
  const setScrollElement = (0, import_jotai.useSetAtom)(scrollElementAtom);
  const fullscreenElement = (0, import_jotai.useAtomValue)(fullScreenElementAtom);
  const backgroundColor = (0, import_jotai.useAtomValue)(backgroundColorAtom);
  const viewer = (0, import_jotai.useAtomValue)(viewerStateAtom);
  const setViewerOptions = (0, import_jotai.useSetAtom)(setViewerOptionsAtom);
  const navigate = (0, import_jotai.useSetAtom)(navigateAtom);
  const blockSelection = (0, import_jotai.useSetAtom)(blockSelectionAtom);
  const synchronizeScroll = (0, import_jotai.useSetAtom)(synchronizeScrollAtom);
  const pageDirection = (0, import_jotai.useAtomValue)(pageDirectionAtom);
  const strings = (0, import_jotai.useAtomValue)(i18nAtom);
  const { status } = viewer;
  const controller = useViewerController();
  const { options, toggleFullscreen } = controller;
  useBeforeRepaint();
  useDefault({ enable: props.useDefault, controller });
  (0, import_react2.useImperativeHandle)(refHandle, () => controller, [controller]);
  (0, import_react2.useEffect)(() => {
    setViewerOptions(viewerOptions);
  }, [viewerOptions]);
  return  React.createElement(
    Container,
    {
      ref: setViewerElement,
      tabIndex: -1,
      className: "vim_comic_viewer",
      css: { backgroundColor }
    },
     React.createElement(
      ScrollableLayout,
      {
        ref: setScrollElement,
        dark: isDarkColor(backgroundColor),
        fullscreen: fullscreenElement === viewerElement,
        ltr: pageDirection === "leftToRight",
        onScroll: synchronizeScroll,
        onClick: navigate,
        onMouseDown: blockSelection,
        children: status === "complete" ? viewer.pages.map((atom2) =>  React.createElement(
          Page,
          {
            key: `${atom2}`,
            atom: atom2,
            ...options?.imageProps
          }
        )) :  React.createElement("p", null, status === "error" ? strings.errorIsOccurred : strings.loading),
        ...otherProps
      }
    ),
     React.createElement(FullscreenIcon, { onClick: toggleFullscreen }),
    status === "complete" ?  React.createElement(LeftBottomControl, null) : false
  );
});
function isDarkColor(rgbColor) {
  const match = rgbColor.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/);
  if (!match) {
    return false;
  }
  const [_, r, g, b] = match.map((x) => parseInt(x, 16));
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}
var types_exports = {};
function initialize(options) {
  const store = (0, import_jotai.createStore)();
  const ref = (0, import_react2.createRef)();
  (0, deps_exports.render)(
     React.createElement(import_jotai.Provider, { store },  React.createElement(InnerViewer, { ref, options, useDefault: true })),
    getDefaultRoot()
  );
  return Promise.resolve(ref.current);
}
var Viewer = (0, import_react2.forwardRef)(({ options, useDefault: useDefault2 }, ref) => {
  const store = (0, import_react2.useMemo)(import_jotai.createStore, []);
  return  React.createElement(import_jotai.Provider, { store },  React.createElement(InnerViewer, { ...{ options, ref, useDefault: useDefault2 } }));
});
function getDefaultRoot() {
  const div = document.createElement("div");
  div.setAttribute("style", "width: 0; height: 0; position: fixed;");
  document.body.append(div);
  return div;
}
