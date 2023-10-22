import { useAtomValue } from "jotai";
import { i18nAtom } from "../atoms/i18n_atom.ts";
import {
  backgroundColorAtom,
  maxMagnificationRatioAtom,
  minMagnificationRatioAtom,
  pageDirectionAtom,
} from "../atoms/setting_atoms.ts";
import { BackdropDialog } from "../components/backdrop_dialog.tsx";
import { useAtom, useId } from "../deps.ts";
import { styled } from "../vendors/stitches.ts";

const ColorInput = styled("input", {
  height: "1.5em",
});

const ConfigRow = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",

  margin: "10px 5px",
  gap: "10%",
  fontSize: "1.3em",
  fontWeight: "medium",

  ":first-child": {
    flex: "2 1 0",
  },
  ":nth-child(2)": {
    flex: "1 1 0",
    minWidth: "0",
  },
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

const Title = styled("h3", {
  fontSize: "2em",
  fontWeight: "bold",
});

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const [minMagnificationRatio, setMinMagnificationRatio] = useAtom(minMagnificationRatioAtom);
  const [maxMagnificationRatio, setMaxMagnificationRatio] = useAtom(maxMagnificationRatioAtom);
  const [backgroundColor, setBackgroundColor] = useAtom(backgroundColorAtom);
  const [pageDirection, setPageDirection] = useAtom(pageDirectionAtom);
  const minRatioInputId = useId();
  const maxRatioInputId = useId();
  const colorInputId = useId();
  const pageDirectionInputId = useId();

  const strings = useAtomValue(i18nAtom);
  // useClickAway(dialogRef, onClose);

  return (
    <BackdropDialog onClose={onClose}>
      <Title>{strings.settings}</Title>
      <ConfigRow>
        <label htmlFor={minRatioInputId}>{strings.minMagnificationRatio}</label>
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
        <label htmlFor={maxRatioInputId}>{strings.maxMagnificationRatio}</label>
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
        <label htmlFor={colorInputId}>{strings.backgroundColor}</label>
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
        <p>{strings.leftToRight}</p>
        <Toggle>
          <HiddenInput
            type="checkbox"
            id={pageDirectionInputId}
            checked={pageDirection === "leftToRight"}
            onChange={(event) => {
              setPageDirection(event.currentTarget.checked ? "leftToRight" : "rightToLeft");
            }}
          />
          <label htmlFor={pageDirectionInputId}>{strings.leftToRight}</label>
        </Toggle>
      </ConfigRow>
    </BackdropDialog>
  );
}
