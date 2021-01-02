type GmXhr = {
  responseHeaders: Record<string, string>;
} & Pick<
  XMLHttpRequest,
  'readyState' | 'status' | 'statusText' | 'response' | 'responseXML' | 'responseText'
>;

declare global {
  interface NodeModule {
    config: () => {
      GM_xmlhttpRequest?: (request: {
        method?: 'GET' | 'POST';
        url: string;
        headers?: object;
        responseType?: XMLHttpRequest['responseType'];
        data?: object;
        onload?: (response: GmXhr) => void;
        onerror?: (response: GmXhr) => void;
        onabort?: (response: GmXhr) => void;
      }) => void;
    };
  }
}

export const GM_xmlhttpRequest = module.config().GM_xmlhttpRequest;
