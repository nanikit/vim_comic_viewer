import { throttle, useEffect, useState } from "../deps.ts";

type SwipeParams = {
  element: HTMLElement | null;
  onPrevious?: () => void;
  onNext?: () => void;
};

export function useHorizontalSwipe({ element, onPrevious, onNext }: SwipeParams) {
  const [swipeRatio, setSwipeRatio] = useState(0);

  useEffect(() => {
    if (!element || !onPrevious && !onNext) return;

    type LastTouch = {
      identifier: number;
      x: number;
      y: number;
      scrollTop: number;
    };
    let lastX: number | null = null;
    let lastRatio = 0;
    let startTouch: LastTouch | null = null;

    const addTouchIfClean = (event: TouchEvent) => {
      const newTouch = event.touches[0];
      if (startTouch !== null || !newTouch) return;

      startTouch = {
        identifier: newTouch.identifier,
        x: newTouch.clientX,
        y: newTouch.clientY,
        scrollTop: element.scrollTop,
      };
      lastX = newTouch.clientX;
    };

    const throttledSetSwipeRatio = throttle(setSwipeRatio, 1000 / 60);

    const updateSwipeRatio = (event: TouchEvent) => {
      const continuedTouch = [...event.changedTouches].find((touch) =>
        touch.identifier === startTouch?.identifier
      );
      if (!continuedTouch || !startTouch || !lastX) return;

      const isVerticalScroll = element.scrollTop !== startTouch.scrollTop;
      if (isVerticalScroll) {
        resetTouch();
        return;
      }

      const ratioDelta = (continuedTouch.clientX - lastX) / 200;
      lastRatio = Math.max(-1, Math.min(lastRatio + ratioDelta, 1));
      throttledSetSwipeRatio(lastRatio);
      lastX = continuedTouch.clientX;

      const horizontalOffset = Math.abs(continuedTouch.clientX - startTouch.x);
      const verticalOffset = Math.abs(continuedTouch.clientY - startTouch.y);
      if (horizontalOffset > verticalOffset) {
        event.preventDefault();
      }
    };

    const resetSwipeRatioIfReleased = (event: TouchEvent) => {
      const continuedTouch = [...event.touches].find((touch) =>
        touch.identifier === startTouch?.identifier
      );
      if (continuedTouch) return;

      if (Math.abs(lastRatio) < 0.7) {
        resetTouch();
        return;
      }

      if (lastRatio > 0) {
        onPrevious?.();
      } else {
        onNext?.();
      }

      resetTouch();
    };

    function resetTouch() {
      startTouch = null;
      lastX = null;
      lastRatio = 0;
      throttledSetSwipeRatio(0);
      throttledSetSwipeRatio.flush();
    }

    element.addEventListener("touchend", resetSwipeRatioIfReleased);
    element.addEventListener("touchcancel", resetSwipeRatioIfReleased);
    element.addEventListener("touchmove", updateSwipeRatio, { passive: false });
    element.addEventListener("touchstart", addTouchIfClean, { passive: true });

    return () => {
      element.removeEventListener("touchstart", addTouchIfClean);
      element.removeEventListener("touchmove", updateSwipeRatio);
      element.removeEventListener("touchcancel", resetSwipeRatioIfReleased);
      element.removeEventListener("touchend", resetSwipeRatioIfReleased);
    };
  }, [element]);

  return swipeRatio;
}
