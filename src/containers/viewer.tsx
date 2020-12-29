/** @jsx createElement */
import type { JSZip } from 'jszip';
import { ScrollableLayout } from '../components/scrollable_layout.ts';
import { defer, Deferred, useDeferred } from '../hooks/use_deferred.ts';
import { useFullscreenElement } from '../hooks/use_fullscreen_element.ts';
import { usePageNavigator } from '../hooks/use_page_navigator.ts';
import { download } from '../services/downloader.ts';
import { ComicSource, ImageSource, ViewerController, ViewerOptions } from '../types.ts';
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
import { unmountComponentAtNode } from '../vendors/react_dom.ts';
import { Page } from './page.tsx';

const Viewer_ = (props: unknown, refHandle: Ref<ViewerController>) => {
  const [options, setOptions] = useState<ViewerOptions>();
  const [images, setImages] = useState<ImageSource[]>();
  const [status, setStatus] = useState<'loading' | 'complete' | 'error'>('loading');
  const [hasDownload, setDownload] = useState<Deferred<JSZip>>();
  const ref = useRef<HTMLDivElement>();
  const navigator = usePageNavigator(ref.current);
  const fullscreenElement = useFullscreenElement();
  const { promise: refPromise, resolve: resolveRef } = useDeferred<HTMLDivElement>();

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await ref.current?.requestFullscreen?.();
    }
  }, []);

  const setSource = useCallback(async (source: ComicSource) => {
    try {
      setStatus('loading');
      setImages(await source());
      setStatus('complete');
    } catch (error) {
      setStatus('error');
      console.log(error);
      throw error;
    }
  }, []);

  const queueDownload = useCallback(() => {
    if (hasDownload) {
      hasDownload.reject(new Error('You requested another download'));
    }
    if (!images) {
      return;
    }

    const deferred = defer<JSZip>();
    setDownload(deferred);
    download(images, deferred);
    return deferred.promise;
  }, [images, hasDownload]);

  useImperativeHandle(
    refHandle,
    () => ({
      goNext: navigator.goNext,
      goPrevious: navigator.goPrevious,
      toggleFullscreen,
      refPromise,
      setOptions,
      download: queueDownload,
      unmount: () => ref.current && unmountComponentAtNode(ref.current),
    }),
    [
      navigator.goNext,
      navigator.goPrevious,
      toggleFullscreen,
      refPromise,
      setSource,
      queueDownload,
    ],
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
    setSource(options?.source || (() => []));
  }, [options?.source]);

  return (
    <ScrollableLayout
      ref={ref}
      tabIndex={-1}
      className="vim_comic_viewer"
      fullscreen={fullscreenElement === ref.current}
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
    </ScrollableLayout>
  );
};

export const Viewer = forwardRef(Viewer_);
