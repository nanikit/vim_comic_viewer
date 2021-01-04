// ==UserScript==
// @name         vim comic viewer
// @description  Universal comic reader
// @version      3.1.0
// @namespace    https://greasyfork.org/en/users/713014-nanikit
// @exclude      *
// @match        http://unused-field.space/
// @author       nanikit
// @license      MIT
// ==/UserScript==

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var react$1 = require("react");
var react = require("@stitches/react");
var JSZip = require("jszip");
var reactDom = require("react-dom");

function _interopDefaultLegacy(e) {
  return e && typeof e === "object" && "default" in e ? e : { "default": e };
}

var JSZip__default = /*#__PURE__*/ _interopDefaultLegacy(JSZip);

const { styled, css } = react.createStyled({});

const Svg = styled("svg", {
  position: "fixed",
  top: "8px",
  right: "8px",
  cursor: "pointer",
  ":hover": {
    filter: "hue-rotate(-145deg)",
  },
  variants: {
    error: {
      true: {
        filter: "hue-rotate(140deg)",
      },
    },
  },
});
const Circle = styled("circle", {
  transition: "stroke-dashoffset 0.35s",
  transform: "rotate(-90deg)",
  transformOrigin: "50% 50%",
  stroke: "url(#aEObn)",
  fill: "#fff8",
});
const GradientDef = react$1.createElement(
  "defs",
  null,
  react$1.createElement(
    "linearGradient",
    {
      id: "aEObn",
      x1: "100%",
      y1: "0%",
      x2: "0%",
      y2: "100%",
    },
    react$1.createElement("stop", {
      offset: "0%",
      style: {
        stopColor: "#53baff",
        stopOpacity: 1,
      },
    }),
    react$1.createElement("stop", {
      offset: "100%",
      style: {
        stopColor: "#0067bb",
        stopOpacity: 1,
      },
    }),
  ),
);
const CenterText = styled("text", {
  dominantBaseline: "middle",
  textAnchor: "middle",
  fontSize: "30px",
  fontWeight: "bold",
  fill: "#004b9e",
});
const CircularProgress = (props) => {
  const { radius, strokeWidth, value, text, ...otherProps } = props;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - value * circumference;
  const center = radius + strokeWidth / 2;
  const side = center * 2;
  return react$1.createElement(
    Svg,
    Object.assign({
      height: side,
      width: side,
    }, otherProps),
    GradientDef,
    react$1.createElement(
      Circle,
      Object.assign({}, {
        strokeWidth,
        strokeDasharray: `${circumference} ${circumference}`,
        strokeDashoffset,
        r: radius,
        cx: center,
        cy: center,
      }),
    ),
    react$1.createElement(CenterText, {
      x: "50%",
      y: "50%",
    }, text || ""),
  );
};

const ScrollableLayout = styled("div", {
  // chrome user-agent style override
  outline: 0,
  position: "relative",
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

var utils = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  timeout: timeout,
  waitDomContent: waitDomContent,
  insertCss: insertCss,
  waitBody: waitBody,
  isTyping: isTyping,
  saveAs: saveAs,
  getSafeFileName: getSafeFileName,
  defer: defer,
});

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

const GM_xmlhttpRequest = module.config().GM_xmlhttpRequest;

const fetchBlob = async (url, init) => {
  try {
    const response = await fetch(url, init);
    return await response.blob();
  } catch (error) {
    const isOriginDifferent = new URL(url).origin !== location.origin;
    if (isOriginDifferent && gmFetch) {
      return await gmFetch(url, init).blob();
    } else {
      throw error;
    }
  }
};
const GMxhr = GM_xmlhttpRequest;
const gmFetch = GMxhr
  ? (resource, init) => {
    const method = init?.body ? "POST" : "GET";
    const xhr = (type) => {
      return new Promise((resolve, reject) => {
        const request = GMxhr({
          method,
          url: resource,
          headers: init?.headers,
          responseType: type === "text" ? undefined : type,
          data: init?.body,
          onload: (response) => {
            if (type === "text") {
              resolve(response.responseText);
            } else {
              resolve(response.response);
            }
          },
          onerror: reject,
          onabort: reject,
        });
        if (init?.signal) {
          init.signal.addEventListener("abort", () => {
            request.abort();
          });
        }
      });
    };
    return {
      blob: () => xhr("blob"),
      json: () => xhr("json"),
      text: () => xhr("text"),
    };
  }
  : undefined;

const imageSourceToIterable = (source) => {
  if (typeof source === "string") {
    return (async function* () {
      yield source;
    })();
  } else if (Array.isArray(source)) {
    return (async function* () {
      for (const url of source) {
        yield url;
      }
    })();
  } else {
    return source();
  }
};
const transformToBlobUrl = (source) =>
  async () => {
    const imageSources = await source();
    return imageSources.map((imageSource) =>
      async function* () {
        for await (const url of imageSourceToIterable(imageSource)) {
          try {
            const blob = await fetchBlob(url);
            yield URL.createObjectURL(blob);
          } catch (error) {
            console.log(error);
          }
        }
      }
    );
  };

const download = async (images, options) => {
  const { onError, onProgress } = options || {};
  const aborter = new AbortController();
  let resolvedCount = 0;
  let rejectedCount = 0;
  let zipPercent = 0;
  let cancelled = false;
  const reportProgress = () => {
    const total = images.length;
    const settled = resolvedCount + rejectedCount;
    onProgress?.({
      total,
      settled,
      rejected: rejectedCount,
      cancelled,
      zipPercent,
    });
  };
  const downloadImage = async (source) => {
    const errors = [];
    for await (const url of imageSourceToIterable(source)) {
      try {
        const blob = await fetchBlob(url);
        resolvedCount++;
        reportProgress();
        return {
          url,
          blob,
        };
      } catch (error) {
        errors.push(error);
        onError?.(error);
      }
    }
    rejectedCount++;
    reportProgress();
    return {
      url: "",
      blob: new Blob([
        errors.map((x) => x.toString()).join("\n\n"),
      ]),
    };
  };
  const deferred = defer();
  const tasks = images.map(downloadImage);
  reportProgress();
  const archive = async () => {
    const cancellation = async () => {
      if (await deferred.promise === undefined) {
        aborter.abort();
      }
      return Symbol();
    };
    const checkout = Promise.all(tasks);
    const result = await Promise.race([
      cancellation(),
      checkout,
    ]);
    if (typeof result === "symbol") {
      cancelled = true;
      reportProgress();
      return;
    }
    const cipher = Math.floor(Math.log10(tasks.length)) + 1;
    const getExtension = (url) => {
      if (!url) {
        return ".txt";
      }
      const extension = url.match(/\.[^/?#]{3,4}?(?=[?#]|$)/);
      return extension || ".jpg";
    };
    const getName = (url, index) => {
      const pad = `${index}`.padStart(cipher, "0");
      const name = `${pad}${getExtension(url)}`;
      return name;
    };
    const zip = JSZip__default["default"]();
    for (let i = 0; i < result.length; i++) {
      const file = result[i];
      zip.file(getName(file.url, i), file.blob);
    }
    const proxy = new Proxy(zip, {
      get: (target, property, receiver) => {
        const ret = Reflect.get(target, property, receiver);
        if (property !== "generateAsync") {
          return ret;
        }
        return (options, onUpdate) =>
          ret.bind(target)(options, (metadata) => {
            zipPercent = metadata.percent;
            reportProgress();
            onUpdate?.(metadata);
          });
      },
    });
    deferred.resolve(proxy);
  };
  archive();
  return {
    zip: deferred.promise,
    cancel: () => deferred.resolve(undefined),
  };
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

var ActionType;
(function (ActionType) {
  ActionType[ActionType["GoPrevious"] = 0] = "GoPrevious";
  ActionType[ActionType["GoNext"] = 1] = "GoNext";
  ActionType[ActionType["ToggleFullscreen"] = 2] = "ToggleFullscreen";
  ActionType[ActionType["Unmount"] = 3] = "Unmount";
  ActionType[ActionType["SetState"] = 4] = "SetState";
  ActionType[ActionType["Download"] = 5] = "Download";
})(ActionType || (ActionType = {}));
const reducer = (state, action) => {
  switch (action.type) {
    case ActionType.SetState:
      return {
        ...state,
        ...action.state,
      };
    case ActionType.GoPrevious:
      state.navigator.goPrevious();
      break;
    case ActionType.GoNext:
      state.navigator.goNext();
      break;
    case ActionType.ToggleFullscreen:
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        state.ref.current?.requestFullscreen?.();
      }
      break;
    case ActionType.Unmount:
      if (state.ref.current) {
        reactDom.unmountComponentAtNode(state.ref.current);
      }
      break;
    default:
      debugger;
      break;
  }
  return state;
};
const getAsyncReducer = (dispatch) => {
  let images = [];
  let cancelDownload;
  const setInnerState = (state) => {
    dispatch({
      type: ActionType.SetState,
      state,
    });
  };
  const setState = async (state) => {
    const source = state.options?.source;
    if (source) {
      try {
        setInnerState({
          status: "loading",
          images: [],
        });
        images = await source();
        if (!Array.isArray(images)) {
          console.log(`Invalid comic source type: ${typeof images}`);
          setInnerState({
            status: "error",
          });
          return;
        }
        setInnerState({
          status: "complete",
          images,
        });
      } catch (error) {
        setInnerState({
          status: "error",
        });
        console.log(error);
        throw error;
      }
    } else {
      setInnerState(state);
    }
  };
  const clearCancel = () => {
    setInnerState({
      cancelDownload: undefined,
    });
    cancelDownload = undefined;
  };
  const startDownload = async (options) => {
    if (cancelDownload) {
      cancelDownload();
      clearCancel();
      return;
    }
    if (!images.length) {
      return;
    }
    const { zip, cancel } = await download(images, options);
    cancelDownload = () => {
      cancel();
      clearCancel();
    };
    setInnerState({
      cancelDownload,
    });
    const result = await zip;
    clearCancel();
    return result;
  };
  return (action) => {
    switch (action.type) {
      case ActionType.Download:
        return startDownload(action.options);
      case ActionType.SetState:
        return setState(action.state);
      default:
        return dispatch(action);
    }
  };
};
const useViewerReducer = (ref) => {
  const navigator = usePageNavigator(ref.current);
  const [state, dispatch] = react$1.useReducer(reducer, {
    ref,
    navigator,
    options: {},
    images: [],
    status: "loading",
  });
  const [asyncDispatch] = react$1.useState(() => getAsyncReducer(dispatch));
  react$1.useEffect(() => {
    dispatch({
      type: ActionType.SetState,
      state: {
        navigator,
      },
    });
  }, [
    navigator,
  ]);
  return [
    state,
    asyncDispatch,
  ];
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
  maxWidth: "100%",
});

var PageActionType;
(function (PageActionType) {
  PageActionType[PageActionType["SetState"] = 0] = "SetState";
  PageActionType[PageActionType["SetSource"] = 1] = "SetSource";
  PageActionType[PageActionType["Fallback"] = 2] = "Fallback";
})(PageActionType || (PageActionType = {}));
const reducer$1 = (state, action) => {
  switch (action.type) {
    case PageActionType.SetState:
      return {
        ...state,
        ...action.state,
      };
    default:
      debugger;
      return state;
  }
};
const getAsyncReducer$1 = (dispatch) => {
  const empty = async function* () {
  }();
  let iterator = empty;
  const setState = (state) => {
    dispatch({
      type: PageActionType.SetState,
      state,
    });
  };
  const takeNext = async () => {
    const snapshot = iterator;
    try {
      const item = await snapshot.next();
      if (snapshot !== iterator) {
        return;
      }
      if (item.done) {
        setState({
          src: undefined,
          status: "error",
        });
      } else {
        setState({
          src: item.value,
          status: "loading",
        });
      }
    } catch (error) {
      console.error(error);
      setState({
        src: undefined,
        status: "error",
      });
    }
  };
  const setSource = async (source) => {
    iterator = imageSourceToIterable(source)[Symbol.asyncIterator]();
    await takeNext();
  };
  return (action) => {
    switch (action.type) {
      case PageActionType.SetSource:
        return setSource(action.source);
      case PageActionType.Fallback:
        return takeNext();
      default:
        return dispatch(action);
    }
  };
};
const usePageReducer = (source) => {
  const [state, dispatch] = react$1.useReducer(reducer$1, {
    status: "loading",
  });
  const [asyncDispatch] = react$1.useState(() => getAsyncReducer$1(dispatch));
  const onError = react$1.useCallback(() => {
    asyncDispatch({
      type: PageActionType.Fallback,
    });
  }, []);
  const onLoad = react$1.useCallback(() => {
    asyncDispatch({
      type: PageActionType.SetState,
      state: {
        status: "complete",
      },
    });
  }, []);
  react$1.useEffect(() => {
    asyncDispatch({
      type: PageActionType.SetSource,
      source,
    });
  }, [
    source,
  ]);
  return [
    {
      ...state,
      onLoad,
      onError,
    },
    asyncDispatch,
  ];
};

const Page = ({ source, observer, ...props }) => {
  const [{ status, src, ...imageProps }] = usePageReducer(source);
  const ref = react$1.useRef();
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
      placeholder: status === "loading",
    },
    status === "loading" && react$1.createElement(Spinner, null),
    react$1.createElement(
      Image1,
      Object.assign(
        {},
        src
          ? {
            src,
          }
          : {},
        imageProps,
        props,
      ),
    ),
  );
};

const Viewer_ = (props, refHandle) => {
  const ref = react$1.useRef();
  const fullscreenElement = useFullscreenElement();
  const { promise: refPromise, resolve: resolveRef } = useDeferred();
  const [{ options, images, navigator, status, cancelDownload }, dispatch] =
    useViewerReducer(ref);
  const [{ value, text, error }, setProgress] = react$1.useState({
    value: 0,
    text: "",
    error: false,
  });
  const cache = {
    text: "",
  };
  const reportProgress = react$1.useCallback((event) => {
    const value = event.settled / images.length * 0.9 +
      event.zipPercent * 0.001;
    const text = `${(value * 100).toFixed(1)}%`;
    const error = !!event.rejected;
    if (value === 1 && !error || event.cancelled) {
      setProgress({
        value: 0,
        text: "",
        error: false,
      });
    } else if (text !== cache.text) {
      cache.text = text;
      setProgress({
        value,
        text,
        error,
      });
    }
  }, [
    images.length,
  ]);
  const navigate = react$1.useCallback((event) => {
    const height = ref.current?.clientHeight;
    if (!height || event.button !== 0) {
      return;
    }
    event.preventDefault();
    window.getSelection()?.empty?.();
    const isTop = event.clientY < height / 2;
    if (isTop) {
      dispatch({
        type: ActionType.GoPrevious,
      });
    } else {
      dispatch({
        type: ActionType.GoNext,
      });
    }
  }, []);
  const blockSelection = react$1.useCallback((event) => {
    if (event.detail >= 2) {
      event.preventDefault();
    }
  }, []);
  react$1.useImperativeHandle(refHandle, () => ({
    refPromise,
    goNext: () =>
      dispatch({
        type: ActionType.GoNext,
      }),
    goPrevious: () =>
      dispatch({
        type: ActionType.GoPrevious,
      }),
    toggleFullscreen: () =>
      dispatch({
        type: ActionType.ToggleFullscreen,
      }),
    setOptions: (options) =>
      dispatch({
        type: ActionType.SetState,
        state: {
          options,
        },
      }),
    download: () =>
      dispatch({
        type: ActionType.Download,
        options: {
          onError: console.log,
          onProgress: reportProgress,
        },
      }),
    unmount: () =>
      dispatch({
        type: ActionType.Unmount,
      }),
  }), [
    dispatch,
    refPromise,
    reportProgress,
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
    if (error || !text) {
      return;
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#Example
    const guard = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [
    error || !text,
  ]);
  return react$1.createElement(
    ScrollableLayout,
    Object.assign({
      ref: ref,
      tabIndex: -1,
      className: "vim_comic_viewer",
      fullscreen: fullscreenElement === ref.current,
      onClick: navigate,
      onMouseDown: blockSelection,
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
    !!text && react$1.createElement(CircularProgress, {
      radius: 50,
      strokeWidth: 10,
      value: value,
      text: text,
      error: error,
      onClick: cancelDownload,
    }),
  );
};
const Viewer = react$1.forwardRef(Viewer_);

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
exports.transformToBlobUrl = transformToBlobUrl;
exports.types = types;
exports.utils = utils;
