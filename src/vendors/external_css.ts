import { insertCss } from "../utils.ts";

insertVendorCss();

async function insertVendorCss() {
  await Promise.all([
    GM.getResourceText("react-toastify-css").then(insertCss),
    GM.getResourceText("overlayscrollbars-css").then(insertCss),
  ]);
}
