/** @jsx createElement */
import { useFullscreenElement } from '../hooks/use_fullscreen_element.ts';
import { usePageNavigator } from '../hooks/use_page_navigator.ts';
import { ComicSource, ImageSource } from '../types.ts';
import {
  createElement,
  React,
  useCallback,
  useEffect,
  useRef,
  useState,
} from '../vendors/react.ts';
import { styled } from '../vendors/stitches.ts';
import { Page } from './page.tsx';

const ImageContainer = styled('div', {
  backgroundColor: '#eee',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexFlow: 'row-reverse wrap',
  overflowY: 'auto',
});

export const Viewer = ({ source, ...props }: { source: ComicSource }) => {
  const [images, setImages] = useState<ImageSource[]>();
  const [status, setStatus] = useState<'loading' | 'complete' | 'error'>('loading');
  const ref = useRef<HTMLDivElement>();
  const navigator = usePageNavigator(ref.current);
  const fullscreenElement = useFullscreenElement();

  const handleNavigation = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'j':
          navigator.goNext();
          break;
        case 'k':
          navigator.goPrevious();
          break;
        default:
          break;
      }
    },
    [navigator],
  );

  const fetchSource = useCallback(async () => {
    try {
      setImages(await source());
      setStatus('complete');
    } catch (error) {
      setStatus('error');
      console.log(error);
      throw error;
    }
  }, [source]);

  useEffect(() => {
    const globalKeyHandler = async (event: KeyboardEvent) => {
      if (event.key === 'i') {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await ref?.current?.requestFullscreen?.();
        }
      }
    };

    window.addEventListener('keydown', globalKeyHandler);
    return () => window.removeEventListener('keydown', globalKeyHandler);
  }, [navigator, ref.current]);

  useEffect(() => {
    ref.current?.focus?.();
  }, [ref.current]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const style = ref.current.style;
    const fullscreenStyle = {
      display: 'flex',
      position: 'fixed',
      top: 0,
      bottom: 0,
      overflow: 'auto',
    };
    if (fullscreenElement && style.position !== 'fixed') {
      Object.assign(style, fullscreenStyle);
      // navigator.restore();
      ref.current.focus();
    } else if (!fullscreenElement && style.position === 'fixed') {
      for (const property of Object.keys(fullscreenStyle)) {
        style.removeProperty(property);
      }
      // navigator.restore();
    }
  }, [ref.current, fullscreenElement, navigator]);

  useEffect(() => {
    fetchSource();
  }, [fetchSource]);

  return (
    <ImageContainer
      ref={ref}
      className="vim_comic_viewer"
      tabIndex={-1}
      onKeyDown={handleNavigation}
      {...props}
    >
      {status === 'complete' ? (
        images?.map?.((image, index) => (
          <Page key={index} source={image} observer={navigator.observer} />
        )) || false
      ) : (
        <p>{status === 'error' ? '에러가 발생했습니다' : '로딩 중...'}</p>
      )}
    </ImageContainer>
  );
};
