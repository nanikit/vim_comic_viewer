/** @jsx createElement */
import { Image, Overlay, Spinner } from '../components/spinner.tsx';
import { usePageReducer } from '../hooks/use_page_reducer.ts';
import { ImageSource } from '../types.ts';
import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from '../vendors/react.ts';

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
      <Image src={src} onLoad={clearSpinner} onError={onError} {...props} />
    </Overlay>
  );
};
