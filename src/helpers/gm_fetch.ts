import type {} from "tampermonkey";

export const isGmFetchAvailable = typeof GM_xmlhttpRequest === "function";

export function gmFetch(resource: string, init?: RequestInit) {
  const method = init?.body ? "POST" : "GET";
  const xhr = (type: "blob" | "json" | "text") => {
    return new Promise<unknown>((resolve, reject) => {
      const request = GM_xmlhttpRequest({
        method,
        url: resource,
        headers: {
          // Assume cross-origin request and default referrer policy.
          referer: `${location.origin}/`,
          ...init?.headers as Record<string, string>,
        },
        responseType: type === "text" ? undefined : type,
        data: init?.body as string,
        onload: (response) => {
          if (type === "text") {
            resolve(response.responseText);
          } else {
            resolve(response.response);
          }
        },
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
  };
  return {
    blob: () => xhr("blob") as Promise<Blob>,
    json: <T>() => xhr("json") as Promise<T>,
    text: () => xhr("text") as Promise<string>,
  };
}
