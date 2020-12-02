import { React, useCallback } from '../vendors/react.ts';

const waitFullscreenChange = () =>
  new Promise((resolve) => {
    document.addEventListener(
      'fullscreenchange',
      () => resolve(document.fullscreenElement),
      { once: true },
    );
  });

export const useFullscreen = (
  ref: React.RefObject<HTMLDivElement | undefined>,
  {
    onEnter,
    onExit,
  }: { onEnter?: () => void | Promise<void>; onExit?: () => void | Promise<void> },
): (() => Promise<void>) => {
  const toggle = useCallback(async () => {
    if (document.fullscreenElement) {
      return document.exitFullscreen();
    } else {
      await ref.current!.requestFullscreen();
      await onEnter?.();
      while (await waitFullscreenChange());
      await onExit?.();
    }
  }, [onEnter, onExit, ref.current]);

  return toggle;
};
