/** @jsx createElement */
import { ScrollableLayout } from '../components/scrollable_layout.ts';
import { useDeferred } from '../hooks/use_deferred.ts';
import { useFullscreenElement } from '../hooks/use_fullscreen_element.ts';
import { usePageNavigator } from '../hooks/use_page_navigator.ts';
import { ImageSource, ViewerController } from '../types.ts';
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

const Viewer_ = (props: unknown, handleRef: Ref<ViewerController>) => {
  const [images, setImages] = useState<ImageSource[]>();
  const [status, setStatus] = useState<'loading' | 'complete' | 'error'>('loading');
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

  const setSource = useCallback(async (source) => {
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

  useImperativeHandle(
    handleRef,
    () => ({
      goNext: navigator.goNext,
      goPrevious: navigator.goPrevious,
      toggleFullscreen,
      refPromise,
      setSource,
    }),
    [navigator.goNext, navigator.goPrevious, toggleFullscreen, refPromise, setSource],
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
          <Page key={index} source={image} observer={navigator.observer} />
        )) || false
      ) : (
        <p>{status === 'error' ? '에러가 발생했습니다' : '로딩 중...'}</p>
      )}
    </ScrollableLayout>
  );
};

export const Viewer = forwardRef(Viewer_);
