import { downloadAndSaveAtom } from "../atoms/downloader_atoms.tsx";
import { DownloadIcon, IconSettings } from "../components/icons.tsx";
import { useSetAtom, useState } from "../deps.ts";
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
  const downloadAndSave = useSetAtom(downloadAndSaveAtom);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <LeftBottomFloat>
        <MenuActions>
          <IconSettings
            onClick={() => {
              setIsOpen((value) => !value);
            }}
          />
          <DownloadIcon onClick={() => downloadAndSave()} />
        </MenuActions>
      </LeftBottomFloat>
      {isOpen && <SettingsDialog onClose={() => setIsOpen(false)} />}
    </>
  );
}
