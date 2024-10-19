import { insertCss } from "../utils.ts";

export { useOverlayScrollbars } from "overlayscrollbars-react";

GM.getResourceText("overlayscrollbars-css").then(insertCss);
