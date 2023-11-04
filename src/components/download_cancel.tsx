import { i18nAtom } from "../atoms/i18n_atom.ts";
import { useAtomValue } from "../deps.ts";
import { styled } from "../vendors/stitches.ts";

export function DownloadCancel({ onClick }: { onClick?: () => void }) {
  const strings = useAtomValue(i18nAtom);
  return (
    <SpaceBetween>
      <p>{strings.downloading}</p>
      <button onClick={onClick}>{strings.cancel}</button>
    </SpaceBetween>
  );
}

const SpaceBetween = styled("div", {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
});
