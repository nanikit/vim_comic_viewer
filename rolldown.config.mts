import userscriptLinkPlugin from "jsr:@jeiea/unplugin-userscript-link/rolldown";
import denoVitePlugin from "npm:@deno/vite-plugin";
import { defineConfig, RolldownPluginOption } from "npm:rolldown";

export default defineConfig({
  input: "src/mod.tsx",
  output: {
    file: "vim_comic_viewer.user.js",
    format: "cjs",
  },
  inject: {
    vcvInject: "vcv-inject-node-env",
  },
  external: ["vcv-inject-node-env"],
  plugins: [userscriptLinkPlugin(), denoVitePlugin() as RolldownPluginOption],
});
