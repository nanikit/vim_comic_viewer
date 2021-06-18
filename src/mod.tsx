/** @jsx createElement */
/// <reference lib="dom" />
import { Viewer } from "./containers/viewer.tsx";
import { ViewerController, ViewerSource } from "./types.ts";
import { isTyping } from "./utils.ts";
import { createElement, createRef } from "react";
import { render } from "react-dom";
export { download } from "./services/downloader.ts";
export { transformToBlobUrl } from "./services/user_utils.ts";
export * as types from "./types.ts";
export * as utils from "./utils.ts";

export const initialize = (root: HTMLElement): ViewerController => {
  const ref = createRef<ViewerController>();
  render(<Viewer ref={ref} />, root);
  return ref.current!;
};

const maybeNotHotkey = (event: KeyboardEvent) =>
  event.ctrlKey || event.shiftKey || event.altKey || isTyping(event);

const getDefaultRoot = async () => {
  const div = document.createElement("div");
  div.setAttribute(
    "style",
    "width: 0; height: 0; position: fixed;",
  );
  document.body.append(div);
  return div;
};

export const initializeWithDefault = async (source: ViewerSource) => {
  const root = source.getRoot?.() || (await getDefaultRoot());
  const controller = initialize(root);

  const defaultKeyHandler = async (event: KeyboardEvent): Promise<void> => {
    if (maybeNotHotkey(event)) {
      return;
    }
    switch (event.key) {
      case "j":
        controller.goNext();
        break;
      case "k":
        controller.goPrevious();
        break;
      case ";": {
        await (controller as any).downloadAndSave();
        break;
      }
      default:
        break;
    }
  };

  const defaultGlobalKeyHandler = (event: KeyboardEvent): void => {
    if (maybeNotHotkey(event)) {
      return;
    }
    if (event.key === "i") {
      controller.toggleFullscreen();
    }
  };

  controller.setOptions({ source: source.comicSource });
  const div = controller.container!;
  if (source.withController) {
    source.withController(controller, div);
  } else {
    div.addEventListener("keydown", defaultKeyHandler);
    window.addEventListener("keydown", defaultGlobalKeyHandler);
  }

  return controller;
};
