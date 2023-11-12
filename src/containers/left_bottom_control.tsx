import { useAtomValue } from "jotai";
import { downloadAndSaveAtom } from "../atoms/downloader_atoms.tsx";
import { scrollElementAtom } from "../atoms/navigation_atoms.ts";
import { DownloadIcon, IconSettings } from "../components/icons.tsx";
import { useSetAtom, useState } from "../deps.ts";
import { styled } from "../vendors/stitches.ts";
import { ViewerDialog } from "./viewer_dialog.tsx";

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
          <IconSettings
            onClick={() => {
              setIsOpen((value) => !value);
            }}
          />
          <DownloadIcon onClick={() => downloadAndSave()} />
        </MenuActions>
      </LeftBottomFloat>
      {isOpen && <ViewerDialog onClose={closeDialog} />}
    </>
  );
}
