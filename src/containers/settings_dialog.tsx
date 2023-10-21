import { useAtom } from "jotai";
import { useId, useRef } from "react";
import {
  backgroundColorAtom,
  maxMagnificationRatioAtom,
  minMagnificationRatioAtom,
  pageDirectionAtom,
} from "../atoms/viewer_atoms.ts";
import { useClickAway } from "../hooks/use_click_away.ts";
import { styled } from "../vendors/stitches.ts";

const ColorInput = styled("input", {
  marginLeft: "20px",
});

const CenterDialog = styled("div", {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",

  display: "flex",
  flexFlow: "column nowrap",
  alignItems: "stretch",
  justifyContent: "center",

  transition: "0.2s",
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.2)",

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

const ConfigRow = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",

  margin: "10px 5px",
  gap: "10%",
});

const HiddenInput = styled("input", {
  opacity: 0,
  width: 0,
  height: 0,
});

const Toggle = styled("span", {
  "--width": "60px",

  "label": {
    position: "relative",

    display: "inline-flex",
    margin: 0,

    width: "var(--width)",
    height: "calc(var(--width) / 2)",
    borderRadius: "calc(var(--width) / 2)",
    cursor: "pointer",
    textIndent: "-9999px",
    background: "grey",
  },

  "label:after": {
    position: "absolute",
    top: "calc(var(--width) * 0.025)",
    left: "calc(var(--width) * 0.025)",

    width: "calc(var(--width) * 0.45)",
    height: "calc(var(--width) * 0.45)",
    borderRadius: "calc(var(--width) * 0.45)",
    content: "",
    background: "#fff",
    transition: "0.3s",
  },

  "input:checked + label": {
    background: "#bada55",
  },

  "input:checked + label:after": {
    left: "calc(var(--width) * 0.975)",
    transform: "translateX(-100%)",
  },

  "label:active:after": {
    width: "calc(var(--width) * 0.65)",
  },
});

export function SettingsDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useClickAway(dialogRef, onClose);

  const [minMagnificationRatio, setMinMagnificationRatio] = useAtom(minMagnificationRatioAtom);
  const [maxMagnificationRatio, setMaxMagnificationRatio] = useAtom(maxMagnificationRatioAtom);
  const [backgroundColor, setBackgroundColor] = useAtom(backgroundColorAtom);
  const [pageDirection, setPageDirection] = useAtom(pageDirectionAtom);
  const minRatioInputId = useId();
  const maxRatioInputId = useId();
  const colorInputId = useId();
  const pageDirectionInputId = useId();

  return (
    <CenterDialog ref={dialogRef} isOpen={isOpen}>
      <h3>Settings</h3>
      <ConfigRow>
        <label htmlFor={minRatioInputId}>Min magnification ratio</label>
        <input
          type="number"
          step={0.1}
          id={minRatioInputId}
          value={minMagnificationRatio}
          onChange={(event) => {
            setMinMagnificationRatio(event.currentTarget.valueAsNumber);
          }}
        />
      </ConfigRow>
      <ConfigRow>
        <label htmlFor={maxRatioInputId}>Max magnification ratio</label>
        <input
          type="number"
          step={0.1}
          id={maxRatioInputId}
          value={maxMagnificationRatio}
          onChange={(event) => {
            setMaxMagnificationRatio(event.currentTarget.valueAsNumber);
          }}
        />
      </ConfigRow>
      <ConfigRow>
        <label htmlFor={colorInputId}>Background</label>
        <ColorInput
          type="color"
          id={colorInputId}
          value={backgroundColor}
          onChange={(event) => {
            setBackgroundColor(event.currentTarget.value);
          }}
        />
      </ConfigRow>
      <ConfigRow>
        <p>Left to right</p>
        <Toggle>
          <HiddenInput
            type="checkbox"
            id={pageDirectionInputId}
            checked={pageDirection === "leftToRight"}
            onChange={(event) => {
              setPageDirection(event.currentTarget.checked ? "leftToRight" : "rightToLeft");
            }}
          />
          <label htmlFor={pageDirectionInputId}>Left to right</label>
        </Toggle>
      </ConfigRow>
    </CenterDialog>
  );
}
