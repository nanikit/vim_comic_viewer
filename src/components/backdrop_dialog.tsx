import { ComponentProps, useEffect, useState } from "../deps.ts";
import { timeout } from "../utils.ts";
import { styled } from "../vendors/stitches.ts";

const Backdrop = styled("div", {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  background: "rgba(0, 0, 0, 0.5)",
  transition: "0.2s",

  variants: {
    isOpen: {
      true: {
        opacity: 1,
        pointerEvents: "auto",
      },
      false: {
        opacity: 0,
        pointerEvents: "none",
      },
    },
  },
});

const CenterDialog = styled("div", {
  minWidth: "20em",
  minHeight: "20em",

  transition: "0.2s",
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.2)",
});

export function BackdropDialog(
  { onClose, ...props }: ComponentProps<typeof CenterDialog> & { onClose: () => void },
) {
  const [isOpen, setIsOpen] = useState(false);

  const close = async () => {
    setIsOpen(false);
    await timeout(200);
    onClose();
  };

  const closeIfEnter = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      close();
      event.stopPropagation();
    }
  };

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <Backdrop isOpen={isOpen} onClick={close} onKeyDown={closeIfEnter}>
      <CenterDialog
        onClick={(event) => event.stopPropagation()}
        {...props}
      >
      </CenterDialog>
    </Backdrop>
  );
}
