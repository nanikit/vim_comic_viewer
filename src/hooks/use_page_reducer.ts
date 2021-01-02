import { imageSourceToIterable } from '../services/user_utils.ts';
import { ImageSource } from '../types.ts';
import {
  Dispatch,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from '../vendors/react.ts';

type PageState = { src?: string; status: 'loading' | 'complete' | 'error' };

const enum PageActionType {
  SetState,
  SetSource,
  Fallback,
}

type PageAction =
  | { type: PageActionType.SetState; state: Partial<PageState> }
  | { type: PageActionType.SetSource; source: ImageSource }
  | { type: PageActionType.Fallback };

const reducer = (state: PageState, action: PageAction) => {
  switch (action.type) {
    case PageActionType.SetState:
      return { ...state, ...action.state };
    default:
      debugger;
      return state;
  }
};

const getAsyncReducer = (dispatch: Dispatch<PageAction>) => {
  const empty = (async function* () {})() as AsyncIterator<string>;
  let iterator = empty;

  const setState = (state: Partial<PageState>) => {
    dispatch({ type: PageActionType.SetState, state });
  };

  const takeNext = async () => {
    const snapshot = iterator;
    try {
      const item = await snapshot.next();
      if (snapshot !== iterator) {
        return;
      }

      if (item.done) {
        setState({ src: undefined, status: 'error' });
      } else {
        setState({ src: item.value, status: 'loading' });
      }
    } catch (error) {
      console.error(error);
      setState({ src: undefined, status: 'error' });
    }
  };

  const setSource = async (source: ImageSource) => {
    iterator = imageSourceToIterable(source)[Symbol.asyncIterator]();
    await takeNext();
  };

  return (action: PageAction) => {
    switch (action.type) {
      case PageActionType.SetSource:
        return setSource(action.source);
      case PageActionType.Fallback:
        return takeNext();
      default:
        return dispatch(action);
    }
  };
};

export const usePageReducer = (source: ImageSource) => {
  const [state, dispatch] = useReducer(reducer, { status: 'loading' });
  const [asyncDispatch] = useState(() => getAsyncReducer(dispatch));

  const onError = useCallback(() => {
    asyncDispatch({ type: PageActionType.Fallback });
  }, []);

  const onLoad = useCallback(() => {
    asyncDispatch({ type: PageActionType.SetState, state: { status: 'complete' } });
  }, []);

  useEffect(() => {
    asyncDispatch({ type: PageActionType.SetSource, source });
  }, [source]);

  return [{ ...state, onLoad, onError }, asyncDispatch] as const;
};
