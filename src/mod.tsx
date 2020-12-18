/** @jsx createElement */
/// <reference lib="dom" />
import { Viewer } from './components/viewer.tsx';
import { ViewerController, ViewerSource } from './types.ts';
import { isTyping, waitBody } from './utils.ts';
import { createElement, createRef } from './vendors/react.ts';
import { render } from './vendors/react_dom.ts';
export * as types from './types.ts';
export * as utils from './utils.ts';

const getDefaultRoot = async () => {
  const div = document.createElement('div');
  div.style.height = '100vh';
  await waitBody(document);
  document.body.append(div);
  return div;
};

export const initialize = (root: HTMLElement): ViewerController => {
  const ref = createRef<ViewerController>();
  render(<Viewer ref={ref} />, root);
  return new Proxy(ref, {
    get: (target, ...args) => {
      return Reflect.get(target.current as any, ...args);
    },
  }) as any;
};

const maybeNotHotkey = (event: KeyboardEvent) =>
  event.ctrlKey || event.shiftKey || event.altKey || isTyping(event);

export const initializeWithDefault = async (source: ViewerSource) => {
  const root = source.getRoot?.() || (await getDefaultRoot());
  const controller = initialize(root);
  controller.setSource(source.comicSource);
  const div = await controller.refPromise;
  if (source.withController) {
    source.withController(controller, div);
  } else {
    div.addEventListener('keydown', (event) => {
      if (maybeNotHotkey(event)) {
        return;
      }
      switch (event.key) {
        case 'j':
          controller.goNext();
          break;
        case 'k':
          controller.goPrevious();
          break;
        default:
          break;
      }
    });
    window.addEventListener('keydown', (event) => {
      if (maybeNotHotkey(event)) {
        return;
      }
      if (event.key === 'i') {
        controller.toggleFullscreen();
      }
    });
  }
  return controller;
};
