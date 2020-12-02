import { ImageSource } from '../types.ts';
import { useCallback, useReducer } from '../vendors/react.ts';

export type FallbackState = { src?: string; iterator?: Iterator<string> };

const init = (source: ImageSource): FallbackState => {
  if (typeof source === 'string') {
    return { src: source, iterator: (function* () {})() };
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

const reducer = (state: FallbackState, action: 'next' | ImageSource) => {
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

  return { ...state, src: result.value };
};

export const usePageReducer = (source: ImageSource) => {
  const [state, dispatch] = useReducer(reducer, source, init);

  const onError = useCallback(() => {
    dispatch('next');
  }, []);

  return { src: state.src, onError };
};
