const globalCss = document.createElement("style");
globalCss.innerHTML = `html, body {
  overflow: hidden;
}`;

export function hideBodyScrollBar(doHide: boolean) {
  if (doHide) {
    document.head.append(globalCss);
  } else {
    globalCss.remove();
  }
}

export async function setFullscreenElement(element: Element | null) {
  if (element) {
    await element.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
}

export function focusWithoutScroll(element?: HTMLElement) {
  element?.focus({ preventScroll: true });
}

export function isUserGesturePermissionError(error: unknown) {
  // Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.
  return (error as { message?: string })?.message === "Permissions check failed";
}

/** Fast fullscreen change can cause this. */
export function isDocumentNotActiveError(error: unknown) {
  const message = (error as { message?: string })?.message;
  return message?.match(/Failed to execute '.*?' on 'Document': Document not active/) ?? false;
}
