import { iterateReader } from "https://deno.land/std@0.132.0/streams/conversion.ts";
import { useCache } from "https://raw.githubusercontent.com/jeiea/denopack/deno-1.20.3/mod.ts";
import type {
  Plugin,
  RollupOptions,
} from "https://raw.githubusercontent.com/jeiea/denopack/deno-1.20.3/mod.ts";

export type {
  Plugin,
  RollupOptions,
} from "https://raw.githubusercontent.com/jeiea/denopack/deno-1.20.3/mod.ts";

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
  for await (const chunk of iterateReader(process.stdout)) {
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

export const createConfig = (
  { tsconfig, importMap, plugins }: {
    tsconfig?: { compilerOptions: Deno.CompilerOptions };
    importMap?: { imports: Record<string, string> };
    plugins?: Plugin[];
  },
): RollupOptions => {
  const { imports } = importMap ?? {};
  const { compilerOptions } = tsconfig ?? {};

  return {
    external: imports ? [...Object.keys(imports)] : [],
    plugins: [...useCache({ compilerOptions }), ...(plugins ?? [])],
    output: {
      format: "cjs",
    },
  };
};
