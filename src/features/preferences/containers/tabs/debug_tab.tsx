import { Button } from "@headlessui/react";
import { logAtom } from "../../../../atoms/logger_atom.ts";
import { atom, useAtomValue } from "../../../../deps.ts";
import { i18nAtom } from "../../../../modules/i18n/atoms.ts";
import { styled } from "../../../../modules/stitches.ts";
import { toast } from "../../../../modules/toast.ts";

const debugAtom = atom((get) => {
  const log = get(logAtom);
  const result = {
    url: location.href,
    userAgent: navigator.userAgent,
    devicePixelRatio: globalThis.devicePixelRatio,
    gmInfo: {
      ...GM.info,
      script: {
        ...GM.info.script,
        resources: undefined,
      },
      scriptMetaStr: undefined,
    },
    log,
  };
  console.log(result);
  return JSON.stringify(result, null, 2);
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
