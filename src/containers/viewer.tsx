/** @jsx createElement */
import type { JSZip } from 'jszip';
import { ScrollableLayout } from '../components/scrollable_layout.ts';
import { useDeferred } from '../hooks/use_deferred.ts';
import { useFullscreenElement } from '../hooks/use_fullscreen_element.ts';
import { ActionType, useViewerReducer } from '../hooks/use_viewer_reducer.ts';
import { ViewerController, ViewerOptions } from '../types.ts';
import {
  createElement,
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
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

  useImperativeHandle(
    refHandle,
    () => ({
      refPromise,
      goNext: () => dispatch({ type: ActionType.GoNext }),
      goPrevious: () => dispatch({ type: ActionType.GoPrevious }),
      toggleFullscreen: () => dispatch({ type: ActionType.ToggleFullscreen }),
      setOptions: (options: ViewerOptions) =>
        dispatch({ type: ActionType.SetState, state: { options } }),
      download: () => dispatch({ type: ActionType.Download }) as Promise<JSZip>,
      unmount: () => dispatch({ type: ActionType.Unmount }),
    }),
    [dispatch, refPromise],
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
