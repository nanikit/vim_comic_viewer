import {
  Plugin,
  useCache,
} from "https://raw.githubusercontent.com/jeiea/denopack/patch/mod.ts";
import { iter } from "https://deno.land/std@0.97.0/io/util.ts";
import type { RollupOptions } from "https://raw.githubusercontent.com/jeiea/denopack/patch/mod.ts";

export type {
  Plugin,
  RollupOptions,
} from "https://raw.githubusercontent.com/jeiea/denopack/patch/mod.ts";

export const denoFmt = async (code: string) => {
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

const readJson = async (path: string | URL): Promise<any> => {
  const json = await Deno.readTextFile(path);
  return JSON.parse(json);
};

export const createConfig = async (
  { tsconfig, importMap, plugins }: {
    tsconfig?: string | URL;
    importMap?: string | URL;
    plugins?: Plugin[];
  },
): Promise<RollupOptions> => {
  const [{ compilerOptions }, { imports }] = await Promise.all([
    tsconfig ? readJson(tsconfig) : {},
    importMap ? readJson(importMap) : {},
  ]);

  return {
    external: [...Object.keys(imports)],
    plugins: [...useCache({ compilerOptions }), ...(plugins ?? [])],
    output: {
      format: "cjs",
    },
  };
};
