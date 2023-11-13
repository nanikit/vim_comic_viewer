import { ViewerController } from "../atoms/controller_atom.ts";
import { useEffect } from "../deps.ts";

export function useDefault({ enable, controller }: {
  enable?: boolean;
  controller: ViewerController | null;
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
