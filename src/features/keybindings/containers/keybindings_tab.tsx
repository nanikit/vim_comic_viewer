import { RESET, useAtom, useAtomValue, useEffect, useState } from "../../../deps.ts";
import { i18nAtom } from "../../../modules/i18n/atoms.ts";
import { styled } from "../../../modules/stitches.ts";
import { keyBindingsAtom } from "../atoms.ts";
import {
  defaultKeyBindings,
  elementActions,
  getKeyDisplayName,
  globalActions,
  type KeyAction,
} from "../models.ts";

export function KeyBindingsTab() {
  const [bindings, setBindings] = useAtom(keyBindingsAtom);
  const [editingAction, setEditingAction] = useState<KeyAction | null>(null);
  const strings = useAtomValue(i18nAtom);

  useEffect(() => {
    if (!editingAction) return;

    const handler = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const newKeys = [...bindings[editingAction]];
      if (!newKeys.includes(event.code)) {
        newKeys.push(event.code);
        void setBindings({ [editingAction]: newKeys });
      }
      setEditingAction(null);
    };

    addEventListener("keydown", handler, { capture: true });
    return () => removeEventListener("keydown", handler, { capture: true });
  }, [editingAction, bindings, setBindings]);

  const removeKey = (action: KeyAction, keyToRemove: string) => {
    const newKeys = bindings[action].filter((k) => k !== keyToRemove);
    void setBindings({ [action]: newKeys });
  };

  const resetAction = (action: KeyAction) => {
    void setBindings({ [action]: defaultKeyBindings[action] });
  };

  const resetAll = () => {
    void setBindings(RESET);
  };

  const allActions = [...globalActions, ...elementActions];

  return (
    <Container>
      <ActionList>
        {allActions.map((action) => (
          <ActionRow key={action}>
            <ActionName>{strings[action] ?? action}</ActionName>
            <KeysContainer>
              {bindings[action].map((key) => (
                <KeyBadge key={key}>
                  <kbd>{getKeyDisplayName(key)}</kbd>
                  <RemoveButton onClick={() => removeKey(action, key)}>×</RemoveButton>
                </KeyBadge>
              ))}
              {editingAction === action
                ? <KeyBadge css={{ background: "#ffffcc" }}>{strings.pressKey}</KeyBadge>
                : <AddButton onClick={() => setEditingAction(action)}>+</AddButton>}
            </KeysContainer>
            <ResetActionButton onClick={() => resetAction(action)}>↺</ResetActionButton>
          </ActionRow>
        ))}
      </ActionList>
      <ResetAllButton onClick={resetAll}>{strings.resetToDefault}</ResetAllButton>
    </Container>
  );
}

const Container = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "1em",
});

const ActionList = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "0.5em",
});

const ActionRow = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "0.5em",
  padding: "0.3em 0",
  borderBottom: "1px solid #eee",
});

const ActionName = styled("span", {
  flex: "0 0 40%",
  fontSize: "0.9em",
});

const KeysContainer = styled("div", {
  flex: 1,
  display: "flex",
  flexWrap: "wrap",
  gap: "0.3em",
  alignItems: "center",
});

const KeyBadge = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.2em",
  padding: "0.2em 0.4em",
  background: "#f0f0f0",
  border: "1px solid #ccc",
  borderRadius: "0.3em",
  fontSize: "0.85em",

  "& kbd": {
    fontFamily: "inherit",
  },
});

const RemoveButton = styled("button", {
  padding: 0,
  width: "1.2em",
  height: "1.2em",
  background: "none",
  border: "none",
  borderRadius: "50%",
  color: "#888",
  cursor: "pointer",
  fontSize: "1em",
  lineHeight: 1,

  "&:hover": {
    background: "#ffcccc",
    color: "#cc0000",
  },
});

const AddButton = styled("button", {
  padding: "0.2em 0.5em",
  background: "none",
  border: "1px dashed #888",
  borderRadius: "0.3em",
  color: "#888",
  cursor: "pointer",
  fontSize: "0.85em",

  "&:hover": {
    background: "#e8f5e9",
    borderColor: "#4caf50",
    color: "#4caf50",
  },
});

const ResetActionButton = styled("button", {
  padding: "0.2em 0.4em",
  background: "none",
  border: "none",
  color: "#888",
  cursor: "pointer",
  fontSize: "1em",

  "&:hover": {
    color: "#333",
  },
});

const ResetAllButton = styled("button", {
  padding: "0.4em 0.8em",
  alignSelf: "flex-start",
  background: "none",
  border: "1px solid #f44336",
  borderRadius: "0.3em",
  color: "#f44336",
  cursor: "pointer",
  fontSize: "0.9em",

  "&:hover": {
    background: "#ffebee",
  },
});
