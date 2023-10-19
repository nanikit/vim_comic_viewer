import { useAtomValue, useSetAtom } from "jotai";
import { downloadAndSaveAtom, downloadProgressAtom } from "../atoms/downloader_atoms.ts";
import { CircularProgress } from "../components/circular_progress.tsx";
import { DownloadIcon, MenuIcon } from "../components/icons.tsx";
import { useState } from "../deps.ts";
import { styled } from "../vendors/stitches.ts";
import { SettingsDialog } from "./settings_dialog.tsx";

const LeftBottomFloat = styled("div", {
  position: "absolute",
  bottom: "0.5%",
  left: "0.5%",
  display: "flex",
  flexFlow: "column",
});

const MenuActions = styled("div", {
  display: "flex",
  alignItems: "center",
});

export function SupplementaryActionMenu() {
  const { value, text, error } = useAtomValue(downloadProgressAtom);
  const cancelDownload = useSetAtom(downloadProgressAtom);
  const downloadAndSave = useSetAtom(downloadAndSaveAtom);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <LeftBottomFloat>
      {!!text &&
        (
          <CircularProgress
            radius={50}
            strokeWidth={10}
            value={value ?? 0}
            text={text}
            error={error}
            onClick={cancelDownload}
          />
        )}
      <MenuActions>
        <DownloadIcon onClick={() => downloadAndSave()} />
        <MenuIcon
          onClick={() => {
            setIsOpen((value) => !value);
          }}
        />
      </MenuActions>
      <SettingsDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </LeftBottomFloat>
  );
}
