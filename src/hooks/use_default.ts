import { useEffect } from "../deps.ts";
import { isTyping } from "../utils.ts";
import { useViewerController } from "./use_viewer_controller.ts";

export function useDefault({ enable, controller }: {
  enable?: boolean;
  controller: ReturnType<typeof useViewerController>;
}) {
  const defaultKeyHandler = async (event: KeyboardEvent): Promise<void> => {
    if (maybeNotHotkey(event)) {
      return;
    }

    switch (event.key) {
      case "j":
      case "ArrowDown":
        controller.goNext();
        event.preventDefault();
        break;
      case "k":
      case "ArrowUp":
        controller.goPrevious();
        event.preventDefault();
        break;
      case ";":
        await controller.downloader?.downloadAndSave();
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
        return;
    }

    event.stopPropagation();
  };

  const defaultGlobalKeyHandler = async (event: KeyboardEvent) => {
    if (maybeNotHotkey(event)) {
      return;
    }

    if (["KeyI", "Numpad0", "Enter"].includes(event.code)) {
      if (event.shiftKey) {
        await controller.toggleFullscreen();
      } else {
        await controller.toggleImmersive();
      }
    }
  };

  useEffect(() => {
    if (!controller || !enable) {
      return;
    }

    addEventListener("keydown", defaultGlobalKeyHandler);
    controller.container?.addEventListener("keydown", defaultKeyHandler);
    return () => {
      controller.container?.removeEventListener("keydown", defaultKeyHandler);
      removeEventListener("keydown", defaultGlobalKeyHandler);
    };
  }, [controller, enable]);
}

function maybeNotHotkey(event: KeyboardEvent) {
  const { ctrlKey, altKey, metaKey } = event;
  return ctrlKey || altKey || metaKey || isTyping(event);
}
