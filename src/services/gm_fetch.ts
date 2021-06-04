import { GM_xmlhttpRequest } from "./tampermonkey.ts";

export const fetchBlob = async (url: string, init?: RequestInit) => {
  try {
    const response = await fetch(url, init);
    return await response.blob();
  } catch (error) {
    const isOriginDifferent = new URL(url).origin !== location.origin;
    if (isOriginDifferent && gmFetch) {
      return await gmFetch(url, init).blob();
    } else {
      throw error;
    }
  }
};

const GMxhr = GM_xmlhttpRequest;
export const gmFetch = GMxhr
  ? (
    resource: string,
    init?: Pick<RequestInit, "body" | "headers" | "signal">,
  ): Pick<Body, "blob" | "json" | "text"> => {
    const method = init?.body ? "POST" : "GET";
    const xhr = (type: "blob" | "json" | "text") => {
      return new Promise<any>((resolve, reject) => {
        const request = GMxhr({
          method,
          url: resource,
          headers: init?.headers,
          responseType: type === "text" ? undefined : type,
          data: init?.body as any,
          onload: (response) => {
            if (type === "text") {
              resolve(response.responseText);
            } else {
              resolve(response.response);
            }
          },
          onerror: reject,
          onabort: reject,
        }) as any;
        if (init?.signal) {
          init.signal.addEventListener("abort", () => {
            request.abort();
          });
        }
      });
    };
    return {
      blob: () => xhr("blob"),
      json: () => xhr("json"),
      text: () => xhr("text"),
    };
  }
  : undefined;
