/** @jsx createElement */
import { usePageReducer } from '../hooks/use_page_reducer.ts';
import { ImageSource } from '../types.ts';
import { createElement, useEffect, useRef } from '../vendors/react.ts';
import { styled } from '../vendors/stitches.ts';

const Image = styled('img', {
  height: '100%',
  maxWidth: '100%',
  objectFit: 'contain',
  margin: '4px 1px',
  '@media print': {
    margin: 0,
  },
});

export const Page = ({
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
