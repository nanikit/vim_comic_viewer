import { createConfig, denoFmt, Plugin } from "./utils.ts";

const postprocessPlugin: Plugin = {
  name: "postprocess-plugin",

  banner: `// ==UserScript==
// @name         vim comic viewer
// @description  Universal comic reader
// @version      6.2.0
// @namespace    https://greasyfork.org/en/users/713014-nanikit
// @exclude      *
// @match        http://unused-field.space/
// @author       nanikit
// @license      MIT
// @resource     fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.1/lib/browser.cjs
// @resource     react            https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// @resource     react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js
// @resource     @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.2.0/dist/index.cjs
// @resource     @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.2.0/dist/index.cjs
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
