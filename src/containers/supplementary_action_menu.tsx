import { useAtomValue, useSetAtom } from "jotai";
import { downloadAndSaveAtom, downloadProgressAtom } from "../atoms/downloader_atoms.ts";
import { CircularProgress } from "../components/circular_progress.tsx";
import { DownloadIcon, MenuIcon } from "../components/icons.tsx";
import { styled, useState } from "../deps.ts";

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

const ColorInput = styled("input", {
  marginLeft: "20px",
});

export const SupplementaryActionMenu = (
  { color, onColorChange }: {
    color: string;
    onColorChange: (color: string) => void;
  },
) => {
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
        <MenuIcon
          onClick={() => {
            setIsOpen((value) => !value);
          }}
        />
        {!!isOpen && (
          <>
            <DownloadIcon onClick={() => downloadAndSave()} />
            <ColorInput
              type="color"
              value={color}
              onChange={(event) => {
                onColorChange?.(event.currentTarget.value);
              }}
            />
          </>
        )}
      </MenuActions>
    </LeftBottomFloat>
  );
};
