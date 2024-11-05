import { Button } from "@headlessui/react";
import { logAtom } from "../../../../atoms/logger_atom.ts";
import { atom, useAtomValue } from "../../../../deps.ts";
import { i18nAtom } from "../../../../modules/i18n/atoms.ts";
import { styled } from "../../../../modules/stitches.ts";
import { toast } from "../../../../modules/toast.ts";
import { pageScrollMiddleAtom, scrollElementSizeAtom } from "../../../navigation/atoms.ts";

const debugAtom = atom((get) => {
  const log = get(logAtom);
  return JSON.stringify({
    url: location.href,
    version: GM.info.version,
    userAgent: navigator.userAgent,
    devicePixelRatio: globalThis.devicePixelRatio,
    viewerSize: get(scrollElementSizeAtom),
    middle: get(pageScrollMiddleAtom),
    log,
  });
});

const DebugTextarea = styled("textarea", {
  width: "100%",
  height: "10em",

  fontSize: "0.5em",
});

export function DebugTab() {
  const strings = useAtomValue(i18nAtom);
  const debug = useAtomValue(debugAtom);

  async function copy() {
    await navigator.clipboard.writeText(debug);
    toast.success(strings.copied);
  }

  return (
    <>
      <p>{strings.debugExplanation}</p>
      <Button onClick={copy}>{strings.copy}</Button>
      <DebugTextarea value={debug} />
    </>
  );
}
