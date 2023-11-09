import { i18nAtom } from "../atoms/i18n_atom.ts";
import { BackdropDialog } from "../components/backdrop_dialog.tsx";
import { Tab, useAtomValue } from "../deps.ts";
import { styled } from "../vendors/stitches.ts";
import { HelpTab } from "./tabs/help_tab.tsx";
import { SettingsTab } from "./tabs/settings_tab.tsx";

export function ViewerDialog({ onClose }: { onClose: () => void }) {
  const strings = useAtomValue(i18nAtom);

  return (
    <BackdropDialog onClose={onClose}>
      <Tab.Group>
        <Tab.List as={TabList}>
          <Tab as={PlainTab}>{strings.settings}</Tab>
          <Tab as={PlainTab}>{strings.help}</Tab>
        </Tab.List>
        <Tab.Panels as={TabPanels}>
          <Tab.Panel>
            <SettingsTab />
          </Tab.Panel>
          <Tab.Panel>
            <HelpTab />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </BackdropDialog>
  );
}

const PlainTab = styled("button", {
  flex: 1,

  padding: "0.5em 1em",

  background: "transparent",
  border: "none",
  borderRadius: "0.5em",
  color: "#888",
  cursor: "pointer",
  fontSize: "1.2em",
  fontWeight: "bold",
  textAlign: "center",

  '&[data-headlessui-state="selected"]': {
    border: "1px solid black",
    color: "black",
  },
  "&:hover": {
    color: "black",
  },
});

const TabList = styled("div", {
  display: "flex",
  flexFlow: "row nowrap",
  gap: "0.5em",
});

const TabPanels = styled("div", {
  marginTop: "1em",
});
