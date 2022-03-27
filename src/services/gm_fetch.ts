import { GM_xmlhttpRequest } from "./tampermonkey.ts";

export const gmFetch = GM_xmlhttpRequest
  ? (
    resource: string,
    init?: RequestInit,
  ): Pick<Body, "blob" | "json" | "text"> => {
    const method = init?.body ? "POST" : "GET";
    const xhr = (type: "blob" | "json" | "text") => {
      return new Promise<unknown>((resolve, reject) => {
        const request = GM_xmlhttpRequest({
          method,
          url: resource,
          headers: init?.headers as Record<string, unknown>,
          responseType: type === "text" ? undefined : type,
          data: init?.body,
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
        init?.signal?.addEventListener("abort", () => {
          request.abort();
        }, { once: true });
      });
    };
    return {
      blob: () => xhr("blob") as Promise<Blob>,
      json: () => xhr("json"),
      text: () => xhr("text") as Promise<string>,
    };
  }
  : undefined;

export const fetchBlob = async (url: string, init?: RequestInit) => {
  try {
    const response = await fetch(url, init);
    return await response.blob();
  } catch (error) {
    if (init?.signal?.aborted) {
      throw error;
    }

    const isOriginDifferent = new URL(url).origin !== location.origin;
    if (isOriginDifferent && gmFetch) {
      return await gmFetch(url, init).blob();
    } else {
      throw new Error("CORS blocked and cannot use GM_xmlhttpRequest", {
        cause: error,
      });
    }
  }
};
