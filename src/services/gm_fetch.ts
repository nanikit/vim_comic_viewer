import { GM_xmlhttpRequest } from './tampermonkey.ts';

const GMxhr = GM_xmlhttpRequest;
export const gmFetch = GMxhr
  ? (
      resource: string,
      init?: Pick<RequestInit, 'body' | 'headers'>,
    ): { abort: () => void } & Pick<Body, 'blob' | 'json' | 'text'> => {
      const method = init?.body ? 'POST' : 'GET';
      let abort = undefined as any;
      const xhr = (type: 'blob' | 'json' | 'text') => {
        return new Promise<any>((resolve, reject) => {
          const request = GMxhr({
            method,
            url: resource,
            headers: init?.headers,
            responseType: type === 'text' ? undefined : type,
            data: init?.body as any,
            onload: (response) => {
              if (type === 'text') {
                resolve(response.responseText);
              } else {
                resolve(response.response);
              }
            },
            onerror: reject,
            onabort: reject,
          }) as any;
          abort = request.abort.bind(request);
        });
      };
      return {
        abort,
        blob: () => xhr('blob'),
        json: () => xhr('json'),
        text: () => xhr('text'),
      };
    }
  : undefined;
