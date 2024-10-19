import { insertCss } from "../utils.ts";

export { type Id, toast, ToastContainer } from "react-toastify";

GM.getResourceText("react-toastify-css").then(insertCss);
