// ==UserScript==
// @name         vim comic viewer
// @description  Universal comic reader
// @version      1.0.1
// @namespace    https://openuserjs.org/users/keut
// @exclude      *
// @match        http://unused-field.space/
// @author       keut
// @license      MIT
// ==/UserScript==

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');
var reactDom = require('react-dom');
var react$1 = require('@stitches/react');

const timeout = (millisecond) =>
  new Promise((resolve) => setTimeout(resolve, millisecond));
const waitDomContent = (document) =>
  document.readyState === 'loading'
    ? new Promise((r) =>
        document.addEventListener('readystatechange', r, {
          once: true,
        }),
      )
    : true;
const insertCss = (css) => {
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.append(style);
};

var utils = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  timeout: timeout,
  waitDomContent: waitDomContent,
  insertCss: insertCss,
});

const waitFullscreenChange = () =>
  new Promise((resolve) => {
    document.addEventListener(
      'fullscreenchange',
      () => resolve(document.fullscreenElement),
      {
        once: true,
      },
    );
  });
const useFullscreen = (ref, { onEnter, onExit }) => {
  const toggle = react.useCallback(async () => {
    if (document.fullscreenElement) {
      return document.exitFullscreen();
    } else {
      await ref.current.requestFullscreen();
      await onEnter?.();
      while (await waitFullscreenChange());
      await onExit?.();
    }
  }, [onEnter, onExit, ref.current]);
  return toggle;
};

const usePageNavigator = () => {
  const [observer, setObserver] = react.useState();
  const [captures] = react.useState([
    {
      entries: [],
      isSorted: true,
    },
  ]);
  const sortAndGetAnchor = react.useCallback(
    (pages) => {
      const first = pages.entries?.[0]?.target;
      if (!pages.isSorted && !!first) {
        const children = [...first.parentElement.children];
        pages.entries.sort((a, b) => {
          const aRatio = Math.round(a.intersectionRatio * 10);
          const bRatio = Math.round(b.intersectionRatio * 10);
          const aIndex = children.indexOf(a.target);
          const bIndex = children.indexOf(b.target);
          return (bRatio - aRatio) * 10 + (bIndex - aIndex);
        });
        pages.isSorted = true;
      }
      return pages.entries?.[0]?.target;
    },
    [captures],
  );
  const goNext = react.useCallback(() => {
    const anchor = sortAndGetAnchor(captures[0]);
    if (!anchor) {
      return;
    }
    let cursor = anchor;
    const originBound = cursor.getBoundingClientRect();
    while (cursor.nextElementSibling) {
      const next = cursor.nextElementSibling;
      const nextBound = next.getBoundingClientRect();
      if (originBound.bottom < nextBound.top) {
        next.scrollIntoView({
          block: 'center',
        });
        break;
      }
      cursor = next;
    }
  }, [sortAndGetAnchor]);
  const goPrevious = react.useCallback(() => {
    const anchor = sortAndGetAnchor(captures[0]);
    if (!anchor) {
      return;
    }
    let cursor = anchor;
    const originBound = cursor.getBoundingClientRect();
    while (cursor.previousElementSibling) {
      const previous = cursor.previousElementSibling;
      const previousBound = previous.getBoundingClientRect();
      if (previousBound.bottom < originBound.top) {
        previous.scrollIntoView({
          block: 'center',
        });
        break;
      }
      cursor = previous;
    }
  }, [sortAndGetAnchor]);
  const restore = react.useCallback(() => {
    const anchor = sortAndGetAnchor(captures[1]);
    if (!anchor) {
      return;
    }
    anchor.scrollIntoView({
      block: 'center',
    });
  }, [captures, sortAndGetAnchor]);
  react.useEffect(() => {
    const newObserver = new IntersectionObserver(
      (entries) => {
        let newIntersections = captures[0].entries;
        for (const entry of entries) {
          newIntersections = newIntersections.filter(
            (item) => item.target !== entry.target,
          );
          if (entry.isIntersecting) {
            newIntersections.push(entry);
          }
        }
        captures.unshift({
          entries: newIntersections,
          isSorted: false,
        });
        captures.splice(2);
        console.log(captures[0].entries);
      },
      {
        threshold: [0.01, 0.5],
      },
    );
    setObserver(newObserver);
    return () => newObserver.disconnect();
  }, [captures]);
  return react.useMemo(
    () => ({
      goNext,
      goPrevious,
      restore,
      observer,
    }),
    [goNext, goPrevious, restore, observer],
  );
};

const init = (source) => {
  if (typeof source === 'string') {
    return {
      src: source,
      iterator: (function* () {})(),
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
  throw new Error('unknown image source');
};
const reducer = (state, action) => {
  if (action !== 'next') {
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
    dispatch('next');
  }, []);
  return {
    src: state.src,
    onError,
  };
};

const { styled, css } = react$1.createStyled({});

const Image = styled('img', {
  height: '100vh',
  maxWidth: '100vw',
  objectFit: 'contain',
  margin: '4px 1px',
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
  }, [observer, ref.current]);
  return react.createElement(
    Image,
    Object.assign(
      {
        ref: ref,
        src: src,
        onError: onError,
        loading: 'lazy',
      },
      props,
    ),
  );
};
const ImageContainer = styled('div', {
  backgroundColor: '#eee',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexFlow: 'row-reverse wrap',
  overflowY: 'auto',
});
const Viewer = ({ source, ...props }) => {
  const [images, setImages] = react.useState();
  const [status, setStatus] = react.useState('loading');
  const navigator = usePageNavigator();
  const ref = react.useRef();
  const handleNavigation = react.useCallback(
    (event) => {
      switch (event.key) {
        case 'j':
          navigator.goNext();
          break;
        case 'k':
          navigator.goPrevious();
          break;
        case 'o':
          window.close();
          break;
      }
    },
    [navigator],
  );
  const fetchSource = react.useCallback(async () => {
    try {
      setImages(await source());
      setStatus('complete');
    } catch (error) {
      setStatus('error');
      console.log(error);
      throw error;
    }
  }, [source]);
  const onEnterFullscreen = react.useCallback(async () => {
    ref.current?.focus?.();
    await timeout(102);
    navigator.restore();
  }, [ref.current]);
  const onExitFullscreen = react.useCallback(async () => {
    await timeout(102);
    navigator.restore();
  }, [navigator]);
  const toggleFullscreen = useFullscreen(ref, {
    onEnter: onEnterFullscreen,
    onExit: onExitFullscreen,
  });
  react.useEffect(() => {
    const globalKeyHandler = async (event) => {
      if (event.key === 'i') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', globalKeyHandler);
    return () => {
      window.removeEventListener('keydown', globalKeyHandler);
    };
  }, [navigator]);
  react.useEffect(() => {
    ref.current?.focus?.();
  }, [ref.current]);
  react.useEffect(() => {
    fetchSource();
  }, [fetchSource]);
  return react.createElement(
    ImageContainer,
    Object.assign(
      {
        ref: ref,
        className: 'vim_comic_viewer',
        css: {
          '&&:fullscreen': {
            display: 'flex',
          },
        },
        tabIndex: -1,
        onKeyDown: handleNavigation,
      },
      props,
    ),
    status === 'complete'
      ? images?.map((image, index) =>
          react.createElement(Page, {
            key: index,
            source: image,
            observer: navigator.observer,
          }),
        ) || false
      : react.createElement(
          'p',
          null,
          status === 'error' ? '에러가 발생했습니다' : '로딩 중...',
        ),
  );
};
const initializeViewer = (root, source) => {
  reactDom.render(
    react.createElement(Viewer, {
      source: source,
    }),
    root,
  );
};

const initializeWithSource = async (source) => {
  const root = document.createElement('div');
  while (true) {
    if (document.body) {
      document.body.append(root);
      initializeViewer(root, source);
      break;
    }
    await timeout(1);
  }
};
const initialize = async (sourceOrSources) => {
  if (Array.isArray(sourceOrSources)) {
    const source = sourceOrSources.find((x) => x.isApplicable());
    if (source) {
      await initializeWithSource(source.comicSource);
    }
  } else {
    await initializeWithSource(sourceOrSources.comicSource);
  }
};

exports.initialize = initialize;
exports.utils = utils;
