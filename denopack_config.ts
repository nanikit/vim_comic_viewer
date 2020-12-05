import {
  OutputOptions,
  RollupOptions,
  useCache,
} from 'https://deno.land/x/denopack@0.10.0/mod.ts';

const json = Deno.readTextFileSync('./tsconfig.json');
const compilerOptions = JSON.parse(json).compilerOptions;

const postprocessPlugin = {
  name: 'postprocess-plugin',

  banner: `// ==UserScript==
// @name         vim comic viewer
// @description  Universal comic reader
// @version      1.1.0
// @namespace    https://openuserjs.org/users/keut
// @exclude      *
// @match        http://unused-field.space/
// @author       keut
// @license      MIT
// ==/UserScript==
`,

  generateBundle: async (
    _options: OutputOptions,
    bundle: { [fileName: string]: AssetInfo | ChunkInfo },
    _isWrite: boolean,
  ) => {
    for (const [_name, output] of Object.entries(bundle)) {
      if (output.type !== 'chunk') {
        continue;
      }

      const process = Deno.run({
        cmd: ['deno', 'fmt', '-'],
        stdin: 'piped',
        stdout: 'piped',
      });
      const input = new TextEncoder().encode(output.code);
      await process.stdin.write(input);
      process.stdin.close();

      const formatteds = [];
      const accumulates = [0];
      let sum = 0;
      for await (const chunk of Deno.iter(process.stdout)) {
        formatteds.push(new Uint8Array(chunk));
        sum += chunk.length;
        accumulates.push(sum);
      }

      const concatenated = new Uint8Array(sum);
      for (let i = 0; i < formatteds.length; i++) {
        concatenated.set(formatteds[i], accumulates[i]);
      }
      const decoded = new TextDecoder().decode(concatenated);
      output.code = decoded;
    }
  },
};

const config: RollupOptions = {
  external: ['react', 'react-dom', '@stitches/react'],
  plugins: [...useCache({ compilerOptions }), postprocessPlugin],
  output: {
    format: 'cjs',
  },
};

type AssetInfo = {
  type: 'asset';
};

type ChunkInfo = {
  code: string;
  type: 'chunk';
};

export default config;
