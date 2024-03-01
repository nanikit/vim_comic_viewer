import { useAtomValue } from "jotai";
import { downloadAndSaveAtom } from "../atoms/downloader_atoms.tsx";
import { scrollElementAtom } from "../atoms/navigation_atoms.ts";
import { DownloadButton, SettingsButton } from "../components/icons.tsx";
import { useSetAtom, useState } from "../deps.ts";
import { ViewerDialog } from "../features/preferences/containers/viewer_dialog.tsx";
import { styled } from "../vendors/stitches.ts";

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
  const scrollable = useAtomValue(scrollElementAtom);

  const closeDialog = () => {
    setIsOpen(false);
    scrollable?.focus();
  };

  return (
    <>
      <LeftBottomFloat>
        <MenuActions>
          <SettingsButton onClick={() => setIsOpen((value) => !value)} />
          <DownloadButton onClick={() => downloadAndSave()} />
        </MenuActions>
      </LeftBottomFloat>
      {isOpen && <ViewerDialog onClose={closeDialog} />}
    </>
  );
}
