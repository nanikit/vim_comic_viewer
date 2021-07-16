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
  headers?: object;
  responseType?: XMLHttpRequest["responseType"];
  data?: object;
  onprogress?: (event: { loaded: number; total?: number }) => void;
  onload?: (response: GmXhr) => void;
  onerror?: (response: GmXhr) => void;
  onabort?: (response: GmXhr) => void;
}) => void = (window as any).module.config().GM_xmlhttpRequest;
