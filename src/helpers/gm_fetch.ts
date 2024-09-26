import type {} from "tampermonkey";

export const isGmFetchAvailable = typeof GM_xmlhttpRequest === "function";

export function gmFetch(url: string, init?: RequestInit & { type: "blob" | "json" | "text" }) {
  const method = init?.body ? "POST" : "GET";
  return new Promise<Tampermonkey.Response<unknown>>((resolve, reject) => {
    const request = GM_xmlhttpRequest({
      method,
      url,
      headers: {
        // Assume cross-origin request and default referrer policy.
        referer: `${location.origin}/`,
        ...init?.headers as Record<string, string>,
      },
      responseType: init?.type === "text" ? undefined : init?.type,
      data: init?.body as string,
      onload: resolve,
      onerror: reject,
      onabort: reject,
    });
    init?.signal?.addEventListener(
      "abort",
      () => {
        request.abort();
      },
      { once: true },
    );
  });
}
