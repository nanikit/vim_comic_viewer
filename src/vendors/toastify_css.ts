import { insertCss } from "../utils.ts";

insertToastifyCss();

async function insertToastifyCss() {
  insertCss(await GM.getResourceText("react-toastify-css"));
}
