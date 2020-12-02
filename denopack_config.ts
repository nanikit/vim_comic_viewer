import {
  OutputOptions,
  RollupOptions,
  useCache,
} from 'https://deno.land/x/denopack@0.10.0/mod.ts';

const json = Deno.readTextFileSync('./tsconfig.json');
const compilerOptions = JSON.parse(json).compilerOptions;

const wrapByExecutor = (dependencies: string[], body: string) => {
  return `'use strict';

unsafeWindow.process = { env: { NODE_ENV: 'development' } };

if (typeof define !== 'function') {
  throw new Error('requirejs not found.');
}

for (const name of ${JSON.stringify(dependencies)}) {
  const body = \`\${GM_getResourceText(name)}\`;
  define(name, Function('require', 'exports', 'module', body));
}

define('main', (require, exports, module) => {
${body}
});

require(['main']);
`;
};

const bannerPlugin = () => {
  return {
    name: 'tampermonkey-header-plugin',
    generateBundle: (
      _options: OutputOptions,
      bundle: { [fileName: string]: AssetInfo | ChunkInfo },
      _isWrite: boolean,
    ) => {
      for (const [_name, output] of Object.entries(bundle)) {
        if (output.type !== 'chunk') {
          continue;
        }
        const header = output.code.match(
          /(?:^\s*\/\/.*\r?\n?)*?(?:^\s*\/\/.*?==UserScript==.*?\r?\n?)(?:^\s*\/\/.*\r?\n?)+/m,
        )?.[0];
        if (!header) {
          continue;
        }

        let transforming = output.code.replace(header, '');

        const dependencies = [...header.matchAll(/@resource\s+(\S+)\s+.*?\.js$/gm)];
        if (dependencies.length) {
          const aliases = dependencies.map((x) => x[1]);
          transforming = wrapByExecutor(aliases, transforming);
        }

        transforming = header + transforming;
        output.code = transforming;
      }
    },
  };
};

// it supports es module
// const react = 'https://cdn.skypack.dev/react@17.0.1';
// const reactDom = 'https://cdn.skypack.dev/react-dom@17.0.1';

const config: RollupOptions = {
  external: ['react', 'react-dom', '@stitches/react'],
  plugins: [...useCache({ compilerOptions }), bannerPlugin()],
  output: {
    format: 'cjs',
  },
};

export default config;

type AssetInfo = {
  fileName: string;
  name?: string;
  source: string | Uint8Array;
  type: 'asset';
};

type ChunkInfo = {
  code: string;
  dynamicImports: string[];
  exports: string[];
  facadeModuleId: string | null;
  fileName: string;
  implicitlyLoadedBefore: string[];
  imports: string[];
  importedBindings: { [imported: string]: string[] };
  isDynamicEntry: boolean;
  isEntry: boolean;
  isImplicitEntry: boolean;
  modules: {
    [id: string]: {
      renderedExports: string[];
      removedExports: string[];
      renderedLength: number;
      originalLength: number;
    };
  };
  name: string;
  referencedFiles: string[];
  type: 'chunk';
};
