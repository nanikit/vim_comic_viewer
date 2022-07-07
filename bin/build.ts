import * as esbuild from "https://deno.land/x/esbuild@v0.14.49/mod.js";
import importMap from "../import_map.json" assert { type: "json" };

const banner = `// ==UserScript==
// @name           vim comic viewer
// @name:ko        vim comic viewer
// @description    Universal comic reader
// @description:ko 만화 뷰어 라이브러리
// @version        8.0.0
// @namespace      https://greasyfork.org/en/users/713014-nanikit
// @exclude        *
// @match          http://unused-field.space/
// @author         nanikit
// @license        MIT
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@1.2.8/dist/index.cjs
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.3/lib/browser.cjs
// @resource       object-assign    https://cdn.jsdelivr.net/npm/object-assign@4.1.1/index.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@18.2.0/cjs/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@18.2.0/cjs/react-dom.production.min.js
// @resource       scheduler        https://cdn.jsdelivr.net/npm/scheduler@0.23.0/cjs/scheduler.production.min.js
// ==/UserScript==
// deno-fmt-ignore-file
// deno-lint-ignore-file
`;

const main = async () => {
  const result = await esbuild.build({
    allowOverwrite: true,
    banner: { js: banner },
    bundle: true,
    charset: "utf8",
    target: ["es2020", "chrome80", "firefox70"],
    entryPoints: ["./src/mod.tsx"],
    external: Object.keys(importMap.imports),
    format: "cjs",
    outfile: "vim_comic_viewer.user.js",
    treeShaking: true,
    inject: ["./src/react_shim.ts"],
  });
  console.log("result:", result);
  esbuild.stop();
};

main().catch(console.error);
