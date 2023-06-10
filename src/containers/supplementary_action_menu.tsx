import { CircularProgress } from "../components/circular_progress.tsx";
import { DownloadIcon, MenuIcon } from "../components/icons.tsx";
import { styled, useState } from "../deps.ts";
import { makeDownloader } from "../hooks/make_downloader.ts";

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
  { downloader, color, onColorChange }: {
    downloader: ReturnType<typeof makeDownloader>;
    color: string;
    onColorChange: (color: string) => void;
  },
) => {
  const { value, text, error } = downloader.progress ?? {};
  downloader.useInstance();

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
            onClick={downloader.cancelDownload}
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
            <DownloadIcon onClick={downloader.downloadWithProgress} />
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
