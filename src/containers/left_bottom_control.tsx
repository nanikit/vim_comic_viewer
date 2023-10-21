import { downloadAndSaveAtom, downloadProgressAtom } from "../atoms/downloader_atoms.ts";
import { CircularProgress } from "../components/circular_progress.tsx";
import { DownloadIcon, MenuIcon } from "../components/icons.tsx";
import { useAtomValue, useSetAtom, useState } from "../deps.ts";
import { styled } from "../vendors/stitches.ts";
import { SettingsDialog } from "./settings_dialog.tsx";

const LeftBottomFloat = styled("div", {
  position: "absolute",
  bottom: "1%",
  left: "1%",
  display: "flex",
  flexFlow: "column",
});

const MenuActions = styled("div", {
  display: "flex",
  flexFlow: "column nowrap",
  alignItems: "center",
  gap: "16px",
});

export function LeftBottomControl() {
  const { value, text, error } = useAtomValue(downloadProgressAtom);
  const cancelDownload = useSetAtom(downloadProgressAtom);
  const downloadAndSave = useSetAtom(downloadAndSaveAtom);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
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
          <MenuIcon
            onClick={() => {
              setIsOpen((value) => !value);
            }}
          />
          <DownloadIcon onClick={() => downloadAndSave()} />
        </MenuActions>
      </LeftBottomFloat>
      <SettingsDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
