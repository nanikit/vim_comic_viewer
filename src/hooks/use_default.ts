import { ViewerController } from "../types.ts";
import { isTyping } from "../utils.ts";
import { useEffect } from "react";
import { DownloadProgress } from "../services/downloader.ts";

const maybeNotHotkey = (event: KeyboardEvent) =>
  event.ctrlKey || event.altKey || isTyping(event);

export const useDefault = (
  { enable, controller, reportProgress }: {
    enable?: boolean;
    controller: ViewerController;
    reportProgress: (event: DownloadProgress) => void;
  },
) => {
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
      case ";":
        await (controller as any).downloadAndSave({
          onProgress: reportProgress,
          onError: console.error,
        });
        break;
      case "/":
        controller.compactWidthIndex++;
        break;
      case "?":
        controller.compactWidthIndex--;
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
    window.addEventListener("keydown", defaultGlobalKeyHandler);
    return () => {
      controller.container!.removeEventListener("keydown", defaultKeyHandler);
      window.removeEventListener("keydown", defaultGlobalKeyHandler);
    };
  }, [controller, enable]);
};
