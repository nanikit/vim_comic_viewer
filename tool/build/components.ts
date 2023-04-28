import { parse } from "https://deno.land/std@0.183.0/flags/mod.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.17.18/mod.js";

export const commentRemovalPlugin: esbuild.Plugin = {
  name: "remove_comment",
  setup(build) {
    build.onEnd(async () => {
      const path = build.initialOptions.outfile;
      if (!path) {
        return;
      }

      const original = await Deno.readTextFile(path);
      const header = original.match(/^(\/\*[\s\S]*?\*\/|\/\/.*|\s+)*/)?.[0] ?? "";
      // https://regex101.com/r/Vq4U9X/1
      const stripped = original.replace(
        /(`[\s\S]*?`|"(?<!\\")(?:[^"\n\\]|\\.)*?")|\/\*[\s\S]*?\*\/|^\s*?\/\/.*\n|\/(?<!\\\/)\/.*/gm,
        "$1",
      );
      await Deno.writeTextFile(path, header + stripped);
    });
  },
};

export async function watchOrBuild(options: esbuild.BuildOptions) {
  const { watch } = parse(Deno.args, { boolean: ["watch"] });
  try {
    const context = await esbuild.context({
      allowOverwrite: true,
      bundle: true,
      charset: "utf8",
      target: ["es2020", "chrome80", "firefox70"],
      format: "cjs",
      treeShaking: true,
      ...options,
    });
    if (watch) {
      await context.watch({});
    } else {
      await context.rebuild();
      esbuild.stop();
    }
  } catch (error) {
    console.error(error);
    Deno.exit(1);
  }
}
