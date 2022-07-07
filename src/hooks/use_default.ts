import { useEffect } from "../deps.ts";
import { isTyping } from "../utils.ts";
import { useViewerController } from "./use_viewer_controller.ts";

const maybeNotHotkey = (event: KeyboardEvent) =>
  event.ctrlKey || event.altKey || isTyping(event);

export const useDefault = (
  { enable, controller }: {
    enable?: boolean;
    controller: ReturnType<typeof useViewerController>;
  },
) => {
  const defaultKeyHandler = async (event: KeyboardEvent): Promise<void> => {
    if (maybeNotHotkey(event)) {
      return;
    }

    switch (event.key) {
      case "j":
      case "ArrowDown":
        controller.goNext();
        break;
      case "k":
      case "ArrowUp":
        controller.goPrevious();
        break;
      case ";":
        await controller.downloader?.downloadWithProgress();
        break;
      case "/":
        controller.compactWidthIndex++;
        break;
      case "?":
        controller.compactWidthIndex--;
        break;
      case "'":
        controller.reloadErrored();
        break;
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

  useEffect(() => {
    if (!controller || !enable) {
      return;
    }

    controller.container!.addEventListener("keydown", defaultKeyHandler);
    addEventListener("keydown", defaultGlobalKeyHandler);
    return () => {
      controller.container!.removeEventListener("keydown", defaultKeyHandler);
      removeEventListener("keydown", defaultGlobalKeyHandler);
    };
  }, [controller, enable]);
};
