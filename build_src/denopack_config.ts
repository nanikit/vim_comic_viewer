import { createConfig, denoFmt, Plugin } from "./utils.ts";

const postprocessPlugin: Plugin = {
  name: "postprocess-plugin",

  banner: `// ==UserScript==
// @name         vim comic viewer
// @description  Universal comic reader
// @version      3.3.0
// @namespace    https://greasyfork.org/en/users/713014-nanikit
// @exclude      *
// @match        http://unused-field.space/
// @author       nanikit
// @license      MIT
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
