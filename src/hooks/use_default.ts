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

    const { container, elementKeyHandler, globalKeyHandler } = controller;
    const scrollable = container?.firstElementChild as HTMLDivElement | null;

    addEventListener("keydown", globalKeyHandler);
    // Default focus. This accept pgup/pgdn, home/end, etc.
    container?.addEventListener("keydown", elementKeyHandler);
    // If button is focused, this accept j/k, but not pgup/pgdn, home/end, etc.
    scrollable?.addEventListener("keydown", elementKeyHandler);
    return () => {
      scrollable?.removeEventListener("keydown", elementKeyHandler);
      container?.removeEventListener("keydown", elementKeyHandler);
      removeEventListener("keydown", globalKeyHandler);
    };
  }, [controller, enable]);
}
