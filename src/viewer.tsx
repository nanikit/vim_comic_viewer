/** @jsx createElement */
import { useFullscreen } from './hooks/use_fullscreen.ts';
import { usePageNavigator } from './hooks/use_page_navigator.ts';
import { usePageReducer } from './hooks/use_page_reducer.ts';
import { ComicSource, ImageSource } from './types.ts';
import { timeout } from './utils.ts';
import {
  createElement,
  React,
  useCallback,
  useEffect,
  useRef,
  useState,
} from './vendors/react.ts';
import { render } from './vendors/react_dom.ts';
import { styled } from './vendors/stitches.ts';

const Image = styled('img', {
  height: '100vh',
  maxWidth: '100vw',
  objectFit: 'contain',
  margin: '4px 1px',
});

const Page = ({
  source,
  observer,
  ...props
}: {
  source: ImageSource;
  observer?: IntersectionObserver;
}) => {
  const { src, onError } = usePageReducer(source);
  const ref = useRef<HTMLImageElement>();

  useEffect(() => {
    const target = ref.current;
    if (target && observer) {
      observer.observe(target);
      return () => observer.unobserve(target);
    }
  }, [observer, ref.current]);

  return <Image ref={ref} src={src} onError={onError} loading="lazy" {...props} />;
};

const ImageContainer = styled('div', {
  backgroundColor: '#eee',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexFlow: 'row-reverse wrap',
  overflowY: 'auto',
});

const Viewer = ({ source, ...props }: { source: ComicSource }) => {
  const [images, setImages] = useState<ImageSource[]>();
  const [status, setStatus] = useState<'loading' | 'complete' | 'error'>('loading');
  const navigator = usePageNavigator();
  const ref = useRef<HTMLDivElement>();

  const handleNavigation = useCallback(
    (event: React.KeyboardEvent) => {
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

  const onEnterFullscreen = useCallback(async () => {
    ref.current?.focus?.();
    await timeout(102);
    navigator.restore();
  }, [ref.current]);

  const onExitFullscreen = useCallback(async () => {
    await timeout(102);
    navigator.restore();
  }, [navigator]);

  const toggleFullscreen = useFullscreen(ref, {
    onEnter: onEnterFullscreen,
    onExit: onExitFullscreen,
  });

  useEffect(() => {
    const globalKeyHandler = async (event: KeyboardEvent) => {
      if (event.key === 'i') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', globalKeyHandler);
    return () => {
      window.removeEventListener('keydown', globalKeyHandler);
    };
  }, [navigator]);

  useEffect(() => {
    ref.current?.focus?.();
  }, [ref.current]);

  useEffect(() => {
    fetchSource();
  }, [fetchSource]);

  return (
    <ImageContainer
      ref={ref}
      className="vim_comic_viewer"
      css={{
        '&&:fullscreen': {
          display: 'flex',
        },
      }}
      tabIndex={-1}
      onKeyDown={handleNavigation}
      {...props}
    >
      {status === 'complete' ? (
        images?.map((image, index) => (
          <Page key={index} source={image} observer={navigator.observer} />
        )) || false
      ) : (
        <p>{status === 'error' ? '에러가 발생했습니다' : '로딩 중...'}</p>
      )}
    </ImageContainer>
  );
};

export const initializeViewer = (root: HTMLDivElement, source: ComicSource) => {
  render(<Viewer source={source} />, root);
};
