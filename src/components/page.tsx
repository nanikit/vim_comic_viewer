/** @jsx createElement */
import { usePageReducer } from '../hooks/use_page_reducer.ts';
import { ImageSource } from '../types.ts';
import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from '../vendors/react.ts';
import { css, styled } from '../vendors/stitches.ts';

const stretch = css.keyframes({
  '0%': {
    top: '8px',
    height: '64px',
  },
  '50%': {
    top: '24px',
    height: '32px',
  },
  '100%': {
    top: '24px',
    height: '32px',
  },
});

const SpinnerContainer = styled('div', {
  position: 'absolute',
  left: '0',
  top: '0',
  right: '0',
  bottom: '0',
  margin: 'auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  div: {
    display: 'inline-block',
    width: '16px',
    margin: '0 4px',
    background: '#fff',
    animation: `${stretch} 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite`,
  },
  'div:nth-child(1)': {
    'animation-delay': '-0.24s',
  },
  'div:nth-child(2)': {
    'animation-delay': '-0.12s',
  },
  'div:nth-child(3)': {
    'animation-delay': '0',
  },
});

const Spinner = () => (
  <SpinnerContainer>
    <div />
    <div />
    <div />
  </SpinnerContainer>
);

const Overlay = styled('div', {
  position: 'relative',
  maxWidth: '100%',
  height: '100%',
  variants: {
    placeholder: {
      true: {
        width: '45%',
      },
    },
  },
  margin: '4px 1px',
  '@media print': {
    margin: 0,
  },
});

const Image = styled('img', {
  position: 'relative',
  height: '100%',
  objectFit: 'contain',
});

export const Page = ({
  source,
  observer,
  ...props
}: {
  source: ImageSource;
  observer?: IntersectionObserver;
}) => {
  const [isLoaded, setLoaded] = useState(false);
  const { src, onError } = usePageReducer(source);
  const ref = useRef<HTMLImageElement>();

  const clearSpinner = useCallback(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    const target = ref.current;
    if (target && observer) {
      observer.observe(target);
      return () => observer.unobserve(target);
    }
  }, [observer, ref.current]);

  return (
    <Overlay ref={ref} placeholder={!isLoaded}>
      <Spinner />
      <Image
        src={src}
        onLoad={clearSpinner}
        onError={onError}
        loading="lazy"
        {...props}
      />
    </Overlay>
  );
};
