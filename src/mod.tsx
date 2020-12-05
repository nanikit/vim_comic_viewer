/** @jsx createElement */
/// <reference lib="dom" />
import { Viewer } from './components/viewer.tsx';
import { ComicSource, ViewerSource } from './types.ts';
import { timeout } from './utils.ts';
import { createElement } from './vendors/react.ts';
import { render } from './vendors/react_dom.ts';
export * as types from './types.ts';
export * as utils from './utils.ts';

const initializeWithSource = async (source: ComicSource) => {
  const root = document.createElement('div');
  while (true) {
    if (document.body) {
      document.body.append(root);
      render(<Viewer source={source} />, root);
      break;
    }
    await timeout(1);
  }
};

export const initialize = async (sourceOrSources: ViewerSource | ViewerSource[]) => {
  if (Array.isArray(sourceOrSources)) {
    const source = sourceOrSources.find((x) => x.isApplicable());
    if (source) {
      await initializeWithSource(source.comicSource);
    }
  } else {
    await initializeWithSource(sourceOrSources.comicSource);
  }
};
