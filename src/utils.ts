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

export const saveAs = async (blob: Blob, name: string) => {
  const a = document.createElement('a');
  a.download = name;
  a.rel = 'noopener';
  a.href = URL.createObjectURL(blob);
  a.click();
  await timeout(40000);
  URL.revokeObjectURL(a.href);
};

export const getSafeFileName = (str: string) => {
  return str.replace(/[<>:"/\\|?*\x00-\x1f]+/gi, '').trim() || 'download';
};

export type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

export const defer = <T>(): Deferred<T> => {
  let resolve, reject;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject } as any;
};
