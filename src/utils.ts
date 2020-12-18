export const timeout = (millisecond: number) =>
  new Promise((resolve) => setTimeout(resolve, millisecond));

export const waitDomContent = (document: HTMLDocument) =>
  document.readyState === 'loading'
    ? new Promise((r) => document.addEventListener('readystatechange', r, { once: true }))
    : true;

export const insertCss = (css: string) => {
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.append(style);
};

export const waitBody = async (document: HTMLDocument) => {
  while (!document.body) {
    await timeout(1);
  }
};

export const isTyping = (event: KeyboardEvent) =>
  (event.target as HTMLElement)?.tagName?.match?.(/INPUT|TEXTAREA/) ||
  (event.target as HTMLElement)?.isContentEditable;
