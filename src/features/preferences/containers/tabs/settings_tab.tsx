import { isFullscreenPreferredSettingsAtom } from "../../../../atoms/fullscreen_atom.ts";
import { RESET, useAtom, useAtomValue, useId, useState } from "../../../../deps.ts";
import { i18nAtom } from "../../../../modules/i18n/atoms.ts";
import { styled } from "../../../../modules/stitches.ts";
import { singlePageCountAtom } from "../../../navigation/atoms.ts";
import {
  backgroundColorAtom,
  maxZoomInExponentAtom,
  maxZoomOutExponentAtom,
  pageDirectionAtom,
} from "../../atoms.ts";

export function SettingsTab() {
  const [maxZoomOutExponent, setMaxZoomOutExponent] = useAtom(maxZoomOutExponentAtom);
  const [maxZoomInExponent, setMaxZoomInExponent] = useAtom(maxZoomInExponentAtom);
  const [singlePageCount, setSinglePageCount] = useAtom(singlePageCountAtom);
  const [backgroundColor, setBackgroundColor] = useAtom(backgroundColorAtom);
  const [pageDirection, setPageDirection] = useAtom(pageDirectionAtom);
  const [isFullscreenPreferred, setIsFullscreenPreferred] = useAtom(
    isFullscreenPreferredSettingsAtom,
  );

  const zoomOutExponentInputId = useId();
  const zoomInExponentInputId = useId();
  const singlePageCountInputId = useId();
  const colorInputId = useId();
  const pageDirectionInputId = useId();
  const fullscreenInputId = useId();
  const strings = useAtomValue(i18nAtom);
  const [isResetConfirming, setResetConfirming] = useState(false);

  const maxZoomOut = formatMultiplier(maxZoomOutExponent);
  const maxZoomIn = formatMultiplier(maxZoomInExponent);

  function tryReset() {
    if (!isResetConfirming) {
      setResetConfirming(true);
      return;
    }

    setMaxZoomInExponent(RESET);
    setMaxZoomOutExponent(RESET);
    setSinglePageCount(RESET);
    setBackgroundColor(RESET);
    setPageDirection(RESET);
    setIsFullscreenPreferred(RESET);
    setResetConfirming(false);
  }

  return (
    <ConfigSheet>
      <ConfigRow>
        <ConfigLabel htmlFor={zoomOutExponentInputId}>
          {strings.maxZoomOut}: {maxZoomOut}
        </ConfigLabel>
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
        <ConfigLabel htmlFor={zoomInExponentInputId}>{strings.maxZoomIn}: {maxZoomIn}</ConfigLabel>
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
        <ConfigLabel htmlFor={singlePageCountInputId}>{strings.singlePageCount}</ConfigLabel>
        <input
          type="number"
          min={0}
          step={1}
          id={singlePageCountInputId}
          value={singlePageCount}
          onChange={(event) => {
            setSinglePageCount(event.currentTarget.valueAsNumber || 0);
          }}
        />
      </ConfigRow>
      <ConfigRow>
        <ConfigLabel htmlFor={colorInputId}>{strings.backgroundColor}</ConfigLabel>
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
        <p>{strings.useFullScreen}</p>
        <Toggle>
          <HiddenInput
            type="checkbox"
            id={fullscreenInputId}
            checked={isFullscreenPreferred}
            onChange={(event) => {
              setIsFullscreenPreferred(event.currentTarget.checked);
            }}
          />
          <label htmlFor={fullscreenInputId}>{strings.useFullScreen}</label>
        </Toggle>
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
      <ResetButton onClick={tryReset}>
        {isResetConfirming ? strings.doYouReallyWantToReset : strings.reset}
      </ResetButton>
    </ConfigSheet>
  );
}

function formatMultiplier(maxZoomOutExponent: number) {
  return Math.sqrt(2) ** maxZoomOutExponent === Infinity
    ? "∞"
    : `${(Math.sqrt(2) ** maxZoomOutExponent).toPrecision(2)}x`;
}

const ConfigLabel = styled("label", {
  margin: 0,
});

const ResetButton = styled("button", {
  padding: "0.2em 0.5em",

  background: "none",
  border: "red 1px solid",
  borderRadius: "0.2em",
  color: "red",
  cursor: "pointer",
  transition: "0.3s",

  "&:hover": {
    background: "#ffe0e0",
  },
});

const ColorInput = styled("input", {
  height: "1.5em",
});

const ConfigRow = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",

  gap: "10%",

  "&& > *": {
    fontSize: "1em",
    fontWeight: "medium",
    minWidth: 0,
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

const ConfigSheet = styled("div", {
  display: "flex",
  flexFlow: "column nowrap",
  alignItems: "stretch",
  gap: "0.8em",
});
