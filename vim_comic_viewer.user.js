// ==UserScript==
// @name           vim comic viewer
// @name:ko        vim comic viewer
// @description    Universal comic reader
// @description:ko 만화 뷰어 라이브러리
// @version        18.1.1
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
// @resource       link:@headlessui/react       https://cdn.jsdelivr.net/npm/@headlessui/react@2.1.8/dist/headlessui.prod.cjs
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
// @resource       link:react                   https://cdn.jsdelivr.net/npm/react@18.3.1/cjs/react.production.min.js
// @resource       link:react-dom               https://cdn.jsdelivr.net/npm/react-dom@18.3.1/cjs/react-dom.production.min.js
// @resource       link:react-toastify          https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/react-toastify.js
// @resource       link:scheduler               https://cdn.jsdelivr.net/npm/scheduler@0.23.2/cjs/scheduler.production.min.js
// @resource       link:vcv-inject-node-env     data:,unsafeWindow.process=%7Benv:%7BNODE_ENV:%22production%22%7D%7D
// @resource       overlayscrollbars-css        https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.0/styles/overlayscrollbars.min.css
// @resource       react-toastify-css           https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/ReactToastify.css
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
  utils: () => utils_exports
});
module.exports = __toCommonJS(mod_exports);
var import_vcv_inject_node_env = require("vcv-inject-node-env");
var React = __toESM(require("react"));
var deps_exports = {};
__export(deps_exports, {
  Dialog: () => import_react2.Dialog,
  Fragment: () => import_react3.Fragment,
  Provider: () => import_jotai.Provider,
  RESET: () => import_utils.RESET,
  Tab: () => import_react2.Tab,
  atom: () => import_jotai.atom,
  atomWithCache: () => import_jotai_cache.atomWithCache,
  atomWithStorage: () => import_utils.atomWithStorage,
  createContext: () => import_react3.createContext,
  createJSONStorage: () => import_utils.createJSONStorage,
  createRef: () => import_react3.createRef,
  createRoot: () => import_react_dom.createRoot,
  createStitches: () => import_react.createStitches,
  createStore: () => import_jotai.createStore,
  deferred: () => deferred,
  forwardRef: () => import_react3.forwardRef,
  loadable: () => import_utils.loadable,
  selectAtom: () => import_utils.selectAtom,
  splitAtom: () => import_utils.splitAtom,
  useAtom: () => import_jotai.useAtom,
  useAtomValue: () => import_jotai.useAtomValue,
  useCallback: () => import_react3.useCallback,
  useEffect: () => import_react3.useEffect,
  useId: () => import_react3.useId,
  useImperativeHandle: () => import_react3.useImperativeHandle,
  useLayoutEffect: () => import_react3.useLayoutEffect,
  useMemo: () => import_react3.useMemo,
  useReducer: () => import_react3.useReducer,
  useRef: () => import_react3.useRef,
  useSetAtom: () => import_jotai.useSetAtom,
  useState: () => import_react3.useState,
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
var import_jotai_cache = require("jotai-cache");
var import_utils = require("jotai/utils");
var import_react2 = require("@headlessui/react");
var import_react3 = require("react");
var import_react_dom = require("react-dom");
var beforeRepaintAtom = (0, import_jotai.atom)({});
var useBeforeRepaint = () => {
  const { task } = (0, import_jotai.useAtomValue)(beforeRepaintAtom);
  (0, import_react3.useLayoutEffect)(() => {
    task?.();
  }, [task]);
};
function getScrollPage(middle, container) {
  const element = container?.firstElementChild?.children?.item(Math.floor(middle));
  return element instanceof HTMLElement ? element : null;
}
function getCurrentMiddleFromScrollElement({
  scrollElement,
  previousMiddle
}) {
  const children = scrollElement?.firstElementChild?.children;
  if (!children) {
    return null;
  }
  const elements = [...children];
  return getPageScroll({
    elements,
    viewportHeight: scrollElement.getBoundingClientRect().height,
    previousMiddle
  });
}
function getPageScroll({ elements, viewportHeight, previousMiddle }) {
  if (!elements.length) {
    return null;
  }
  const scrollCenter = viewportHeight / 2;
  const pages = elements.map((page) => ({ page, rect: page.getBoundingClientRect() }));
  const currentRow = pages.filter(isCenterCrossing);
  const currentPage = getCurrentPage(currentRow);
  if (!currentPage) {
    return null;
  }
  const middle = getMiddle(currentPage);
  return middle;
  function isCenterCrossing({ rect: { y, height } }) {
    return y <= scrollCenter && y + height >= scrollCenter;
  }
  function getCurrentPage(row) {
    const firstPage = row.find(({ page: page2 }) => page2 === elements[0]);
    if (firstPage) {
      return firstPage;
    }
    const lastPage = row.find(({ page: page2 }) => page2 === elements.at(-1));
    if (lastPage) {
      return lastPage;
    }
    const half = Math.floor(row.length / 2);
    if (row.length % 2 === 1) {
      return row[half];
    }
    const page = row[half]?.page;
    if (!page) {
      return;
    }
    const centerNextTop = elements.indexOf(page);
    const previousMiddlePage = previousMiddle < centerNextTop ? row[half - 1] : row[half];
    return previousMiddlePage;
  }
  function getMiddle(page) {
    const ratio = 1 - (page.rect.y + page.rect.height - scrollCenter) / page.rect.height;
    return elements.indexOf(page.page) + ratio;
  }
}
function needsScrollRestoration(previousSize, currentSize) {
  const { width, height, scrollHeight } = currentSize;
  const { width: previousWidth, height: previousHeight, scrollHeight: previousScrollHeight } = previousSize;
  return previousWidth === 0 || previousHeight === 0 || previousWidth !== width || previousHeight !== height || previousScrollHeight !== scrollHeight;
}
function getPreviousScroll(scrollElement) {
  const page = getCurrentPageFromScrollElement({ scrollElement, previousMiddle: Infinity });
  if (!page || !scrollElement) {
    return;
  }
  const viewerHeight = scrollElement.clientHeight;
  const ignorableHeight = viewerHeight * 0.05;
  const remainingHeight = scrollElement.scrollTop - Math.ceil(page.offsetTop) - 1;
  if (remainingHeight > ignorableHeight) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    return -Math.ceil(remainingHeight / divisor);
  } else {
    return getPreviousPageBottomOrStart(page);
  }
}
function getNextScroll(scrollElement) {
  const page = getCurrentPageFromScrollElement({ scrollElement, previousMiddle: 0 });
  if (!page || !scrollElement) {
    return;
  }
  const viewerHeight = scrollElement.clientHeight;
  const ignorableHeight = viewerHeight * 0.05;
  const scrollBottom = scrollElement.scrollTop + viewerHeight;
  const remainingHeight = page.offsetTop + page.clientHeight - Math.ceil(scrollBottom) - 1;
  if (remainingHeight > ignorableHeight) {
    const divisor = Math.ceil(remainingHeight / viewerHeight);
    return Math.ceil(remainingHeight / divisor);
  } else {
    return getNextPageTopOrEnd(page);
  }
}
function getUrlMedia(urls) {
  const pages = [];
  const imgs = document.querySelectorAll(
    "img[src], video[src]"
  );
  for (const img of imgs) {
    if (urls.includes(img.src)) {
      pages.push(img);
    }
  }
  return pages;
}
function isVisible(element) {
  if ("checkVisibility" in element) {
    return element.checkVisibility();
  }
  const { x, y, width, height } = element.getBoundingClientRect();
  const elements = document.elementsFromPoint(x + width / 2, y + height / 2);
  return elements.includes(element);
}
function hasNoticeableDifference(middle, lastMiddle) {
  return Math.abs(middle - lastMiddle) > 0.01;
}
function viewerScrollToWindow({ middle, lastMiddle, scrollElement }) {
  if (!hasNoticeableDifference(middle, lastMiddle)) {
    return;
  }
  const page = getScrollPage(middle, scrollElement);
  const src = page?.querySelector("img[src], video[src]")?.src;
  if (!src) {
    return;
  }
  const original = findOriginElement(src, page);
  if (!original) {
    return;
  }
  const rect = original.getBoundingClientRect();
  const ratio = middle - Math.floor(middle);
  const top = scrollY + rect.y + rect.height * ratio - innerHeight / 2;
  return top;
}
function findOriginElement(src, page) {
  const fileName = src.split("/").pop()?.split("?")[0];
  const candidates = document.querySelectorAll(
    `img[src*="${fileName}"], video[src*="${fileName}"]`
  );
  const originals = [...candidates].filter(
    (media) => media.src === src && media.parentElement !== page && isVisible(media)
  );
  if (originals.length === 1) {
    return originals[0];
  }
  const links = document.querySelectorAll(`a[href*="${fileName}"`);
  const visibleLinks = [...links].filter(isVisible);
  if (visibleLinks.length === 1) {
    return visibleLinks[0];
  }
}
function getNextPageTopOrEnd(page) {
  const scrollable = page.offsetParent;
  if (!scrollable) {
    return;
  }
  const pageBottom = page.offsetTop + page.clientHeight;
  let cursor = page;
  while (cursor.nextElementSibling) {
    const next = cursor.nextElementSibling;
    if (pageBottom <= next.offsetTop) {
      return next.getBoundingClientRect().top;
    }
    cursor = next;
  }
  const { y, height } = cursor.getBoundingClientRect();
  return y + height;
}
function getPreviousPageBottomOrStart(page) {
  const scrollable = page.offsetParent;
  if (!scrollable) {
    return;
  }
  const pageTop = page.offsetTop;
  let cursor = page;
  while (cursor.previousElementSibling) {
    const previous = cursor.previousElementSibling;
    const previousBottom = previous.offsetTop + previous.clientHeight;
    if (previousBottom <= pageTop) {
      const { bottom } = previous.getBoundingClientRect();
      const { height: height2 } = scrollable.getBoundingClientRect();
      return bottom - height2;
    }
    cursor = previous;
  }
  const { y, height } = cursor.getBoundingClientRect();
  return y - height;
}
function getCurrentPageFromScrollElement({ scrollElement, previousMiddle }) {
  const middle = getCurrentMiddleFromScrollElement({ scrollElement, previousMiddle });
  if (!middle || !scrollElement) {
    return null;
  }
  return getScrollPage(middle, scrollElement);
}
var scrollElementStateAtom = (0, import_jotai.atom)(null);
var scrollElementAtom = (0, import_jotai.atom)((get) => get(scrollElementStateAtom)?.div ?? null);
var scrollElementSizeAtom = (0, import_jotai.atom)({ width: 0, height: 0, scrollHeight: 0 });
var pageScrollMiddleAtom = (0, import_jotai.atom)(0.5);
var lastViewerToWindowMiddleAtom = (0, import_jotai.atom)(-1);
var lastWindowToViewerMiddleAtom = (0, import_jotai.atom)(-1);
var transferWindowScrollToViewerAtom = (0, import_jotai.atom)(null, (get, set) => {
  const scrollable = get(scrollElementAtom);
  const lastWindowToViewerMiddle = get(lastWindowToViewerMiddleAtom);
  if (!scrollable) {
    return;
  }
  const viewerMedia = [
    ...scrollable.querySelectorAll("img[src], video[src]")
  ];
  const urlToViewerPages =  new Map();
  for (const media2 of viewerMedia) {
    urlToViewerPages.set(media2.src, media2);
  }
  const urls = [...urlToViewerPages.keys()];
  const media = getUrlMedia(urls);
  const siteMedia = media.filter((medium) => !viewerMedia.includes(medium));
  const visibleMedia = siteMedia.filter(isVisible);
  const middle = getPageScroll({
    elements: visibleMedia,
    viewportHeight: visualViewport?.height ?? innerHeight,
    previousMiddle: lastWindowToViewerMiddle
  });
  if (!middle || !hasNoticeableDifference(middle, lastWindowToViewerMiddle)) {
    return;
  }
  const pageRatio = middle - Math.floor(middle);
  const snappedRatio = Math.abs(pageRatio - 0.5) < 0.1 ? 0.5 : pageRatio;
  const snappedMiddle = Math.floor(middle) + snappedRatio;
  set(pageScrollMiddleAtom, snappedMiddle);
  set(lastWindowToViewerMiddleAtom, snappedMiddle);
});
var transferViewerScrollToWindowAtom = (0, import_jotai.atom)(null, (get, set) => {
  const middle = get(pageScrollMiddleAtom);
  const scrollElement = get(scrollElementAtom);
  const lastMiddle = get(lastViewerToWindowMiddleAtom);
  const top = viewerScrollToWindow({ middle, lastMiddle, scrollElement });
  if (top !== void 0) {
    set(lastViewerToWindowMiddleAtom, middle);
    scroll({ behavior: "instant", top });
  }
});
var synchronizeScrollAtom = (0, import_jotai.atom)(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);
  if (!scrollElement) {
    return;
  }
  if (set(correctScrollAtom)) {
    return;
  }
  const middle = getCurrentMiddleFromScrollElement({
    scrollElement,
    previousMiddle: get(pageScrollMiddleAtom)
  });
  if (middle) {
    set(pageScrollMiddleAtom, middle);
    set(transferViewerScrollToWindowAtom);
  }
});
var correctScrollAtom = (0, import_jotai.atom)(null, (get, set) => {
  const scrollElement = get(scrollElementAtom);
  if (!scrollElement) {
    return;
  }
  const previousSize = get(scrollElementSizeAtom);
  const rect = scrollElement.getBoundingClientRect();
  const currentSize = {
    width: rect.width,
    height: rect.height,
    scrollHeight: scrollElement.scrollHeight
  };
  if (!needsScrollRestoration(previousSize, currentSize)) {
    return false;
  }
  set(scrollElementSizeAtom, currentSize);
  set(restoreScrollAtom);
  return true;
});
var restoreScrollAtom = (0, import_jotai.atom)(null, (get, set) => {
  const middle = get(pageScrollMiddleAtom);
  const scrollable = get(scrollElementAtom);
  const page = getScrollPage(middle, scrollable);
  if (!page || !scrollable || scrollable.clientHeight < 1) {
    return;
  }
  const { height: scrollableHeight } = scrollable.getBoundingClientRect();
  const { y: pageY, height: pageHeight } = page.getBoundingClientRect();
  const ratio = middle - Math.floor(middle);
  const restoredYDiff = pageY + pageHeight * ratio - scrollableHeight / 2;
  scrollable.scrollBy({ top: restoredYDiff });
  set(beforeRepaintAtom, { task: () => set(correctScrollAtom) });
});
var goNextAtom = (0, import_jotai.atom)(null, (get) => {
  const diffY = getNextScroll(get(scrollElementAtom));
  if (diffY != null) {
    get(scrollElementAtom)?.scrollBy({ top: diffY });
  }
});
var goPreviousAtom = (0, import_jotai.atom)(null, (get) => {
  const diffY = getPreviousScroll(get(scrollElementAtom));
  if (diffY != null) {
    get(scrollElementAtom)?.scrollBy({ top: diffY });
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
var import_jotai2 = require("jotai");
var gmStorage = {
  getItem: GM.getValue,
  setItem: GM.setValue,
  removeItem: (key) => GM.deleteValue(key),
  subscribe: (key, callback) => {
    const idPromise = GM.addValueChangeListener(
      key,
      (_key, _oldValue, newValue) => callback(newValue)
    );
    return async () => {
      const id = await idPromise;
      await GM.removeValueChangeListener(id);
    };
  }
};
function atomWithGmValue(key, defaultValue) {
  return (0, import_utils.atomWithStorage)(key, defaultValue, gmStorage, { getOnInit: true });
}
var jsonSessionStorage = (0, import_utils.createJSONStorage)(() => sessionStorage);
function atomWithSession(key, defaultValue) {
  return (0, import_utils.atomWithStorage)(
    key,
    defaultValue,
    jsonSessionStorage,
    { getOnInit: true }
  );
}
var defaultPreferences = {
  backgroundColor: "#eeeeee",
  singlePageCount: 1,
  maxZoomOutExponent: 3,
  maxZoomInExponent: 3,
  pageDirection: "rightToLeft",
  isFullscreenPreferred: false,
  fullscreenNoticeCount: 0
};
var scriptPreferencesAtom = (0, import_jotai2.atom)({});
var preferencesPresetAtom = (0, import_jotai2.atom)("default");
var [backgroundColorAtom] = atomWithPreferences("backgroundColor");
var [singlePageCountAtom] = atomWithPreferences("singlePageCount");
var [maxZoomOutExponentAtom] = atomWithPreferences("maxZoomOutExponent");
var [maxZoomInExponentAtom] = atomWithPreferences("maxZoomInExponent");
var [pageDirectionAtom] = atomWithPreferences("pageDirection");
var [isFullscreenPreferredAtom, isFullscreenPreferredPromiseAtom] = atomWithPreferences(
  "isFullscreenPreferred"
);
var [fullscreenNoticeCountAtom, fullscreenNoticeCountPromiseAtom] = atomWithPreferences(
  "fullscreenNoticeCount"
);
var wasImmersiveAtom = atomWithSession("vim_comic_viewer.was_immersive", false);
var effectivePreferencesAtom = (0, import_jotai2.atom)(
  (get) => ({
    backgroundColor: get(backgroundColorAtom),
    singlePageCount: get(singlePageCountAtom),
    maxZoomOutExponent: get(maxZoomOutExponentAtom),
    maxZoomInExponent: get(maxZoomInExponentAtom),
    pageDirection: get(pageDirectionAtom),
    isFullscreenPreferred: get(isFullscreenPreferredAtom),
    fullscreenNoticeCount: get(fullscreenNoticeCountAtom)
  }),
  (get, set, update) => {
    if (typeof update === "function") {
      const preferences = get(effectivePreferencesAtom);
      const newPreferences = update(preferences);
      return updatePreferences(newPreferences);
    }
    return updatePreferences(update);
    function updatePreferences(preferences) {
      return Promise.all([
        updateIfDefined(backgroundColorAtom, preferences.backgroundColor),
        updateIfDefined(singlePageCountAtom, preferences.singlePageCount),
        updateIfDefined(maxZoomOutExponentAtom, preferences.maxZoomOutExponent),
        updateIfDefined(maxZoomInExponentAtom, preferences.maxZoomInExponent),
        updateIfDefined(pageDirectionAtom, preferences.pageDirection),
        updateIfDefined(isFullscreenPreferredAtom, preferences.isFullscreenPreferred),
        updateIfDefined(fullscreenNoticeCountAtom, preferences.fullscreenNoticeCount)
      ]);
    }
    function updateIfDefined(atom3, value) {
      return value !== void 0 ? set(atom3, value) : Promise.resolve();
    }
  }
);
function atomWithPreferences(key) {
  const asyncAtomAtom = (0, import_jotai2.atom)((get) => {
    const preset = get(preferencesPresetAtom);
    const qualifiedKey = `vim_comic_viewer.preferences.${preset}.${key}`;
    return atomWithGmValue(qualifiedKey, void 0);
  });
  const cacheAtom = (0, import_jotai_cache.atomWithCache)((get) => get(get(asyncAtomAtom)));
  const manualAtom = (0, import_jotai2.atom)((get) => get(cacheAtom), updater);
  const loadableAtom = (0, import_utils.loadable)(manualAtom);
  const effectiveAtom = (0, import_jotai2.atom)((get) => {
    const value = get(loadableAtom);
    if (value.state === "hasData" && value.data !== void 0) {
      return value.data;
    }
    return get(scriptPreferencesAtom)[key] ?? defaultPreferences[key];
  }, updater);
  return [effectiveAtom, manualAtom];
  function updater(get, set, update) {
    return set(
      get(asyncAtomAtom),
      (value) => typeof update === "function" ? Promise.resolve(value).then(update) : update
    );
  }
}
var en_default = {
  "@@locale": "en",
  settings: "Settings",
  help: "Help",
  maxZoomOut: "Maximum zoom out",
  maxZoomIn: "Maximum zoom in",
  singlePageCount: "single page count",
  backgroundColor: "Background color",
  leftToRight: "Left to right",
  reset: "Reset",
  doYouReallyWantToReset: "Do you really want to reset?",
  errorIsOccurred: "Error is occurred.",
  failedToLoadImage: "Failed to load image.",
  loading: "Loading...",
  fullScreenRestorationGuide: "Enter full screen yourself if you want to keep the viewer open in full screen.",
  useFullScreen: "Use full screen",
  downloading: "Downloading...",
  cancel: "CANCEL",
  downloadComplete: "Download complete.",
  errorOccurredWhileDownloading: "Error occurred while downloading.",
  keyBindings: "Key bindings",
  toggleViewer: "Toggle viewer",
  toggleFullscreenSetting: "Toggle fullscreen setting",
  nextPage: "Next page",
  previousPage: "Previous page",
  download: "Download",
  refresh: "Refresh",
  increaseSinglePageCount: "Increase single page count",
  decreaseSinglePageCount: "Decrease single page count"
};
var ko_default = {
  "@@locale": "ko",
  settings: "설정",
  help: "도움말",
  maxZoomOut: "최대 축소",
  maxZoomIn: "최대 확대",
  singlePageCount: "한쪽 페이지 수",
  backgroundColor: "배경색",
  leftToRight: "왼쪽부터 보기",
  reset: "초기화",
  doYouReallyWantToReset: "정말 초기화하시겠어요?",
  errorIsOccurred: "에러가 발생했습니다.",
  failedToLoadImage: "이미지를 불러오지 못했습니다.",
  loading: "로딩 중...",
  fullScreenRestorationGuide: "뷰어 전체 화면을 유지하려면 직접 전체 화면을 켜 주세요 (F11).",
  useFullScreen: "전체 화면",
  downloading: "다운로드 중...",
  cancel: "취소",
  downloadComplete: "다운로드 완료",
  errorOccurredWhileDownloading: "다운로드 도중 오류가 발생했습니다",
  keyBindings: "단축키",
  toggleViewer: "뷰어 전환",
  toggleFullscreenSetting: "전체화면 설정 전환",
  nextPage: "다음 페이지",
  previousPage: "이전 페이지",
  download: "다운로드",
  refresh: "새로고침",
  increaseSinglePageCount: "한쪽 페이지 수 늘리기",
  decreaseSinglePageCount: "한쪽 페이지 수 줄이기"
};
var translations = { en: en_default, ko: ko_default };
var i18nStringsAtom = (0, import_jotai.atom)(getLanguage());
var i18nAtom = (0, import_jotai.atom)((get) => get(i18nStringsAtom), (_get, set) => {
  set(i18nStringsAtom, getLanguage());
});
i18nAtom.onMount = (set) => {
  addEventListener("languagechange", set);
  return () => {
    removeEventListener("languagechange", set);
  };
};
function getLanguage() {
  for (const language of navigator.languages) {
    const locale = language.split("-")[0];
    if (!locale) {
      continue;
    }
    const translation = translations[locale];
    if (translation) {
      return translation;
    }
  }
  return en_default;
}
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
var import_react_toastify = require("react-toastify");
GM.getResourceText("react-toastify-css").then(insertCss);
var MAX_RETRY_COUNT = 6;
var MAX_SAME_URL_RETRY_COUNT = 2;
function isDelay(sourceOrDelay) {
  return sourceOrDelay === void 0 || typeof sourceOrDelay !== "string" && !sourceOrDelay.src;
}
function toAdvancedObject(sourceOrDelay) {
  return isDelay(sourceOrDelay) ? { src: void 0 } : toAdvancedSource(sourceOrDelay);
}
function toAdvancedSource(source) {
  return typeof source === "string" ? { type: "image", src: source } : source;
}
async function* getMediaIterable({ media, index, comic, maxSize }) {
  if (!isDelay(media)) {
    yield getUrl(media);
  }
  if (!comic) {
    return;
  }
  let previous;
  let retryCount = 0;
  let sameUrlRetryCount = 0;
  while (sameUrlRetryCount <= MAX_SAME_URL_RETRY_COUNT && retryCount <= MAX_RETRY_COUNT) {
    const hadError = media !== void 0 || retryCount > 0;
    const medias = await comic({ cause: hadError ? "error" : "load", page: index, maxSize });
    const next = medias[index];
    if (isDelay(next)) {
      continue;
    }
    const url = getUrl(next);
    yield url;
    retryCount++;
    if (previous === url) {
      sameUrlRetryCount++;
      continue;
    }
    previous = url;
  }
}
function getUrl(source) {
  return typeof source === "string" ? source : source.src;
}
var viewerOptionsAtom = (0, import_jotai.atom)({});
var viewerStatusAtom = (0, import_jotai.atom)("idle");
var viewerStateAtom = (0, import_jotai.atom)((get) => ({
  options: get(viewerOptionsAtom),
  status: get(viewerStatusAtom)
}));
var maxSizeStateAtom = (0, import_jotai.atom)({ width: screen.width, height: screen.height });
var maxSizeAtom = (0, import_jotai.atom)(
  (get) => get(maxSizeStateAtom),
  (get, set, size) => {
    const current = get(maxSizeStateAtom);
    if (size.width <= current.width && size.height <= current.height) {
      return;
    }
    set(maxSizeStateAtom, {
      width: Math.max(size.width, current.width),
      height: Math.max(size.height, current.height)
    });
  }
);
var mediaSourcesAtom = (0, import_jotai.atom)([]);
var pageAtomsAtom = (0, import_jotai.atom)([]);
var refreshMediaSourceAtom = (0, import_jotai.atom)(null, async (get, set, params) => {
  const { source } = get(viewerOptionsAtom);
  if (!source) {
    return;
  }
  const medias = await source({ ...params, maxSize: get(maxSizeAtom) });
  if (source !== get(viewerOptionsAtom).source) {
    return;
  }
  if (!Array.isArray(medias)) {
    throw new Error(`Invalid comic source type: ${typeof medias}`);
  }
  set(mediaSourcesAtom, medias);
  if (params.cause === "load" && params.page === void 0) {
    set(
      pageAtomsAtom,
      medias.map((media, index) => createPageAtom({ initialSource: media, index, set }))
    );
  }
  if (params.page !== void 0) {
    return medias[params.page];
  }
});
function createPageAtom(params) {
  const { initialSource, index, set } = params;
  const triedUrls = [];
  let div = null;
  const stateAtom = (0, import_jotai.atom)({
    status: "loading",
    source: initialSource ? toAdvancedObject(initialSource) : { src: void 0 }
  });
  const loadAtom = (0, import_jotai.atom)(null, async (get, set2, cause) => {
    switch (cause) {
      case "load":
        triedUrls.length = 0;
        break;
      case "error":
        break;
    }
    if (isComplete()) {
      return;
    }
    let newSource;
    try {
      newSource = await set2(refreshMediaSourceAtom, { cause, page: index });
    } catch (error) {
      console.error(error);
      set2(stateAtom, (previous) => ({
        ...previous,
        status: "error",
        urls: Array.from(triedUrls)
      }));
      return;
    }
    if (isComplete()) {
      return;
    }
    if (isDelay(newSource)) {
      set2(stateAtom, { status: "error", urls: [], source: { src: void 0 } });
      return;
    }
    const source = toAdvancedSource(newSource);
    triedUrls.push(source.src);
    set2(stateAtom, { status: "loading", source });
    function isComplete() {
      return get(stateAtom).status === "complete";
    }
  });
  const aggregateAtom = (0, import_jotai.atom)((get) => {
    get(loadAtom);
    const state = get(stateAtom);
    const scrollElementSize = get(scrollElementSizeAtom);
    const compactWidthIndex = get(singlePageCountAtom);
    const maxZoomInExponent = get(maxZoomInExponentAtom);
    const maxZoomOutExponent = get(maxZoomOutExponentAtom);
    const { src, width, height } = state.source ?? {};
    const ratio = getImageToViewerSizeRatio({
      viewerSize: scrollElementSize,
      imgSize: { width, height }
    });
    const shouldBeOriginalSize = shouldMediaBeOriginalSize({
      maxZoomInExponent,
      maxZoomOutExponent,
      mediaRatio: ratio
    });
    const isLarge = ratio > 1;
    const canMessUpRow = shouldBeOriginalSize && isLarge;
    const mediaProps = { src, onError: reload };
    const divCss = {
      ...shouldBeOriginalSize ? { minHeight: scrollElementSize.height, height: "auto" } : { height: scrollElementSize.height },
      ...state.status !== "complete" ? { aspectRatio: width && height ? `${width} / ${height}` : "3 / 4" } : {}
    };
    const page = {
      index,
      state,
      div,
      setDiv: (newDiv) => {
        div = newDiv;
      },
      reloadAtom: loadAtom,
      fullWidth: index < compactWidthIndex || canMessUpRow,
      shouldBeOriginalSize,
      divCss,
      imageProps: state.source && state.source.type !== "video" ? { ...mediaProps, onLoad: setCompleteState } : void 0,
      videoProps: state.source?.type === "video" ? {
        ...mediaProps,
        controls: true,
        autoPlay: true,
        loop: true,
        muted: true,
        onLoadedMetadata: setCompleteState
      } : void 0
    };
    return page;
  });
  async function reload() {
    const isOverMaxRetry = triedUrls.length > MAX_RETRY_COUNT;
    const urlCountMap = triedUrls.reduce((acc, url) => {
      acc[url] = (acc[url] ?? 0) + 1;
      return acc;
    }, {});
    const isOverSameUrlRetry = Object.values(urlCountMap).some(
      (count) => count > MAX_SAME_URL_RETRY_COUNT
    );
    if (isOverMaxRetry || isOverSameUrlRetry) {
      set(stateAtom, (previous) => ({
        ...previous,
        status: "error",
        urls: [...new Set(triedUrls)]
      }));
      return;
    }
    set(stateAtom, (previous) => ({
      status: "loading",
      source: { ...previous.source, src: void 0 }
    }));
    await set(loadAtom, "error");
  }
  function setCompleteState(event) {
    const element = event.currentTarget;
    set(stateAtom, {
      status: "complete",
      source: {
        src: element.src,
        ...element instanceof HTMLImageElement ? {
          type: "image",
          width: element.naturalWidth,
          height: element.naturalHeight
        } : {
          type: "video",
          width: element.videoWidth,
          height: element.videoHeight
        }
      }
    });
  }
  if (isDelay(initialSource)) {
    set(loadAtom, "load");
  }
  return aggregateAtom;
}
function getImageToViewerSizeRatio({ viewerSize, imgSize }) {
  if (!imgSize.height && !imgSize.width) {
    return 1;
  }
  return Math.max(
    (imgSize.height ?? 0) / viewerSize.height,
    (imgSize.width ?? 0) / viewerSize.width
  );
}
function shouldMediaBeOriginalSize({ maxZoomOutExponent, maxZoomInExponent, mediaRatio }) {
  const minZoomRatio = Math.sqrt(2) ** maxZoomOutExponent;
  const maxZoomRatio = Math.sqrt(2) ** maxZoomInExponent;
  const isOver = minZoomRatio < mediaRatio || mediaRatio < 1 / maxZoomRatio;
  return isOver;
}
var globalCss = document.createElement("style");
globalCss.innerHTML = `html, body {
  overflow: hidden;
}`;
function hideBodyScrollBar(doHide) {
  if (doHide) {
    document.head.append(globalCss);
  } else {
    globalCss.remove();
  }
}
async function setFullscreenElement(element) {
  if (element) {
    await element.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
}
function focusWithoutScroll(element) {
  element?.focus({ preventScroll: true });
}
function isUserGesturePermissionError(error) {
  return error?.message === "Permissions check failed";
}
var fullscreenElementAtom = (0, import_jotai.atom)(null);
var viewerElementAtom = (0, import_jotai.atom)(null);
var isViewerFullscreenAtom = (0, import_jotai.atom)((get) => {
  const viewerElement = get(viewerElementAtom);
  return !!viewerElement && viewerElement === get(fullscreenElementAtom);
});
var isImmersiveAtom = (0, import_jotai.atom)(false);
var isViewerImmersiveAtom = (0, import_jotai.atom)((get) => get(isImmersiveAtom));
var scrollBarStyleFactorAtom = (0, import_jotai.atom)(
  (get) => ({
    fullscreenElement: get(fullscreenElementAtom),
    viewerElement: get(viewerElementAtom)
  }),
  (get, set, factors) => {
    const { fullscreenElement, viewerElement, isImmersive } = factors;
    if (fullscreenElement !== void 0) {
      set(fullscreenElementAtom, fullscreenElement);
    }
    if (viewerElement !== void 0) {
      set(viewerElementAtom, viewerElement);
    }
    if (isImmersive !== void 0) {
      set(wasImmersiveAtom, isImmersive);
      set(isImmersiveAtom, isImmersive);
    }
    const canScrollBarDuplicate = !get(isViewerFullscreenAtom) && get(isImmersiveAtom);
    hideBodyScrollBar(canScrollBarDuplicate);
  }
);
var viewerFullscreenAtom = (0, import_jotai.atom)((get) => {
  get(isFullscreenPreferredAtom);
  return get(isViewerFullscreenAtom);
}, async (get, _set, value) => {
  const element = value ? get(viewerElementAtom) : null;
  const { fullscreenElement } = get(scrollBarStyleFactorAtom);
  if (element === fullscreenElement) {
    return true;
  }
  const fullscreenChange = new Promise((resolve) => {
    addEventListener("fullscreenchange", resolve, { once: true });
  });
  try {
    await setFullscreenElement(element);
    await fullscreenChange;
    return true;
  } catch (error) {
    if (isUserGesturePermissionError(error)) {
      return false;
    }
    throw error;
  }
});
var transitionDeferredAtom = (0, import_jotai.atom)({});
var transitionLockAtom = (0, import_jotai.atom)(null, async (get, set) => {
  const { deferred: previousLock } = get(transitionDeferredAtom);
  const lock = deferred();
  set(transitionDeferredAtom, { deferred: lock });
  await previousLock;
  return { deferred: lock };
});
var isFullscreenPreferredSettingsAtom = (0, import_jotai.atom)(
  (get) => get(isFullscreenPreferredAtom),
  async (get, set, value) => {
    const promise = set(isFullscreenPreferredAtom, value);
    const appliedValue = value === import_utils.RESET ? (await promise, get(isFullscreenPreferredAtom)) : value;
    const lock = await set(transitionLockAtom);
    try {
      const wasImmersive = get(wasImmersiveAtom);
      const shouldEnterFullscreen = appliedValue && wasImmersive;
      await set(viewerFullscreenAtom, shouldEnterFullscreen);
    } finally {
      lock.deferred.resolve();
    }
  }
);
var rootAtom = (0, import_jotai.atom)(null);
var externalFocusElementAtom = (0, import_jotai.atom)(null);
var setViewerImmersiveAtom = (0, import_jotai.atom)(null, async (get, set, value) => {
  const lock = await set(transitionLockAtom);
  try {
    await transactImmersive(get, set, value);
  } finally {
    lock.deferred.resolve();
  }
});
async function transactImmersive(get, set, value) {
  if (get(isViewerImmersiveAtom) === value) {
    return;
  }
  if (value) {
    set(externalFocusElementAtom, (previous) => previous ? previous : document.activeElement);
    if (!get(viewerStateAtom).options.noSyncScroll) {
      set(transferWindowScrollToViewerAtom);
    }
  }
  const scrollable = get(scrollElementAtom);
  if (!scrollable) {
    return;
  }
  try {
    if (get(isFullscreenPreferredAtom)) {
      const isAccepted = await set(viewerFullscreenAtom, value);
      if (!isAccepted) {
        const noticeCount = await get(fullscreenNoticeCountPromiseAtom) ?? 0;
        if (shouldShowF11Guide({ noticeCount })) {
          showF11Guide();
          return;
        }
      }
    }
  } finally {
    set(scrollBarStyleFactorAtom, { isImmersive: value });
    if (value) {
      focusWithoutScroll(scrollable);
    } else {
      if (!get(viewerStateAtom).options.noSyncScroll) {
        set(transferViewerScrollToWindowAtom);
      }
      const externalFocusElement = get(externalFocusElementAtom);
      focusWithoutScroll(externalFocusElement);
    }
  }
  function showF11Guide() {
    (0, import_react_toastify.toast)(get(i18nAtom).fullScreenRestorationGuide, {
      type: "info",
      onClose: () => {
        set(fullscreenNoticeCountPromiseAtom, (count) => (count ?? 0) + 1);
      }
    });
  }
}
var isBeforeUnloadAtom = (0, import_jotai.atom)(false);
var beforeUnloadAtom = (0, import_jotai.atom)(null, async (_get, set) => {
  set(isBeforeUnloadAtom, true);
  await waitUnloadFinishRoughly();
  set(isBeforeUnloadAtom, false);
});
beforeUnloadAtom.onMount = (set) => {
  addEventListener("beforeunload", set);
  return () => removeEventListener("beforeunload", set);
};
var fullscreenSynchronizationAtom = (0, import_jotai.atom)(
  (get) => {
    get(isBeforeUnloadAtom);
    return get(scrollBarStyleFactorAtom).fullscreenElement;
  },
  (get, set, element) => {
    const isFullscreenPreferred = get(isFullscreenPreferredAtom);
    const isFullscreen = element === get(scrollBarStyleFactorAtom).viewerElement;
    const wasImmersive = get(isViewerImmersiveAtom);
    const isViewerFullscreenExit = wasImmersive && !isFullscreen;
    const isNavigationExit = get(isBeforeUnloadAtom);
    const shouldExitImmersive = isFullscreenPreferred && isViewerFullscreenExit && !isNavigationExit;
    set(scrollBarStyleFactorAtom, {
      fullscreenElement: element,
      isImmersive: shouldExitImmersive ? false : void 0
    });
  }
);
fullscreenSynchronizationAtom.onMount = (set) => {
  const notify = () => set(document.fullscreenElement ?? null);
  document.addEventListener("fullscreenchange", notify);
  return () => document.removeEventListener("fullscreenchange", notify);
};
var setViewerElementAtom = (0, import_jotai.atom)(null, (_get, set, element) => {
  set(scrollBarStyleFactorAtom, { viewerElement: element });
});
var viewerModeAtom = (0, import_jotai.atom)((get) => {
  const isFullscreen = get(viewerFullscreenAtom);
  const isImmersive = get(isViewerImmersiveAtom);
  return isFullscreen ? "fullscreen" : isImmersive ? "window" : "normal";
});
var setViewerOptionsAtom = (0, import_jotai.atom)(null, async (get, set, options) => {
  try {
    const { source } = options;
    const previousOptions = get(viewerOptionsAtom);
    const shouldLoadSource = source && source !== previousOptions.source;
    if (!shouldLoadSource) {
      return;
    }
    set(viewerStatusAtom, (previous) => previous === "complete" ? "complete" : "loading");
    set(viewerOptionsAtom, options);
    await set(refreshMediaSourceAtom, { cause: "load" });
    set(viewerStatusAtom, "complete");
  } catch (error) {
    set(viewerStatusAtom, "error");
    throw error;
  }
});
var reloadErroredAtom = (0, import_jotai.atom)(null, (get, set) => {
  stop();
  for (const page of get(pageAtomsAtom).map(get)) {
    if (page.state.status !== "complete") {
      set(page.reloadAtom, "load");
    }
  }
});
var toggleImmersiveAtom = (0, import_jotai.atom)(null, async (get, set) => {
  const hasPermissionIssue = get(viewerModeAtom) === "window" && get(isFullscreenPreferredAtom);
  if (hasPermissionIssue) {
    await set(viewerFullscreenAtom, true);
    return;
  }
  await set(setViewerImmersiveAtom, !get(isViewerImmersiveAtom));
});
var toggleFullscreenAtom = (0, import_jotai.atom)(null, async (get, set) => {
  set(isFullscreenPreferredSettingsAtom, !get(isFullscreenPreferredSettingsAtom));
  if (get(viewerModeAtom) === "normal") {
    await set(setViewerImmersiveAtom, true);
  }
});
var blockSelectionAtom = (0, import_jotai.atom)(null, (_get, set, event) => {
  if (event.detail >= 2) {
    event.preventDefault();
  }
  if (event.buttons === 3) {
    set(toggleImmersiveAtom);
    event.preventDefault();
  }
});
async function waitUnloadFinishRoughly() {
  for (let i = 0; i < 5; i++) {
    await timeout(100);
  }
}
function shouldShowF11Guide({ noticeCount }) {
  const isUserFullscreen = innerHeight === screen.height || innerWidth === screen.width;
  return noticeCount < 3 && !isUserFullscreen;
}
var { styled, css, keyframes } = (0, import_react.createStitches)({});
function DownloadCancel({ onClick }) {
  const strings = (0, import_jotai.useAtomValue)(i18nAtom);
  return  React.createElement(SpaceBetween, null,  React.createElement("p", null, strings.downloading),  React.createElement("button", { onClick }, strings.cancel));
}
var SpaceBetween = styled("div", {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between"
});
var isGmFetchAvailable = typeof GM.xmlHttpRequest === "function";
async function gmFetch(url, init) {
  const method = init?.body ? "POST" : "GET";
  const response = await GM.xmlHttpRequest({
    method,
    url,
    headers: {
      referer: `${location.origin}/`,
      ...init?.headers
    },
    responseType: init?.type === "text" ? void 0 : init?.type,
    data: init?.body
  });
  return response;
}
async function download(comic, options) {
  const { onError, onProgress, signal } = options || {};
  let startedCount = 0;
  let resolvedCount = 0;
  let rejectedCount = 0;
  let status = "ongoing";
  const pages = await comic({ cause: "download", maxSize: { width: Infinity, height: Infinity } });
  const digit = Math.floor(Math.log10(pages.length)) + 1;
  return archiveWithReport();
  async function archiveWithReport() {
    const result = await Promise.all(pages.map(downloadWithReport));
    if (signal?.aborted) {
      reportProgress({ transition: "cancelled" });
      signal.throwIfAborted();
    }
    const pairs = await Promise.all(result.map(toPair));
    const data = Object.assign({}, ...pairs);
    const value = deferred();
    const abort = (0, deps_exports.zip)(data, { level: 0 }, (error, array) => {
      if (error) {
        reportProgress({ transition: "error" });
        value.reject(error);
      } else {
        reportProgress({ transition: "complete" });
        value.resolve(array);
      }
    });
    signal?.addEventListener("abort", abort, { once: true });
    return value;
  }
  async function downloadWithReport(source, pageIndex) {
    const errors = [];
    startedCount++;
    reportProgress();
    for await (const event of downloadImage({ media: source, pageIndex })) {
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
  }
  async function* downloadImage({ media, pageIndex }) {
    const maxSize = { width: Infinity, height: Infinity };
    const mediaParams = { media, index: pageIndex, comic, maxSize };
    for await (const url of getMediaIterable(mediaParams)) {
      if (signal?.aborted) {
        break;
      }
      try {
        const blob = await fetchBlobWithCacheIfPossible(url, signal);
        yield { url, blob };
      } catch (error) {
        yield await fetchBlobIgnoringCors(url, { signal, fetchError: error });
      }
    }
  }
  async function toPair({ url, blob }, index) {
    const array = new Uint8Array(await blob.arrayBuffer());
    const pad = `${index}`.padStart(digit, "0");
    const name = `${pad}${guessExtension(array) ?? getExtension(url)}`;
    return { [name]: array };
  }
  function reportProgress({ transition } = {}) {
    if (status !== "ongoing") {
      return;
    }
    if (transition) {
      status = transition;
    }
    onProgress?.({
      total: pages.length,
      started: startedCount,
      settled: resolvedCount + rejectedCount,
      rejected: rejectedCount,
      status
    });
  }
}
function getExtension(url) {
  if (!url) {
    return ".txt";
  }
  const extension = url.match(/\.[^/?#]{3,4}?(?=[?#]|$)/);
  return extension?.[0] || ".jpg";
}
function guessExtension(array) {
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
}
async function fetchBlobWithCacheIfPossible(url, signal) {
  const response = await fetch(url, { signal });
  return await response.blob();
}
async function fetchBlobIgnoringCors(url, { signal, fetchError }) {
  if (isCrossOrigin(url) && !isGmFetchAvailable) {
    return {
      error: new Error(
        "It could be a CORS issue but cannot use GM.xmlhttpRequest",
        { cause: fetchError }
      )
    };
  }
  try {
    const response = await gmFetch(url, { signal, type: "blob" });
    if (response.status >= 400) {
      const body = await response.response.text();
      const message = `failed to load ${url} with HTTP ${response.status} ${response.statusText}
${body}`;
      return { error: new Error(message) };
    }
    return { url, blob: response.response };
  } catch (error) {
    if (isGmCancelled(error)) {
      return { error: new Error("download aborted") };
    } else {
      return { error: fetchError };
    }
  }
}
function isCrossOrigin(url) {
  return new URL(url).origin !== location.origin;
}
function isGmCancelled(error) {
  return error instanceof Function;
}
var aborterAtom = (0, import_jotai.atom)(null);
var cancelDownloadAtom = (0, import_jotai.atom)(null, (get) => {
  get(aborterAtom)?.abort();
});
var startDownloadAtom = (0, import_jotai.atom)(null, async (get, set, options) => {
  const aborter = new AbortController();
  set(aborterAtom, (previous) => {
    previous?.abort();
    return aborter;
  });
  const viewerState = get(viewerStateAtom);
  const source = options?.source ?? viewerState.options.source;
  if (!source) {
    return;
  }
  let toastId = null;
  addEventListener("beforeunload", confirmDownloadAbort);
  try {
    toastId = (0, import_react_toastify.toast)( React.createElement(DownloadCancel, { onClick: aborter.abort }), { autoClose: false, progress: 0 });
    return await download(source, {
      onProgress: reportProgress,
      onError: logIfNotAborted,
      signal: aborter.signal
    });
  } finally {
    removeEventListener("beforeunload", confirmDownloadAbort);
  }
  async function reportProgress(event) {
    if (!toastId) {
      return;
    }
    const { total, started, settled, rejected, status } = event;
    const value = started / total * 0.1 + settled / total * 0.89;
    switch (status) {
      case "ongoing":
        import_react_toastify.toast.update(toastId, { type: rejected > 0 ? "warning" : "default", progress: value });
        break;
      case "complete":
        import_react_toastify.toast.update(toastId, {
          type: "success",
          render: get(i18nAtom).downloadComplete,
          progress: 0.9999
        });
        await timeout(1e3);
        import_react_toastify.toast.done(toastId);
        break;
      case "error":
        import_react_toastify.toast.update(toastId, {
          type: "error",
          render: get(i18nAtom).errorOccurredWhileDownloading,
          progress: 0
        });
        break;
      case "cancelled":
        import_react_toastify.toast.done(toastId);
        break;
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
var controllerAtom = (0, import_jotai.atom)(null);
var controllerCreationAtom = (0, import_jotai.atom)((get) => get(controllerAtom), (get, set) => {
  const existing = get(controllerAtom);
  if (existing) {
    return existing;
  }
  const controller = new Controller(get, set);
  set(controllerAtom, controller);
  return controller;
});
controllerCreationAtom.onMount = (set) => void set();
var Controller = class {
  constructor(get, set) {
    this.get = get;
    this.set = set;
    addEventListener("keydown", this.defaultGlobalKeyHandler);
    this.elementKeyHandler = this.defaultElementKeyHandler;
  }
  currentElementKeyHandler = null;
  get options() {
    return this.get(viewerStateAtom).options;
  }
  get status() {
    return this.get(viewerStateAtom).status;
  }
  get container() {
    return this.get(scrollBarStyleFactorAtom).viewerElement;
  }
  downloader = {
    download: (options) => this.set(startDownloadAtom, options),
    downloadAndSave: (options) => this.set(downloadAndSaveAtom, options),
    cancel: () => this.set(cancelDownloadAtom)
  };
  get pages() {
    return this.get(pageAtomsAtom).map(this.get);
  }
  get viewerMode() {
    return this.get(viewerModeAtom);
  }
  get effectivePreferences() {
    return this.get(effectivePreferencesAtom);
  }
  set elementKeyHandler(handler) {
    const { currentElementKeyHandler, container } = this;
    const scrollable = this.container?.querySelector("div[data-overlayscrollbars-viewport]");
    if (currentElementKeyHandler) {
      container?.removeEventListener("keydown", currentElementKeyHandler);
      scrollable?.removeEventListener("keydown", currentElementKeyHandler);
    }
    if (handler) {
      container?.addEventListener("keydown", handler);
      scrollable?.addEventListener("keydown", handler);
    }
  }
  setOptions = (value) => {
    this.set(setViewerOptionsAtom, value);
  };
  goPrevious = () => {
    this.set(goPreviousAtom);
  };
  goNext = () => {
    this.set(goNextAtom);
  };
  setManualPreferences = (value) => {
    return this.set(effectivePreferencesAtom, value);
  };
  setScriptPreferences = ({
    manualPreset,
    preferences
  }) => {
    if (manualPreset) {
      this.set(preferencesPresetAtom, manualPreset);
    }
    if (preferences) {
      this.set(scriptPreferencesAtom, preferences);
    }
  };
  setImmersive = (value) => {
    return this.set(setViewerImmersiveAtom, value);
  };
  setIsFullscreenPreferred = (value) => {
    return this.set(isFullscreenPreferredSettingsAtom, value);
  };
  toggleImmersive = () => {
    this.set(toggleImmersiveAtom);
  };
  toggleFullscreen = () => {
    this.set(toggleFullscreenAtom);
  };
  reloadErrored = () => {
    this.set(reloadErroredAtom);
  };
  unmount = () => {
    return this.get(rootAtom)?.unmount();
  };
  defaultElementKeyHandler = (event) => {
    if (maybeNotHotkey(event)) {
      return false;
    }
    const isHandled = this.handleElementKey(event);
    if (isHandled) {
      event.stopPropagation();
      event.preventDefault();
    }
    return isHandled;
  };
  defaultGlobalKeyHandler = (event) => {
    if (maybeNotHotkey(event)) {
      return false;
    }
    if (["KeyI", "Numpad0", "Enter"].includes(event.code)) {
      if (event.shiftKey) {
        this.toggleFullscreen();
      } else {
        this.toggleImmersive();
      }
      return true;
    }
    return false;
  };
  handleElementKey(event) {
    switch (event.key) {
      case "j":
      case "ArrowDown":
      case "q":
        this.goNext();
        return true;
      case "k":
      case "ArrowUp":
        this.goPrevious();
        return true;
      case "h":
      case "ArrowLeft":
        if (this.options.onPreviousSeries) {
          this.options.onPreviousSeries();
          return true;
        }
        return false;
      case "l":
      case "ArrowRight":
      case "w":
        if (this.options.onNextSeries) {
          this.options.onNextSeries();
          return true;
        }
        return false;
      case ";":
        this.downloader?.downloadAndSave();
        return true;
      case "/":
        void this.addSinglePageCount(1);
        return true;
      case "?":
        void this.addSinglePageCount(-1);
        return true;
      case "'":
        this.reloadErrored();
        return true;
      default:
        return false;
    }
  }
  async addSinglePageCount(diff) {
    await this.setManualPreferences((preferences) => ({
      ...preferences,
      singlePageCount: this.effectivePreferences.singlePageCount + diff
    }));
  }
};
function maybeNotHotkey(event) {
  const { ctrlKey, altKey, metaKey } = event;
  return ctrlKey || altKey || metaKey || isTyping(event);
}
var setScrollElementAtom = (0, import_jotai.atom)(null, async (get, set, div) => {
  const previous = get(scrollElementStateAtom);
  if (previous?.div === div) {
    return;
  }
  previous?.resizeObserver.disconnect();
  if (div === null) {
    set(scrollElementStateAtom, null);
    return;
  }
  const setScrollElementSize = () => {
    const size = div.getBoundingClientRect();
    set(maxSizeAtom, size);
    set(correctScrollAtom);
  };
  const resizeObserver = new ResizeObserver(setScrollElementSize);
  resizeObserver.observe(div);
  resizeObserver.observe(div.firstElementChild);
  set(scrollElementStateAtom, { div, resizeObserver });
  setScrollElementSize();
  await get(isFullscreenPreferredPromiseAtom);
  await set(setViewerImmersiveAtom, get(wasImmersiveAtom));
});
var Svg = styled("svg", {
  opacity: "50%",
  filter: "drop-shadow(0 0 1px white) drop-shadow(0 0 1px white)",
  color: "black"
});
var downloadCss = { width: "40px" };
var fullscreenCss = {
  position: "absolute",
  right: "1%",
  bottom: "1%"
};
var IconButton = styled("button", {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
  "& > svg": {
    pointerEvents: "none"
  },
  "&:hover > svg": {
    opacity: "100%",
    transform: "scale(1.1)"
  },
  "&:focus > svg": {
    opacity: "100%"
  }
});
var DownloadButton = (props) =>  React.createElement(IconButton, { ...props },  React.createElement(
  Svg,
  {
    version: "1.1",
    xmlns: "http://www.w3.org/2000/svg",
    x: "0px",
    y: "0px",
    viewBox: "0 -34.51 122.88 122.87",
    css: downloadCss
  },
   React.createElement("g", null,  React.createElement("path", { d: "M58.29,42.08V3.12C58.29,1.4,59.7,0,61.44,0s3.15,1.4,3.15,3.12v38.96L79.1,29.4c1.3-1.14,3.28-1.02,4.43,0.27 s1.03,3.25-0.27,4.39L63.52,51.3c-1.21,1.06-3.01,1.03-4.18-0.02L39.62,34.06c-1.3-1.14-1.42-3.1-0.27-4.39 c1.15-1.28,3.13-1.4,4.43-0.27L58.29,42.08L58.29,42.08L58.29,42.08z M0.09,47.43c-0.43-1.77,0.66-3.55,2.43-3.98 c1.77-0.43,3.55,0.66,3.98,2.43c1.03,4.26,1.76,7.93,2.43,11.3c3.17,15.99,4.87,24.57,27.15,24.57h52.55 c20.82,0,22.51-9.07,25.32-24.09c0.67-3.6,1.4-7.5,2.44-11.78c0.43-1.77,2.21-2.86,3.98-2.43c1.77,0.43,2.85,2.21,2.43,3.98 c-0.98,4.02-1.7,7.88-2.36,11.45c-3.44,18.38-5.51,29.48-31.8,29.48H36.07C8.37,88.36,6.3,77.92,2.44,58.45 C1.71,54.77,0.98,51.08,0.09,47.43L0.09,47.43z" }))
));
var FullscreenButton = (props) =>  React.createElement(IconButton, { css: fullscreenCss, ...props },  React.createElement(
  Svg,
  {
    version: "1.1",
    xmlns: "http://www.w3.org/2000/svg",
    x: "0px",
    y: "0px",
    viewBox: "0 0 122.88 122.87",
    width: "40px",
    ...props
  },
   React.createElement("g", null,  React.createElement("path", { d: "M122.88,77.63v41.12c0,2.28-1.85,4.12-4.12,4.12H77.33v-9.62h35.95c0-12.34,0-23.27,0-35.62H122.88L122.88,77.63z M77.39,9.53V0h41.37c2.28,0,4.12,1.85,4.12,4.12v41.18h-9.63V9.53H77.39L77.39,9.53z M9.63,45.24H0V4.12C0,1.85,1.85,0,4.12,0h41 v9.64H9.63V45.24L9.63,45.24z M45.07,113.27v9.6H4.12c-2.28,0-4.12-1.85-4.12-4.13V77.57h9.63v35.71H45.07L45.07,113.27z" }))
));
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
var SettingsButton = (props) => {
  return  React.createElement(IconButton, { ...props },  React.createElement(
    Svg,
    {
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      viewBox: "0 0 24 24",
      height: "40px",
      width: "40px"
    },
     React.createElement("path", { d: "M15 12 A3 3 0 0 1 12 15 A3 3 0 0 1 9 12 A3 3 0 0 1 15 12 z" }),
     React.createElement("path", { d: "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" })
  ));
};
var Container = styled("div", {
  position: "relative",
  height: "100%",
  overflow: "hidden",
  userSelect: "none",
  fontFamily: "Pretendard, NanumGothic, sans-serif",
  fontSize: "16px",
  color: "black",
  variants: {
    immersive: {
      true: {
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    }
  }
});
var OverlayScroller = styled("div", {
  position: "relative",
  width: "100%",
  height: "100%",
  outline: "none",
  "& > div[data-overlayscrollbars-viewport]:focus-visible": {
    outline: "none"
  },
  "& .os-scrollbar-handle": {
    backdropFilter: "brightness(0.5)",
    background: "none",
    border: "#fff8 1px solid"
  },
  variants: {
    fullscreen: {
      true: {
        position: "fixed",
        top: 0,
        bottom: 0,
        overflow: "auto"
      }
    }
  }
});
var import_jotai3 = require("jotai");
var Backdrop = styled("div", {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
  minWidth: "20em",
  minHeight: "20em",
  transition: "0.2s",
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.2)"
});
function BackdropDialog({ onClose, ...props }) {
  const [isOpen, setIsOpen] = (0, import_react3.useState)(false);
  const close = async () => {
    setIsOpen(false);
    await timeout(200);
    onClose();
  };
  const closeIfEnter = (event) => {
    if (event.key === "Enter") {
      close();
      event.stopPropagation();
    }
  };
  (0, import_react3.useEffect)(() => {
    setIsOpen(true);
  }, []);
  return  React.createElement(Backdrop, { isOpen, onClick: close, onKeyDown: closeIfEnter },  React.createElement(
    CenterDialog,
    {
      onClick: (event) => event.stopPropagation(),
      ...props
    }
  ));
}
function HelpTab() {
  const keyBindings = (0, import_jotai.useAtomValue)(keyBindingsAtom);
  const strings = (0, import_jotai.useAtomValue)(i18nAtom);
  return  React.createElement(React.Fragment, null,  React.createElement("p", null, strings.keyBindings),  React.createElement("table", null, keyBindings.map(([action, keyBinding]) =>  React.createElement("tr", null,  React.createElement(ActionName, null, action),  React.createElement("td", null, keyBinding)))));
}
var keyBindingsAtom = (0, import_jotai.atom)((get) => {
  const strings = get(i18nAtom);
  return [
    [
      strings.toggleViewer,
       React.createElement(React.Fragment, null,  React.createElement("kbd", null, "i"), ", ",  React.createElement("kbd", null, "Enter⏎"), ", ",  React.createElement("kbd", null, "NumPad0"))
    ],
    [
      strings.toggleFullscreenSetting,
       React.createElement(React.Fragment, null,  React.createElement("kbd", null, "⇧Shift"), "+(",  React.createElement("kbd", null, "i"), ", ",  React.createElement("kbd", null, "Enter⏎"), ", ",  React.createElement("kbd", null, "NumPad0"), ")")
    ],
    [
      strings.nextPage,
       React.createElement(React.Fragment, null,  React.createElement("kbd", null, "j"), ", ",  React.createElement("kbd", null, "↓"), ", ",  React.createElement("kbd", null, "q"))
    ],
    [
      strings.previousPage,
       React.createElement(React.Fragment, null,  React.createElement("kbd", null, "k"), ", ",  React.createElement("kbd", null, "↑"))
    ],
    [strings.download,  React.createElement("kbd", null, ";")],
    [strings.refresh,  React.createElement("kbd", null, "'")],
    [strings.increaseSinglePageCount,  React.createElement("kbd", null, "/")],
    [strings.decreaseSinglePageCount,  React.createElement("kbd", null, "?")]
  ];
});
var ActionName = styled("td", {
  width: "50%"
});
function SettingsTab() {
  const [maxZoomOutExponent, setMaxZoomOutExponent] = (0, import_jotai.useAtom)(maxZoomOutExponentAtom);
  const [maxZoomInExponent, setMaxZoomInExponent] = (0, import_jotai.useAtom)(maxZoomInExponentAtom);
  const [singlePageCount, setSinglePageCount] = (0, import_jotai.useAtom)(singlePageCountAtom);
  const [backgroundColor, setBackgroundColor] = (0, import_jotai.useAtom)(backgroundColorAtom);
  const [pageDirection, setPageDirection] = (0, import_jotai.useAtom)(pageDirectionAtom);
  const [isFullscreenPreferred, setIsFullscreenPreferred] = (0, import_jotai.useAtom)(
    isFullscreenPreferredSettingsAtom
  );
  const zoomOutExponentInputId = (0, import_react3.useId)();
  const zoomInExponentInputId = (0, import_react3.useId)();
  const singlePageCountInputId = (0, import_react3.useId)();
  const colorInputId = (0, import_react3.useId)();
  const pageDirectionInputId = (0, import_react3.useId)();
  const fullscreenInputId = (0, import_react3.useId)();
  const strings = (0, import_jotai.useAtomValue)(i18nAtom);
  const [isResetConfirming, setResetConfirming] = (0, import_react3.useState)(false);
  const maxZoomOut = formatMultiplier(maxZoomOutExponent);
  const maxZoomIn = formatMultiplier(maxZoomInExponent);
  function tryReset() {
    if (!isResetConfirming) {
      setResetConfirming(true);
      return;
    }
    setMaxZoomInExponent(import_utils.RESET);
    setMaxZoomOutExponent(import_utils.RESET);
    setSinglePageCount(import_utils.RESET);
    setBackgroundColor(import_utils.RESET);
    setPageDirection(import_utils.RESET);
    setIsFullscreenPreferred(import_utils.RESET);
    setResetConfirming(false);
  }
  return  React.createElement(ConfigSheet, null,  React.createElement(ConfigRow, null,  React.createElement(ConfigLabel, { htmlFor: zoomOutExponentInputId }, strings.maxZoomOut, ": ", maxZoomOut),  React.createElement(
    "input",
    {
      type: "number",
      min: 0,
      step: 0.1,
      id: zoomOutExponentInputId,
      value: maxZoomOutExponent,
      onChange: (event) => {
        setMaxZoomOutExponent(event.currentTarget.valueAsNumber || 0);
      }
    }
  )),  React.createElement(ConfigRow, null,  React.createElement(ConfigLabel, { htmlFor: zoomInExponentInputId }, strings.maxZoomIn, ": ", maxZoomIn),  React.createElement(
    "input",
    {
      type: "number",
      min: 0,
      step: 0.1,
      id: zoomInExponentInputId,
      value: maxZoomInExponent,
      onChange: (event) => {
        setMaxZoomInExponent(event.currentTarget.valueAsNumber || 0);
      }
    }
  )),  React.createElement(ConfigRow, null,  React.createElement(ConfigLabel, { htmlFor: singlePageCountInputId }, strings.singlePageCount),  React.createElement(
    "input",
    {
      type: "number",
      min: 0,
      step: 1,
      id: singlePageCountInputId,
      value: singlePageCount,
      onChange: (event) => {
        setSinglePageCount(event.currentTarget.valueAsNumber || 0);
      }
    }
  )),  React.createElement(ConfigRow, null,  React.createElement(ConfigLabel, { htmlFor: colorInputId }, strings.backgroundColor),  React.createElement(
    ColorInput,
    {
      type: "color",
      id: colorInputId,
      value: backgroundColor,
      onChange: (event) => {
        setBackgroundColor(event.currentTarget.value);
      }
    }
  )),  React.createElement(ConfigRow, null,  React.createElement("p", null, strings.useFullScreen),  React.createElement(Toggle, null,  React.createElement(
    HiddenInput,
    {
      type: "checkbox",
      id: fullscreenInputId,
      checked: isFullscreenPreferred,
      onChange: (event) => {
        setIsFullscreenPreferred(event.currentTarget.checked);
      }
    }
  ),  React.createElement("label", { htmlFor: fullscreenInputId }, strings.useFullScreen))),  React.createElement(ConfigRow, null,  React.createElement("p", null, strings.leftToRight),  React.createElement(Toggle, null,  React.createElement(
    HiddenInput,
    {
      type: "checkbox",
      id: pageDirectionInputId,
      checked: pageDirection === "leftToRight",
      onChange: (event) => {
        setPageDirection(event.currentTarget.checked ? "leftToRight" : "rightToLeft");
      }
    }
  ),  React.createElement("label", { htmlFor: pageDirectionInputId }, strings.leftToRight))),  React.createElement(ResetButton, { onClick: tryReset }, isResetConfirming ? strings.doYouReallyWantToReset : strings.reset));
}
function formatMultiplier(maxZoomOutExponent) {
  return Math.sqrt(2) ** maxZoomOutExponent === Infinity ? "∞" : `${(Math.sqrt(2) ** maxZoomOutExponent).toPrecision(2)}x`;
}
var ConfigLabel = styled("label", {
  margin: 0
});
var ResetButton = styled("button", {
  padding: "0.2em 0.5em",
  background: "none",
  border: "red 1px solid",
  borderRadius: "0.2em",
  color: "red",
  cursor: "pointer",
  transition: "0.3s",
  "&:hover": {
    background: "#ffe0e0"
  }
});
var ColorInput = styled("input", {
  height: "1.5em"
});
var ConfigRow = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10%",
  "&& > *": {
    fontSize: "1em",
    fontWeight: "medium",
    minWidth: 0
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
var ConfigSheet = styled("div", {
  display: "flex",
  flexFlow: "column nowrap",
  alignItems: "stretch",
  gap: "0.8em"
});
function ViewerDialog({ onClose }) {
  const strings = (0, import_jotai.useAtomValue)(i18nAtom);
  return  React.createElement(BackdropDialog, { onClose },  React.createElement(import_react2.Tab.Group, null,  React.createElement(import_react2.Tab.List, { as: TabList },  React.createElement(import_react2.Tab, { as: PlainTab }, strings.settings),  React.createElement(import_react2.Tab, { as: PlainTab }, strings.help)),  React.createElement(import_react2.Tab.Panels, { as: TabPanels },  React.createElement(import_react2.Tab.Panel, null,  React.createElement(SettingsTab, null)),  React.createElement(import_react2.Tab.Panel, null,  React.createElement(HelpTab, null)))));
}
var PlainTab = styled("button", {
  flex: 1,
  padding: "0.5em 1em",
  background: "transparent",
  border: "none",
  borderRadius: "0.5em",
  color: "#888",
  cursor: "pointer",
  fontSize: "1.2em",
  fontWeight: "bold",
  textAlign: "center",
  '&[data-headlessui-state="selected"]': {
    border: "1px solid black",
    color: "black"
  },
  "&:hover": {
    color: "black"
  }
});
var TabList = styled("div", {
  display: "flex",
  flexFlow: "row nowrap",
  gap: "0.5em"
});
var TabPanels = styled("div", {
  marginTop: "1em"
});
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
  const downloadAndSave = (0, import_jotai.useSetAtom)(downloadAndSaveAtom);
  const [isOpen, setIsOpen] = (0, import_react3.useState)(false);
  const scrollable = (0, import_jotai3.useAtomValue)(scrollElementAtom);
  const closeDialog = () => {
    setIsOpen(false);
    scrollable?.focus();
  };
  return  React.createElement(React.Fragment, null,  React.createElement(LeftBottomFloat, null,  React.createElement(MenuActions, null,  React.createElement(SettingsButton, { onClick: () => setIsOpen((value) => !value) }),  React.createElement(DownloadButton, { onClick: () => downloadAndSave() }))), isOpen &&  React.createElement(ViewerDialog, { onClose: closeDialog }));
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
  maxWidth: "100%",
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "@media print": {
    margin: 0
  },
  variants: {
    fullWidth: {
      true: { width: "100%" }
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
  lineBreak: "anywhere",
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
var Video = styled("video", {
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
var Page = ({ atom: atom3, ...props }) => {
  const {
    imageProps,
    videoProps,
    fullWidth,
    reloadAtom,
    shouldBeOriginalSize,
    divCss,
    state: pageState,
    setDiv
  } = (0, import_jotai.useAtomValue)(atom3);
  const strings = (0, import_jotai.useAtomValue)(i18nAtom);
  const reload = (0, import_jotai.useSetAtom)(reloadAtom);
  const { status } = pageState;
  const reloadErrored = async (event) => {
    event.stopPropagation();
    await reload("load");
  };
  return  React.createElement(Overlay, { ref: setDiv, css: divCss, fullWidth }, status === "loading" &&  React.createElement(Spinner, null), status === "error" &&  React.createElement(LinkColumn, { onClick: reloadErrored },  React.createElement(CircledX, null),  React.createElement("p", null, strings.failedToLoadImage),  React.createElement("p", null, pageState.urls?.join("\n"))), videoProps &&  React.createElement(Video, { ...videoProps, originalSize: shouldBeOriginalSize, ...props }), imageProps &&  React.createElement(Image, { ...imageProps, originalSize: shouldBeOriginalSize, ...props }));
};
var import_overlayscrollbars_react = require("overlayscrollbars-react");
GM.getResourceText("overlayscrollbars-css").then(insertCss);
function InnerViewer(props) {
  const { options: viewerOptions, onInitialized, ...otherProps } = props;
  const isFullscreen = (0, import_jotai.useAtomValue)(viewerFullscreenAtom);
  const backgroundColor = (0, import_jotai.useAtomValue)(backgroundColorAtom);
  const viewer = (0, import_jotai.useAtomValue)(viewerStateAtom);
  const setViewerOptions = (0, import_jotai.useSetAtom)(setViewerOptionsAtom);
  const pageDirection = (0, import_jotai.useAtomValue)(pageDirectionAtom);
  const strings = (0, import_jotai.useAtomValue)(i18nAtom);
  const mode = (0, import_jotai.useAtomValue)(viewerModeAtom);
  const controller = (0, import_jotai.useAtomValue)(controllerCreationAtom);
  const virtualContainerRef = (0, import_react3.useRef)(null);
  const virtualContainer = virtualContainerRef.current;
  const setScrollElement = (0, import_jotai.useSetAtom)(setScrollElementAtom);
  const options = controller?.options;
  const { status } = viewer;
  const pageAtoms = (0, import_jotai.useAtomValue)(pageAtomsAtom);
  const [initialize2] = (0, import_overlayscrollbars_react.useOverlayScrollbars)({
    defer: true,
    events: { scroll: (0, import_jotai.useSetAtom)(synchronizeScrollAtom), initialized: setupScroll }
  });
  (0, import_jotai.useAtomValue)(fullscreenSynchronizationAtom);
  useBeforeRepaint();
  async function setupScroll() {
    const selector = "div[data-overlayscrollbars-viewport]";
    await setScrollElement(virtualContainerRef.current?.querySelector(selector));
  }
  (0, import_react3.useEffect)(() => {
    if (controller) {
      onInitialized?.(controller);
    }
  }, [controller, onInitialized]);
  (0, import_react3.useEffect)(() => {
    setViewerOptions(viewerOptions);
  }, [viewerOptions]);
  (0, import_react3.useEffect)(() => {
    if (virtualContainer) {
      initialize2(virtualContainer);
    }
  }, [initialize2, virtualContainer]);
  return  React.createElement(
    Container,
    {
      ref: (0, import_jotai.useSetAtom)(setViewerElementAtom),
      css: { backgroundColor },
      immersive: mode === "window"
    },
     React.createElement(
      OverlayScroller,
      {
        tabIndex: 0,
        ref: virtualContainerRef,
        fullscreen: isFullscreen,
        onClick: (0, import_jotai.useSetAtom)(navigateAtom),
        onMouseDown: (0, import_jotai.useSetAtom)(blockSelectionAtom),
        ...otherProps
      },
       React.createElement(Pages, { ltr: pageDirection === "leftToRight" }, status === "complete" ? pageAtoms.map((atom3) =>  React.createElement(
        Page,
        {
          key: `${atom3}`,
          atom: atom3,
          ...options?.mediaProps
        }
      )) :  React.createElement("p", null, status === "error" ? strings.errorIsOccurred : strings.loading))
    ),
    status === "complete" ?  React.createElement(LeftBottomControl, null) : false,
     React.createElement(FullscreenButton, { onClick: (0, import_jotai.useSetAtom)(toggleImmersiveAtom) }),
     React.createElement(import_react_toastify.ToastContainer, null)
  );
}
var Pages = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexFlow: "row-reverse wrap",
  overflowY: "auto",
  variants: {
    ltr: {
      true: {
        flexFlow: "row wrap"
      }
    }
  }
});
function initialize(options) {
  const store = (0, import_jotai.createStore)();
  const root = (0, import_react_dom.createRoot)(getDefaultRoot());
  store.set(rootAtom, root);
  return new Promise(
    (resolve) => root.render(
       React.createElement(import_jotai.Provider, { store },  React.createElement(InnerViewer, { options, onInitialized: resolve }))
    )
  );
}
var Viewer = (0, import_react3.forwardRef)(({ options, onInitialized }) => {
  const store = (0, import_react3.useMemo)(import_jotai.createStore, []);
  return  React.createElement(import_jotai.Provider, { store },  React.createElement(InnerViewer, { options, onInitialized }));
});
function getDefaultRoot() {
  const div = document.createElement("div");
  div.setAttribute("style", "width: 0; height: 0; z-index: 9999999; position: fixed;");
  document.body.append(div);
  return div;
}
