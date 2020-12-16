// ==UserScript==
// @name         vim comic viewer
// @description  Universal comic reader
// @version      2.0.0
// @namespace    https://greasyfork.org/en/users/713014-nanikit
// @exclude      *
// @match        http://unused-field.space/
// @author       nanikit
// @license      MIT
// ==/UserScript==

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var react = require("react");
var react$1 = require("@stitches/react");
var reactDom = require("react-dom");

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
  const [deferred] = react.useState(defer);
  return deferred;
};

const useFullscreenElement = () => {
  const [element, setElement] = react.useState(
    document.fullscreenElement || undefined,
  );
  react.useEffect(() => {
    const notify = () => setElement(document.fullscreenElement || undefined);
    document.addEventListener("fullscreenchange", notify);
    return () => document.removeEventListener("fullscreenchange", notify);
  }, []);
  return element;
};

const useIntersectionObserver = (callback, options) => {
  const [observer, setObserver] = react.useState();
  react.useEffect(() => {
    const newObserver = new IntersectionObserver(callback, options);
    setObserver(newObserver);
    return () => newObserver.disconnect();
  }, [
    callback,
    options,
  ]);
  return observer;
};
const useIntersection = (options) => {
  const [entries, setEntries] = react.useState([]);
  const memo = react.useRef(new Map());
  const recordIntersection = react.useCallback((newEntries) => {
    const memoized = memo.current;
    for (const entry of newEntries) {
      if (entry.isIntersecting) {
        memoized.set(entry.target, entry);
      } else {
        memoized.delete(entry.target);
      }
    }
    setEntries([
      ...memoized.values(),
    ]);
  }, []);
  const observer = useIntersectionObserver(recordIntersection, options);
  return {
    entries,
    observer,
  };
};

const useResize = (target, transformer) => {
  const [value, setValue] = react.useState(() => transformer(undefined));
  const callbackRef = react.useRef(transformer);
  callbackRef.current = transformer;
  react.useEffect(() => {
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
  const [anchor, setAnchor] = react.useState({
    currentPage: undefined,
    ratio: 0.5,
  });
  const intersectionOption = react.useMemo(() => ({
    threshold: [
      0.01,
      0.5,
      1,
    ],
  }), []);
  const { entries, observer } = useIntersection(intersectionOption);
  const getAnchor = react.useCallback(() => {
    if (!container || entries.length === 0) {
      return anchor;
    }
    const page = getCurrentPage(container, entries);
    const y = container.scrollTop + container.clientHeight / 2;
    const newRatio = (y - page.offsetTop) / page.clientHeight;
    const newAnchor = {
      currentPage: page,
      ratio: newRatio,
    };
    return newAnchor;
  }, [
    anchor,
    container,
    entries,
  ]);
  const resetAnchor = react.useCallback(() => {
    setAnchor(getAnchor());
  }, [
    getAnchor,
  ]);
  const { currentPage, ratio } = anchor;
  const goNext = react.useCallback(() => {
    let cursor = currentPage || getAnchor().currentPage;
    if (!cursor) {
      return;
    }
    const originBound = cursor.getBoundingClientRect();
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
    getAnchor,
  ]);
  const goPrevious = react.useCallback(() => {
    let cursor = currentPage || getAnchor().currentPage;
    if (!cursor) {
      return;
    }
    const originBound = cursor.getBoundingClientRect();
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
    getAnchor,
  ]);
  const restoreScroll = react.useCallback(() => {
    if (!container || ratio === undefined || currentPage === undefined) {
      return;
    }
    const restoredY = currentPage.offsetTop +
      currentPage.clientHeight * (ratio - 0.5);
    container.scroll({
      top: restoredY,
    });
  }, [
    container,
    currentPage,
    ratio,
  ]);
  useResize(container, restoreScroll);
  react.useEffect(resetAnchor, [
    entries,
  ]);
  return react.useMemo(() => ({
    goNext,
    goPrevious,
    observer,
  }), [
    goNext,
    goPrevious,
    observer,
  ]);
};

const { styled, css } = react$1.createStyled({});

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
  const [state, dispatch] = react.useReducer(reducer, source, init);
  const onError = react.useCallback(() => {
    dispatch("next");
  }, []);
  return {
    src: state.src,
    onError,
  };
};

const Image1 = styled("img", {
  height: "100%",
  maxWidth: "100%",
  objectFit: "contain",
  margin: "4px 1px",
  "@media print": {
    margin: 0,
  },
});
const Page = ({ source, observer, ...props }) => {
  const { src, onError } = usePageReducer(source);
  const ref = react.useRef();
  react.useEffect(() => {
    const target = ref.current;
    if (target && observer) {
      observer.observe(target);
      return () => observer.unobserve(target);
    }
  }, [
    observer,
    ref.current,
  ]);
  return react.createElement(
    Image1,
    Object.assign({
      ref: ref,
      src: src,
      onError: onError,
      loading: "lazy",
    }, props),
  );
};

const ImageContainer = styled("div", {
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
const Viewer_ = (props, handleRef) => {
  const [images, setImages] = react.useState();
  const [status, setStatus] = react.useState("loading");
  const ref = react.useRef();
  const navigator = usePageNavigator(ref.current);
  const fullscreenElement = useFullscreenElement();
  const { promise: refPromise, resolve: resolveRef } = useDeferred();
  const toggleFullscreen = react.useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await ref.current?.requestFullscreen?.();
    }
  }, []);
  const setSource = react.useCallback(async (source) => {
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
  react.useImperativeHandle(handleRef, () => ({
    goNext: navigator.goNext,
    goPrevious: navigator.goPrevious,
    toggleFullscreen,
    refPromise,
    setSource,
  }), [
    navigator.goNext,
    navigator.goPrevious,
    toggleFullscreen,
    refPromise,
    setSource,
  ]);
  react.useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current?.focus?.();
    resolveRef(ref.current);
  }, [
    ref.current,
  ]);
  react.useEffect(() => {
    if (ref.current && fullscreenElement === ref.current) {
      ref.current?.focus?.();
    }
  }, [
    ref.current,
    fullscreenElement,
  ]);
  return react.createElement(
    ImageContainer,
    Object.assign({
      ref: ref,
      tabIndex: -1,
      className: "vim_comic_viewer",
      fullscreen: fullscreenElement === ref.current,
    }, props),
    status === "complete"
      ? images?.map?.((image, index) =>
        react.createElement(Page, {
          key: index,
          source: image,
          observer: navigator.observer,
        })
      ) || false
      : react.createElement(
        "p",
        null,
        status === "error" ? "에러가 발생했습니다" : "로딩 중...",
      ),
  );
};
const Viewer = react.forwardRef(Viewer_);

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

var utils = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  timeout: timeout,
  waitDomContent: waitDomContent,
  insertCss: insertCss,
  waitBody: waitBody,
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
  const ref = react.createRef();
  reactDom.render(
    react.createElement(Viewer, {
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
const isModifierPressing = (event) =>
  event.ctrlKey || event.shiftKey || event.altKey;
const initializeWithDefault = async (source) => {
  const root = source.getRoot?.() || await getDefaultRoot();
  const controller = initialize(root);
  controller.setSource(source.comicSource);
  const div = await controller.refPromise;
  if (source.withController) {
    source.withController(controller, div);
  } else {
    div.addEventListener("keydown", (event) => {
      if (isModifierPressing(event)) {
        return;
      }
      switch (event.key) {
        case "j":
          controller.goNext();
          break;
        case "k":
          controller.goPrevious();
          break;
      }
    });
    window.addEventListener("keydown", (event) => {
      if (isModifierPressing(event)) {
        return;
      }
      if (event.key === "i") {
        controller.toggleFullscreen();
      }
    });
  }
  return controller;
};

exports.initialize = initialize;
exports.initializeWithDefault = initializeWithDefault;
exports.types = types;
exports.utils = utils;
