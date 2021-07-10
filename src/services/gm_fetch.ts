import { GM_xmlhttpRequest } from "./tampermonkey.ts";

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
      throw error;
    }
  }
};

export const gmFetch = GM_xmlhttpRequest
  ? (
    resource: string,
    init?: Pick<RequestInit, "body" | "headers" | "signal">,
  ): Pick<Body, "blob" | "json" | "text"> => {
    const method = init?.body ? "POST" : "GET";
    const xhr = (type: "blob" | "json" | "text") => {
      return new Promise<any>((resolve, reject) => {
        const request = GM_xmlhttpRequest({
          method,
          url: resource,
          headers: init?.headers,
          responseType: type === "text" ? undefined : type,
          data: init?.body as any,
          onload: (response: any) => {
            if (type === "text") {
              resolve(response.responseText);
            } else {
              resolve(response.response);
            }
          },
          onerror: reject,
          onabort: reject,
        }) as any;
        init?.signal?.addEventListener("abort", () => {
          request.abort();
        }, { once: true });
      });
    };
    return {
      blob: () => xhr("blob"),
      json: () => xhr("json"),
      text: () => xhr("text"),
    };
  }
  : undefined;
