import type {} from "tampermonkey";

export const isGmFetchAvailable = typeof GM.xmlHttpRequest === "function";

export async function gmFetch(
  url: string,
  init?: RequestInit & { type: "blob" | "json" | "text" },
) {
  const method = init?.body ? "POST" : "GET";
  const response = await GM.xmlHttpRequest({
    method,
    url,
    headers: {
      // Assume cross-origin request and default referrer policy.
      referer: `${location.origin}/`,
      ...init?.headers as Record<string, string>,
    },
    responseType: init?.type === "text" ? undefined : init?.type,
    data: init?.body as string,
  });

  return response;
}
