// ==UserScript==
// @name         vim comic viewer
// @description  Universal comic reader
// @version      3.0.0
// @namespace    https://greasyfork.org/en/users/713014-nanikit
// @exclude      *
// @match        http://unused-field.space/
// @author       nanikit
// @license      MIT
// ==/UserScript==

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var react = require("@stitches/react");
var react$1 = require("react");
var reactDom = require("react-dom");

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  else {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== "default") {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(
            n,
            k,
            d.get ? d : {
              enumerable: true,
              get: function () {
                return e[k];
              },
            },
          );
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }
}

const { styled, css } = react.createStyled({});

const ScrollableLayout = styled("div", {
  backgroundColor: "#eee",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexFlow: "row-reverse wrap",
  overflowY: "auto",
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

const defer = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve,
    reject,
  };
};
const useDeferred = () => {
  const [deferred] = react$1.useState(defer);
  return deferred;
};

const useFullscreenElement = () => {
  const [element, setElement] = react$1.useState(
    document.fullscreenElement || undefined,
  );
  react$1.useEffect(() => {
    const notify = () => setElement(document.fullscreenElement || undefined);
    document.addEventListener("fullscreenchange", notify);
    return () => document.removeEventListener("fullscreenchange", notify);
  }, []);
  return element;
};

const useIntersectionObserver = (callback, options) => {
  const [observer, setObserver] = react$1.useState();
  react$1.useEffect(() => {
    const newObserver = new IntersectionObserver(callback, options);
    setObserver(newObserver);
    return () => newObserver.disconnect();
  }, [
    callback,
    options,
  ]);
  return observer;
};
const useIntersection = (callback, options) => {
  const memo = react$1.useRef(new Map());
  const filterIntersections = react$1.useCallback((newEntries) => {
    const memoized = memo.current;
    for (const entry of newEntries) {
      if (entry.isIntersecting) {
        memoized.set(entry.target, entry);
      } else {
        memoized.delete(entry.target);
      }
    }
    callback([
      ...memoized.values(),
    ]);
  }, [
    callback,
  ]);
  return useIntersectionObserver(filterIntersections, options);
};

const useResize = (target, transformer) => {
  const [value, setValue] = react$1.useState(() => transformer(undefined));
  const callbackRef = react$1.useRef(transformer);
  callbackRef.current = transformer;
  react$1.useEffect(() => {
    if (!target) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      setValue(callbackRef.current(entries[0]));
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [
    target,
    callbackRef,
  ]);
  return value;
};
const getCurrentPage = (container, entries) => {
  if (!entries.length) {
    return container.firstElementChild || undefined;
  }
  const children = [
    ...container.children,
  ];
  const fullyVisibles = entries.filter((x) => x.intersectionRatio === 1);
  if (fullyVisibles.length) {
    fullyVisibles.sort((a, b) => {
      return children.indexOf(a.target) - children.indexOf(b.target);
    });
    return fullyVisibles[Math.floor(fullyVisibles.length / 2)].target;
  }
  return entries.sort((a, b) => {
    const ratio = {
      a: a.intersectionRatio,
      b: b.intersectionRatio,
    };
    const index = {
      a: children.indexOf(a.target),
      b: children.indexOf(b.target),
    };
    return (ratio.b - ratio.a) * 10000 + (index.a - index.b);
  })[0].target;
};
const usePageNavigator = (container) => {
  const [anchor, setAnchor] = react$1.useState({
    currentPage: undefined,
    ratio: 0.5,
  });
  const { currentPage, ratio } = anchor;
  const ignoreIntersection = react$1.useRef(false);
  const resetAnchor = react$1.useCallback((entries) => {
    if (!container?.clientHeight || entries.length === 0) {
      return;
    }
    if (ignoreIntersection.current) {
      ignoreIntersection.current = false;
      return;
    }
    const page = getCurrentPage(container, entries);
    const y = container.scrollTop + container.clientHeight / 2;
    const newRatio = (y - page.offsetTop) / page.clientHeight;
    const newAnchor = {
      currentPage: page,
      ratio: newRatio,
    };
    setAnchor(newAnchor);
  }, [
    container,
  ]);
  const goNext = react$1.useCallback(() => {
    ignoreIntersection.current = false;
    if (!currentPage) {
      return;
    }
    const originBound = currentPage.getBoundingClientRect();
    let cursor = currentPage;
    while (cursor.nextElementSibling) {
      const next = cursor.nextElementSibling;
      const nextBound = next.getBoundingClientRect();
      if (originBound.bottom < nextBound.top) {
        next.scrollIntoView({
          block: "center",
        });
        break;
      }
      cursor = next;
    }
  }, [
    currentPage,
  ]);
  const goPrevious = react$1.useCallback(() => {
    ignoreIntersection.current = false;
    if (!currentPage) {
      return;
    }
    const originBound = currentPage.getBoundingClientRect();
    let cursor = currentPage;
    while (cursor.previousElementSibling) {
      const previous = cursor.previousElementSibling;
      const previousBound = previous.getBoundingClientRect();
      if (previousBound.bottom < originBound.top) {
        previous.scrollIntoView({
          block: "center",
        });
        break;
      }
      cursor = previous;
    }
  }, [
    currentPage,
  ]);
  const restoreScroll = react$1.useCallback(() => {
    if (!container || ratio === undefined || currentPage === undefined) {
      return;
    }
    const restoredY = currentPage.offsetTop +
      currentPage.clientHeight * (ratio - 0.5);
    container.scroll({
      top: restoredY,
    });
    ignoreIntersection.current = true;
  }, [
    container,
    currentPage,
    ratio,
  ]);
  const intersectionOption = react$1.useMemo(() => ({
    threshold: [
      0.01,
      0.5,
      1,
    ],
  }), []);
  const observer = useIntersection(resetAnchor, intersectionOption);
  useResize(container, restoreScroll);
  return react$1.useMemo(() => ({
    goNext,
    goPrevious,
    observer,
  }), [
    goNext,
    goPrevious,
    observer,
  ]);
};

const download = async (images, deferred) => {
  const { default: jszip } = await Promise.resolve().then(function () {
    return /*#__PURE__*/ _interopNamespace(require("jszip"));
  });
  const aborter = new AbortController();
  const downloadFile = async (url) => {
    const response = await fetch(url, {
      signal: aborter.signal,
    });
    const blob = await response.blob();
    return {
      url,
      blob,
    };
  };
  const downloadImage = async (source) => {
    if (Array.isArray(source)) {
      for (const url of source) {
        try {
          return await downloadFile(url);
        } catch (error) {
          console.log(error);
        }
      }
      return {
        url: "",
        blob: new Blob([
          JSON.stringify(source),
        ]),
      };
    }
    try {
      return await downloadFile(source);
    } catch (error) {
      console.log(error);
      return {
        url: "",
        blob: new Blob([
          source,
        ]),
      };
    }
  };
  const cancellation = async () => {
    try {
      await deferred.promise;
    } catch {
      aborter.abort();
    }
    return Symbol();
  };
  const tasks = Promise.all(images.map(downloadImage));
  const result = await Promise.race([
    cancellation(),
    tasks,
  ]);
  if (typeof result === "symbol") {
    console.log("download cancelled");
    return;
  }
  const pad = (index) => `${index}`.padStart(cipher, "0");
  const cipher = Math.ceil(Math.log10(images.length)) + 1;
  const getName = (url, index) => {
    const path = new URL(url).pathname;
    const extension = path.substr(path.lastIndexOf("."));
    const name = `${pad(index)}${extension}`;
    return name;
  };
  const zip = jszip();
  for (let i = 0; i < result.length; i++) {
    const file = result[i];
    zip.file(getName(file.url, i), file.blob);
  }
  deferred.resolve(zip);
};

const stretch = css.keyframes({
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
const Spinner = () =>
  react$1.createElement(
    SpinnerContainer,
    null,
    react$1.createElement("div", null),
    react$1.createElement("div", null),
    react$1.createElement("div", null),
  );
const Overlay = styled("div", {
  position: "relative",
  maxWidth: "100%",
  height: "100%",
  variants: {
    placeholder: {
      true: {
        width: "45%",
      },
    },
  },
  margin: "4px 1px",
  "@media print": {
    margin: 0,
  },
});
const Image1 = styled("img", {
  position: "relative",
  height: "100%",
  objectFit: "contain",
});

const init = (source) => {
  if (typeof source === "string") {
    return {
      src: source,
      iterator: (function* () {
      })(),
    };
  }
  if (Array.isArray(source)) {
    return {
      src: source[0],
      iterator: (function* () {
        for (const url of source.slice(1)) {
          yield url;
        }
      })(),
    };
  }
  throw new Error("unknown image source");
};
const reducer = (state, action) => {
  if (action !== "next") {
    return init(action);
  }
  if (state.iterator == null) {
    return state;
  }
  const result = state.iterator.next();
  if (result.done === true) {
    return {};
  }
  return {
    ...state,
    src: result.value,
  };
};
const usePageReducer = (source) => {
  const [state, dispatch] = react$1.useReducer(reducer, source, init);
  const onError = react$1.useCallback(() => {
    dispatch("next");
  }, []);
  return {
    src: state.src,
    onError,
  };
};

const Page = ({ source, observer, ...props }) => {
  const [isLoaded, setLoaded] = react$1.useState(false);
  const { src, onError } = usePageReducer(source);
  const ref = react$1.useRef();
  const clearSpinner = react$1.useCallback(() => {
    setLoaded(true);
  }, []);
  react$1.useEffect(() => {
    const target = ref.current;
    if (target && observer) {
      observer.observe(target);
      return () => observer.unobserve(target);
    }
  }, [
    observer,
    ref.current,
  ]);
  return react$1.createElement(
    Overlay,
    {
      ref: ref,
      placeholder: !isLoaded,
    },
    react$1.createElement(Spinner, null),
    react$1.createElement(
      Image1,
      Object.assign({
        src: src,
        onLoad: clearSpinner,
        onError: onError,
      }, props),
    ),
  );
};

const Viewer_ = (props, refHandle) => {
  const [options, setOptions] = react$1.useState();
  const [images, setImages] = react$1.useState();
  const [status, setStatus] = react$1.useState("loading");
  const [hasDownload, setDownload] = react$1.useState();
  const ref = react$1.useRef();
  const navigator = usePageNavigator(ref.current);
  const fullscreenElement = useFullscreenElement();
  const { promise: refPromise, resolve: resolveRef } = useDeferred();
  const toggleFullscreen = react$1.useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await ref.current?.requestFullscreen?.();
    }
  }, []);
  const setSource = react$1.useCallback(async (source) => {
    try {
      setStatus("loading");
      setImages(await source());
      setStatus("complete");
    } catch (error) {
      setStatus("error");
      console.log(error);
      throw error;
    }
  }, []);
  const queueDownload = react$1.useCallback(() => {
    if (hasDownload) {
      hasDownload.reject(new Error("You requested another download"));
    }
    if (!images) {
      return;
    }
    const deferred = defer();
    setDownload(deferred);
    download(images, deferred);
    return deferred.promise;
  }, [
    images,
    hasDownload,
  ]);
  react$1.useImperativeHandle(refHandle, () => ({
    goNext: navigator.goNext,
    goPrevious: navigator.goPrevious,
    toggleFullscreen,
    refPromise,
    setOptions,
    download: queueDownload,
    unmount: () => ref.current && reactDom.unmountComponentAtNode(ref.current),
  }), [
    navigator.goNext,
    navigator.goPrevious,
    toggleFullscreen,
    refPromise,
    setSource,
    queueDownload,
  ]);
  react$1.useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current?.focus?.();
    resolveRef(ref.current);
  }, [
    ref.current,
  ]);
  react$1.useEffect(() => {
    if (ref.current && fullscreenElement === ref.current) {
      ref.current?.focus?.();
    }
  }, [
    ref.current,
    fullscreenElement,
  ]);
  react$1.useEffect(() => {
    setSource(options?.source || (() => []));
  }, [
    options?.source,
  ]);
  return react$1.createElement(
    ScrollableLayout,
    Object.assign({
      ref: ref,
      tabIndex: -1,
      className: "vim_comic_viewer",
      fullscreen: fullscreenElement === ref.current,
    }, props),
    status === "complete"
      ? images?.map?.((image, index) =>
        react$1.createElement(
          Page,
          Object.assign({
            key: index,
            source: image,
            observer: navigator.observer,
          }, options?.imageProps),
        )
      ) || false
      : react$1.createElement(
        "p",
        null,
        status === "error" ? "에러가 발생했습니다" : "로딩 중...",
      ),
  );
};
const Viewer = react$1.forwardRef(Viewer_);

const timeout = (millisecond) =>
  new Promise((resolve) => setTimeout(resolve, millisecond));
const waitDomContent = (document) =>
  document.readyState === "loading"
    ? new Promise((r) =>
      document.addEventListener("readystatechange", r, {
        once: true,
      })
    )
    : true;
const insertCss = (css) => {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.append(style);
};
const waitBody = async (document) => {
  while (!document.body) {
    await timeout(1);
  }
};
const isTyping = (event) =>
  event.target?.tagName?.match?.(/INPUT|TEXTAREA/) ||
  event.target?.isContentEditable;
const saveAs = async (blob, name) => {
  const a = document.createElement("a");
  a.download = name;
  a.rel = "noopener";
  a.href = URL.createObjectURL(blob);
  a.click();
  await timeout(40000);
  URL.revokeObjectURL(a.href);
};
const getSafeFileName = (str) => {
  return str.replace(/[<>:"/\\|?*\x00-\x1f]+/gi, "").trim() || "download";
};

var utils = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  timeout: timeout,
  waitDomContent: waitDomContent,
  insertCss: insertCss,
  waitBody: waitBody,
  isTyping: isTyping,
  saveAs: saveAs,
  getSafeFileName: getSafeFileName,
});

var types = /*#__PURE__*/ Object.freeze({
  __proto__: null,
});

/** @jsx createElement */
/// <reference lib="dom" />
const getDefaultRoot = async () => {
  const div = document.createElement("div");
  div.style.height = "100vh";
  await waitBody(document);
  document.body.append(div);
  return div;
};
const initialize = (root) => {
  const ref = react$1.createRef();
  reactDom.render(
    react$1.createElement(Viewer, {
      ref: ref,
    }),
    root,
  );
  return new Proxy(ref, {
    get: (target, ...args) => {
      return Reflect.get(target.current, ...args);
    },
  });
};
const maybeNotHotkey = (event) =>
  event.ctrlKey || event.shiftKey || event.altKey || isTyping(event);
const initializeWithDefault = async (source) => {
  const root = source.getRoot?.() || await getDefaultRoot();
  const controller = initialize(root);
  const defaultKeyHandler = async (event) => {
    if (maybeNotHotkey(event)) {
      return;
    }
    switch (event.key) {
      case "j":
        controller.goNext();
        break;
      case "k":
        controller.goPrevious();
        break;
      case ";": {
        const zip = await controller.download();
        if (!zip) {
          return;
        }
        const blob = await zip.generateAsync({
          type: "blob",
        });
        saveAs(blob, `${getSafeFileName(document.title)}.zip`);
        break;
      }
    }
  };
  const defaultGlobalKeyHandler = (event) => {
    if (maybeNotHotkey(event)) {
      return;
    }
    if (event.key === "i") {
      controller.toggleFullscreen();
    }
  };
  controller.setOptions({
    source: source.comicSource,
  });
  const div = await controller.refPromise;
  if (source.withController) {
    source.withController(controller, div);
  } else {
    div.addEventListener("keydown", defaultKeyHandler);
    window.addEventListener("keydown", defaultGlobalKeyHandler);
  }
  return controller;
};

exports.download = download;
exports.initialize = initialize;
exports.initializeWithDefault = initializeWithDefault;
exports.types = types;
exports.utils = utils;
