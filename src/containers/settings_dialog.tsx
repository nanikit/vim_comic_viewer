import { useAtomValue } from "jotai";
import { i18nAtom } from "../atoms/i18n_atom.ts";
import {
  backgroundColorAtom,
  maxZoomInExponentAtom,
  maxZoomOutExponentAtom,
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

  gap: "10%",

  "&& > *": {
    fontSize: "1.3em",
    fontWeight: "medium",
    minWidth: "0",

    margin: 0,
    padding: 0,
  },

  "& > input": {
    appearance: "meter",
    border: "gray 1px solid",
    borderRadius: "0.2em",
    textAlign: "center",
  },

  ":first-child": {
    flex: "2 1 0",
  },
  ":nth-child(2)": {
    flex: "1 1 0",
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
  lineHeight: 1.5,
});

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const [maxZoomOutExponent, setMaxZoomOutExponent] = useAtom(maxZoomOutExponentAtom);
  const [maxZoomInExponent, setMaxZoomInExponent] = useAtom(maxZoomInExponentAtom);
  const [backgroundColor, setBackgroundColor] = useAtom(backgroundColorAtom);
  const [pageDirection, setPageDirection] = useAtom(pageDirectionAtom);
  const zoomOutExponentInputId = useId();
  const zoomInExponentInputId = useId();
  const colorInputId = useId();
  const pageDirectionInputId = useId();
  const strings = useAtomValue(i18nAtom);
  const maxZoomOut = formatMultiplier(maxZoomOutExponent);
  const maxZoomIn = formatMultiplier(maxZoomInExponent);

  return (
    <BackdropDialog css={{ gap: "1.3em" }} onClose={onClose}>
      <Title>{strings.settings}</Title>
      <ConfigRow>
        <label htmlFor={zoomOutExponentInputId}>{strings.maxZoomOut}: {maxZoomOut}</label>
        <input
          type="number"
          min={0}
          step={0.1}
          id={zoomOutExponentInputId}
          value={maxZoomOutExponent}
          onChange={(event) => {
            setMaxZoomOutExponent(event.currentTarget.valueAsNumber || 0);
          }}
        />
      </ConfigRow>
      <ConfigRow>
        <label htmlFor={zoomInExponentInputId}>{strings.maxZoomIn}: {maxZoomIn}</label>
        <input
          type="number"
          min={0}
          step={0.1}
          id={zoomInExponentInputId}
          value={maxZoomInExponent}
          onChange={(event) => {
            setMaxZoomInExponent(event.currentTarget.valueAsNumber || 0);
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

function formatMultiplier(maxZoomOutExponent: number) {
  return Math.sqrt(2) ** maxZoomOutExponent === Infinity
    ? "∞"
    : `${(Math.sqrt(2) ** maxZoomOutExponent).toPrecision(2)}x`;
}
