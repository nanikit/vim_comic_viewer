// @deno-types="tampermonkey"
import type {} from "tampermonkey";

export const setGmXhr = (xmlhttpRequest: typeof gmXhr) => {
  gmXhr = xmlhttpRequest;
};

export let gmXhr: typeof GM_xmlhttpRequest | undefined;
