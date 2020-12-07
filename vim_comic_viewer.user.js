// ==UserScript==
// @name         vim comic viewer
// @description  Universal comic reader
// @version      1.3.0
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
  react.useEffect(() => {
    if (!target) {
      return;
    }
    const observer = new ResizeObserver((entries) =>
      setValue(transformer(entries[0]))
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [
    target,
  ]);
  return value;
};
const useScroll = (container, transformer) => {
  const [value, setValue] = react.useState(() => transformer(undefined));
  react.useEffect(() => {
    if (!container) {
      return;
    }
    const callback = (event) => {
      setValue(transformer(event));
    };
    container.addEventListener("scroll", callback);
    return () => container.removeEventListener("scroll", callback);
  }, [
    container,
    transformer,
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
      0.001,
      0.5,
      1,
    ],
  }), []);
  const { entries, observer } = useIntersection(intersectionOption);
  const getAnchor = react.useCallback(() => {
    if (!container) {
      return {
        currentPage: undefined,
        ratio: 0.5,
      };
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
  useScroll(container, resetAnchor);
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

const Image = styled("img", {
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
    Image,
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
});
const Viewer = ({ source, ...props }) => {
  const [images, setImages] = react.useState();
  const [status, setStatus] = react.useState("loading");
  const ref = react.useRef();
  const navigator = usePageNavigator(ref.current);
  const fullscreenElement = useFullscreenElement();
  const handleNavigation = react.useCallback((event) => {
    switch (event.key) {
      case "j":
        navigator.goNext();
        break;
      case "k":
        navigator.goPrevious();
        break;
    }
  }, [
    navigator,
  ]);
  const fetchSource = react.useCallback(async () => {
    try {
      setImages(await source());
      setStatus("complete");
    } catch (error) {
      setStatus("error");
      console.log(error);
      throw error;
    }
  }, [
    source,
  ]);
  react.useEffect(() => {
    const globalKeyHandler = async (event) => {
      if (event.key === "i") {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await ref?.current?.requestFullscreen?.();
        }
      }
    };
    window.addEventListener("keydown", globalKeyHandler);
    return () => window.removeEventListener("keydown", globalKeyHandler);
  }, [
    navigator,
    ref.current,
  ]);
  react.useEffect(() => {
    ref.current?.focus?.();
  }, [
    ref.current,
  ]);
  react.useEffect(() => {
    if (!ref.current) {
      return;
    }
    const style = ref.current.style;
    const fullscreenStyle = {
      display: "flex",
      position: "fixed",
      top: 0,
      bottom: 0,
      overflow: "auto",
    };
    if (fullscreenElement && style.position !== "fixed") {
      Object.assign(style, fullscreenStyle);
      // navigator.restore();
      ref.current.focus();
    } else if (!fullscreenElement && style.position === "fixed") {
      for (const property of Object.keys(fullscreenStyle)) {
        style.removeProperty(property);
      }
    }
  }, [
    ref.current,
    fullscreenElement,
    navigator,
  ]);
  react.useEffect(() => {
    fetchSource();
  }, [
    fetchSource,
  ]);
  return react.createElement(
    ImageContainer,
    Object.assign({
      ref: ref,
      className: "vim_comic_viewer",
      tabIndex: -1,
      onKeyDown: handleNavigation,
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

var utils = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  timeout: timeout,
  waitDomContent: waitDomContent,
  insertCss: insertCss,
});

var types = /*#__PURE__*/ Object.freeze({
  __proto__: null,
});

/** @jsx createElement */
/// <reference lib="dom" />
const getDefaultRoot = () => {
  const div = document.createElement("div");
  div.style.height = "100vh";
  return div;
};
const initializeWithSource = async (source) => {
  const root = source?.getRoot?.() || getDefaultRoot();
  while (true) {
    if (document.body) {
      document.body.append(root);
      reactDom.render(
        react.createElement(Viewer, {
          source: source.comicSource,
        }),
        root,
      );
      break;
    }
    await timeout(1);
  }
};
const initialize = async (sourceOrSources) => {
  if (Array.isArray(sourceOrSources)) {
    const source = sourceOrSources.find((x) => x.isApplicable());
    if (source) {
      await initializeWithSource(source);
    }
  } else {
    await initializeWithSource(sourceOrSources);
  }
};

exports.initialize = initialize;
exports.types = types;
exports.utils = utils;
