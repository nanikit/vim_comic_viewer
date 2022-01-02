import { createConfig, denoFmt, Plugin } from "./utils.ts";

const postprocessPlugin: Plugin = {
  name: "postprocess-plugin",

  banner: `// ==UserScript==
// @name           vim comic viewer
// @description    Universal comic reader
// @name:ko        vim comic viewer
// @description:ko 만화 뷰어 라이브러리
// @version        7.0.1
// @namespace      https://greasyfork.org/en/users/713014-nanikit
// @exclude        *
// @match          http://unused-field.space/
// @author         nanikit
// @license        MIT
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.2/lib/browser.cjs
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@1.2.6/dist/index.cjs
// ==/UserScript==
`,

  generateBundle: async (_options, bundle, _isWrite) => {
    for (const [_name, output] of Object.entries(bundle)) {
      if (output.type !== "chunk") {
        continue;
      }

      output.code = await denoFmt(output.code);
    }
  },
};

export default createConfig({
  importMap: new URL("import_map.json", import.meta.url),
  tsconfig: new URL("deno.tsconfig.json", import.meta.url),
  plugins: [postprocessPlugin],
});
