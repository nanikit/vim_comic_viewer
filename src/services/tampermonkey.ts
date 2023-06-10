// @deno-types="tampermonkey"
import type {} from "tampermonkey";

export let tampermonkeyApi: {
  GM_xmlhttpRequest?: typeof GM_xmlhttpRequest;
  GM_setValue?: typeof GM_setValue;
  GM_getValue?: typeof GM_getValue;
} = {};

export function setTampermonkeyApi(api: typeof tampermonkeyApi) {
  tampermonkeyApi = api ?? {};
}
