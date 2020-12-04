import { RollupOptions, useCache } from 'https://deno.land/x/denopack@0.10.0/mod.ts';

const json = Deno.readTextFileSync('./tsconfig.json');
const compilerOptions = JSON.parse(json).compilerOptions;

const config: RollupOptions = {
  external: ['react', 'react-dom', '@stitches/react'],
  plugins: [
    ...useCache({ compilerOptions }),
    {
      name: 'banner',
      banner: `// ==UserScript==
// @name         vim comic viewer
// @description  Universal comic reader
// @version      1.0.0
// @namespace    https://openuserjs.org/users/keut
// @exclude      *
// @match        http://unused-field.space/
// @author       keut
// @license      MIT
// ==/UserScript==
`,
    },
  ],
  output: {
    format: 'cjs',
  },
};

export default config;
