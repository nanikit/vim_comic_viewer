/** @jsx createElement */
/// <reference lib="dom" />
import { Viewer } from './components/viewer.tsx';
import { ViewerSource } from './types.ts';
import { timeout } from './utils.ts';
import { createElement } from './vendors/react.ts';
import { render } from './vendors/react_dom.ts';
export * as types from './types.ts';
export * as utils from './utils.ts';

const getDefaultRoot = () => {
  const div = document.createElement('div');
  div.style.height = '100vh';
  return div;
};

const initializeWithSource = async (source: ViewerSource) => {
  const root = source?.getRoot?.() || getDefaultRoot();
  while (true) {
    if (document.body) {
      document.body.append(root);
      render(<Viewer source={source.comicSource} />, root);
      break;
    }
    await timeout(1);
  }
};

export const initialize = async (sourceOrSources: ViewerSource | ViewerSource[]) => {
  if (Array.isArray(sourceOrSources)) {
    const source = sourceOrSources.find((x) => x.isApplicable());
    if (source) {
      await initializeWithSource(source);
    }
  } else {
    await initializeWithSource(sourceOrSources);
  }
};
