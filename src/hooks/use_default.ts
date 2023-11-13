import { useEffect } from "../deps.ts";
import { useViewerController } from "./use_viewer_controller.ts";

export function useDefault({ enable, controller }: {
  enable?: boolean;
  controller: ReturnType<typeof useViewerController>;
}) {
  useEffect(() => {
    if (!controller || !enable) {
      return;
    }

    addEventListener("keydown", controller.globalKeyHandler);
    controller.container?.addEventListener("keydown", controller.elementKeyHandler);
    return () => {
      controller.container?.removeEventListener("keydown", controller.elementKeyHandler);
      removeEventListener("keydown", controller.globalKeyHandler);
    };
  }, [controller, enable]);
}
