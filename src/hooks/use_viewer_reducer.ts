import { download, DownloadOptions } from '../services/downloader.ts';
import { ImageSource, ViewerOptions } from '../types.ts';
import {
  Dispatch,
  MutableRefObject,
  useEffect,
  useReducer,
  useState,
} from '../vendors/react.ts';
import { unmountComponentAtNode } from '../vendors/react_dom.ts';
import { PageNavigator, usePageNavigator } from './use_page_navigator.ts';

type ViewerStatus = 'loading' | 'complete' | 'error';

export type ViewerState = {
  ref: MutableRefObject<HTMLDivElement | undefined>;
  options: ViewerOptions;
  images: ImageSource[];
  status: ViewerStatus;
  navigator: PageNavigator;
  cancelDownload?: () => void;
};

export const enum ActionType {
  GoPrevious,
  GoNext,
  ToggleFullscreen,
  Unmount,
  SetState,
  Download,
}

type PureViewerAction =
  | {
      type:
        | ActionType.GoNext
        | ActionType.GoPrevious
        | ActionType.ToggleFullscreen
        | ActionType.Unmount;
    }
  | { type: ActionType.SetState; state: Partial<ViewerState> };

export type ViewerAction =
  | PureViewerAction
  | { type: ActionType.Download; options?: DownloadOptions };

const reducer = (state: ViewerState, action: PureViewerAction) => {
  switch (action.type) {
    case ActionType.SetState:
      return { ...state, ...action.state };
    case ActionType.GoPrevious:
      state.navigator.goPrevious();
      break;
    case ActionType.GoNext:
      state.navigator.goNext();
      break;
    case ActionType.ToggleFullscreen:
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        state.ref.current?.requestFullscreen?.();
      }
      break;
    case ActionType.Unmount:
      if (state.ref.current) {
        unmountComponentAtNode(state.ref.current);
      }
      break;
    default:
      debugger;
      break;
  }
  return state;
};

const getAsyncReducer = (dispatch: Dispatch<PureViewerAction>) => {
  let images = [] as ImageSource[];
  let cancelDownload: (() => void) | undefined;

  const setState = async (state: Partial<ViewerState>) => {
    const source = state.options?.source;
    if (source) {
      try {
        dispatch({ type: ActionType.SetState, state: { status: 'loading', images: [] } });
        images = await source();
        dispatch({
          type: ActionType.SetState,
          state: { status: 'complete', images },
        });
      } catch (error) {
        dispatch({ type: ActionType.SetState, state: { status: 'error' } });
        console.log(error);
        throw error;
      }
    } else {
      dispatch({ type: ActionType.SetState, state: state });
    }
  };

  const startDownload = async (options?: DownloadOptions) => {
    if (cancelDownload) {
      cancelDownload();
    }
    if (!images.length) {
      return;
    }

    const { zip, cancel } = await download(images, options);
    cancelDownload = () => {
      cancel();
      cancelDownload = undefined;
    };

    const result = await zip;
    cancelDownload = undefined;
    return result;
  };

  return (action: ViewerAction) => {
    switch (action.type) {
      case ActionType.Download:
        return startDownload(action.options);
      case ActionType.SetState:
        return setState(action.state);
      default:
        return dispatch(action);
    }
  };
};

export const useViewerReducer = (ref: MutableRefObject<HTMLDivElement | undefined>) => {
  const navigator = usePageNavigator(ref.current);

  const [state, dispatch] = useReducer(reducer, {
    ref,
    navigator,
    options: {},
    images: [],
    status: 'loading',
  });
  const [asyncDispatch] = useState(() => getAsyncReducer(dispatch));

  useEffect(() => {
    dispatch({ type: ActionType.SetState, state: { navigator } });
  }, [navigator]);

  return [state, asyncDispatch] as const;
};
