import {
  OutputOptions,
  RollupOptions,
  useCache,
} from "https://raw.githubusercontent.com/kt3k/denopack/chore/deno-1.7.1/mod.ts";
import { iter } from "https://deno.land/std@0.97.0/io/util.ts";

const denoFmt = async (code: string) => {
  const process = Deno.run({
    cmd: ["deno", "fmt", "-"],
    stdin: "piped",
    stdout: "piped",
  });
  const input = new TextEncoder().encode(code);
  await process.stdin.write(input);
  process.stdin.close();

  const formatteds = [];
  const accumulates = [0];
  let sum = 0;
  for await (const chunk of iter(process.stdout)) {
    formatteds.push(new Uint8Array(chunk));
    sum += chunk.length;
    accumulates.push(sum);
  }

  const concatenated = new Uint8Array(sum);
  for (let i = 0; i < formatteds.length; i++) {
    concatenated.set(formatteds[i], accumulates[i]);
  }
  const decoded = new TextDecoder().decode(concatenated);
  return decoded;
};

const postprocessPlugin = {
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

  generateBundle: async (
    _options: OutputOptions,
    bundle: { [fileName: string]: AssetInfo | ChunkInfo },
    _isWrite: boolean,
  ) => {
    for (const [_name, output] of Object.entries(bundle)) {
      if (output.type !== "chunk") {
        continue;
      }

      output.code = await denoFmt(output.code);
    }
  },
};

const json = Deno.readTextFileSync("./build_src/deno.tsconfig.json");
const compilerOptions = JSON.parse(json).compilerOptions;
const importMap = JSON.parse(
  Deno.readTextFileSync("./build_src/import_map.json"),
);

const config: RollupOptions = {
  external: [...Object.keys(importMap.imports)],
  plugins: [...useCache({ compilerOptions }), postprocessPlugin],
  output: {
    format: "cjs",
  },
};

type AssetInfo = {
  type: "asset";
};

type ChunkInfo = {
  code: string;
  type: "chunk";
};

export default config;
