/** @jsx createElement */
import type { JSZip } from 'jszip';
import { CircularProgress } from '../components/circular_progress.tsx';
import { ScrollableLayout } from '../components/scrollable_layout.ts';
import { useDeferred } from '../hooks/use_deferred.ts';
import { useFullscreenElement } from '../hooks/use_fullscreen_element.ts';
import { ActionType, useViewerReducer } from '../hooks/use_viewer_reducer.ts';
import type { DownloadProgress } from '../services/downloader.ts';
import { ViewerController, ViewerOptions } from '../types.ts';
import {
  createElement,
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from '../vendors/react.ts';
import { Page } from './page.tsx';

const Viewer_ = (props: unknown, refHandle: Ref<ViewerController>) => {
  const ref = useRef<HTMLDivElement>();
  const fullscreenElement = useFullscreenElement();
  const { promise: refPromise, resolve: resolveRef } = useDeferred<HTMLDivElement>();
  const [
    { options, images, navigator, status, cancelDownload },
    dispatch,
  ] = useViewerReducer(ref);

  const [{ value, text, error }, setProgress] = useState({
    value: 0,
    text: '',
    error: false,
  });
  const cache = { text: '' };
  const reportProgress = useCallback(
    (event: DownloadProgress) => {
      const value = (event.settled / images.length) * 0.9 + event.zipPercent * 0.001;
      const text = `${(value * 100).toFixed(1)}%`;
      const error = !!event.rejected;
      if ((value === 1 && !error) || event.cancelled) {
        setProgress({ value: 0, text: '', error: false });
      } else if (text !== cache.text) {
        cache.text = text;
        setProgress({ value, text, error });
      }
    },
    [images.length],
  );

  const navigate = useCallback((event: MouseEvent) => {
    const height = ref.current?.clientHeight;
    if (!height || event.button !== 0) {
      return;
    }

    event.preventDefault();
    window.getSelection()?.empty?.();
    const isTop = event.clientY < height / 2;
    if (isTop) {
      dispatch({ type: ActionType.GoPrevious });
    } else {
      dispatch({ type: ActionType.GoNext });
    }
  }, []);

  const blockSelection = useCallback((event: MouseEvent) => {
    if (event.detail >= 2) {
      event.preventDefault();
    }
  }, []);

  useImperativeHandle(
    refHandle,
    () => ({
      refPromise,
      goNext: () => dispatch({ type: ActionType.GoNext }),
      goPrevious: () => dispatch({ type: ActionType.GoPrevious }),
      toggleFullscreen: () => dispatch({ type: ActionType.ToggleFullscreen }),
      setOptions: (options: ViewerOptions) =>
        dispatch({ type: ActionType.SetState, state: { options } }),
      download: () =>
        dispatch({
          type: ActionType.Download,
          options: { onError: console.log, onProgress: reportProgress },
        }) as Promise<JSZip>,
      unmount: () => dispatch({ type: ActionType.Unmount }),
    }),
    [dispatch, refPromise, reportProgress],
  );

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current?.focus?.();
    resolveRef(ref.current);
  }, [ref.current]);

  useEffect(() => {
    if (ref.current && fullscreenElement === ref.current) {
      ref.current?.focus?.();
    }
  }, [ref.current, fullscreenElement]);

  useEffect(() => {
    if (error || !text) {
      return;
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#Example
    const guard = (event: Event) => {
      event.preventDefault();
      event.returnValue = '' as any;
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [error || !text]);

  return (
    <ScrollableLayout
      ref={ref}
      tabIndex={-1}
      className="vim_comic_viewer"
      fullscreen={fullscreenElement === ref.current}
      onClick={navigate as any}
      onMouseDown={blockSelection as any}
      {...props}
    >
      {status === 'complete' ? (
        images?.map?.((image, index) => (
          <Page
            key={index}
            source={image}
            observer={navigator.observer}
            {...options?.imageProps}
          />
        )) || false
      ) : (
        <p>{status === 'error' ? '에러가 발생했습니다' : '로딩 중...'}</p>
      )}
      {!!text && (
        <CircularProgress
          radius={50}
          strokeWidth={10}
          value={value}
          text={text}
          error={error}
          onClick={cancelDownload}
        />
      )}
    </ScrollableLayout>
  );
};

export const Viewer = forwardRef(Viewer_);
