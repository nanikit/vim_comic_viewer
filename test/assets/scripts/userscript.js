// deno-lint-ignore-file
"use strict";

define("main", (require, exports, module) => {
  var import_vim_comic_viewer = require("vim_comic_viewer");
  async function main() {
    const urls = [...document.querySelectorAll("img")].map((x) => x.src);
    await (0, import_vim_comic_viewer.initialize)({
      source: () => urls,
      noSyncScroll: true,
      onNextSeries: () => {
        window.onNextSeriesCount ??= 0;
        window.onNextSeriesCount++;
      },
      onPreviousSeries: () => {
        window.onPreviousSeriesCount ??= 0;
        window.onPreviousSeriesCount++;
      },
    });
  }
  main();
});

define("tampermonkey_grants", function () {
  Object.assign(window, { GM, unsafeWindow });
});
requirejs.config({ deps: ["tampermonkey_grants"] });
load();

async function load() {
  const links = GM.info.script.resources.filter((x) => x.name.startsWith("link:"));
  await Promise.all(links.map(async ({ name }) => {
    const script = await GM.getResourceText(name);
    define(name.replace("link:", ""), Function("require", "exports", "module", script));
  }));
  require(["main"], () => {}, console.error);
}
