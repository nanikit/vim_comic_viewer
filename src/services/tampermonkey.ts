type GmXhr =
  & {
    responseHeaders: Record<string, string>;
  }
  & Pick<
    XMLHttpRequest,
    | "readyState"
    | "status"
    | "statusText"
    | "response"
    | "responseXML"
    | "responseText"
  >;

export const GM_xmlhttpRequest: (request: {
  method?: "GET" | "POST";
  url: string;
  headers?: Record<string, unknown>;
  responseType?: XMLHttpRequest["responseType"];
  data?: BodyInit | null;
  onprogress?: (event: { loaded: number; total?: number }) => void;
  onload?: (response: GmXhr) => void;
  onerror?: (response: GmXhr) => void;
  onabort?: (response: GmXhr) => void;
}) => XMLHttpRequest = (window as unknown as {
  module: { config: () => { GM_xmlhttpRequest: () => XMLHttpRequest } };
}).module.config().GM_xmlhttpRequest;
