import denoVitePlugin from "@deno/vite-plugin";
import userscriptLinkPlugin from "@jeiea/unplugin-userscript-link/rolldown";
import { defineConfig, RolldownPluginOption } from "rolldown";

export default defineConfig({
  input: "src/mod.tsx",
  output: [
    {
      file: "vim_comic_viewer.user.js",
      format: "cjs",
    },
    {
      file: "D:\\Repos\\jeiea\\2023\\10\\deno_tamperdav\\dav\\vim_comic_viewer.user.js",
      format: "cjs",
    },
  ],
  transform: {
    inject: {
      vcvInject: "vcv-inject-node-env",
    },
  },
  external: ["vcv-inject-node-env"],
  plugins: [userscriptLinkPlugin(), denoVitePlugin() as RolldownPluginOption],
});
