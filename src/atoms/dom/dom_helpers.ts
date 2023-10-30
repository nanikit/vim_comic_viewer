const globalCss = document.createElement("style");
globalCss.innerHTML = `html, body {
  overflow: hidden;
}`;

export function showBodyScrollbar(doShow: boolean) {
  if (doShow) {
    globalCss.remove();
  } else {
    document.head.append(globalCss);
  }
}

export async function setFullscreenElement(element: Element | null) {
  if (element) {
    await element.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
}

export function focusWithoutScroll(element: HTMLElement | null) {
  element?.focus({ preventScroll: true });
}
