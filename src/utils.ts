// These are exported to library users.

export const timeout = (millisecond: number) =>
  new Promise((resolve) => setTimeout(resolve, millisecond));

export const waitDomContent = (document: Document) =>
  document.readyState === "loading"
    ? new Promise((r) => document.addEventListener("readystatechange", r, { once: true }))
    : true;

export const insertCss = (css: string) => {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.append(style);
};

export const isTyping = (event: KeyboardEvent) =>
  (event.target as HTMLElement)?.tagName?.match?.(/INPUT|TEXTAREA/) ||
  (event.target as HTMLElement)?.isContentEditable;

export const saveAs = async (blob: Blob, name: string) => {
  const a = document.createElement("a");
  a.download = name;
  a.rel = "noopener";
  a.href = URL.createObjectURL(blob);
  a.click();
  await timeout(40000);
  URL.revokeObjectURL(a.href);
};

export const getSafeFileName = (str: string) => {
  // deno-lint-ignore no-control-regex
  return str.replace(/[<>:"/\\|?*\x00-\x1f]+/gi, "").trim() || "download";
};

export const save = (blob: Blob) => {
  return saveAs(blob, `${getSafeFileName(document.title)}.zip`);
};
