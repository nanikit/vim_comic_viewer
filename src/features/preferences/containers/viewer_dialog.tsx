import { TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { BackdropDialog } from "../../../components/backdrop_dialog.tsx";
import { Tab, useAtomValue } from "../../../deps.ts";
import { i18nAtom } from "../../../modules/i18n/atoms.ts";
import { styled } from "../../../modules/stitches.ts";
import { HelpTab } from "./tabs/help_tab.tsx";
import { SettingsTab } from "./tabs/settings_tab.tsx";

export function ViewerDialog({ onClose }: { onClose: () => void }) {
  const strings = useAtomValue(i18nAtom);

  return (
    <BackdropDialog onClose={onClose}>
      <TabGroup>
        <TabList as={StyledTabList}>
          <Tab as={PlainTab}>{strings.settings}</Tab>
          <Tab as={PlainTab}>{strings.help}</Tab>
        </TabList>
        <TabPanels as={StyledTabPanels}>
          <TabPanel>
            <SettingsTab />
          </TabPanel>
          <TabPanel>
            <HelpTab />
          </TabPanel>
        </TabPanels>
      </TabGroup>
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

const StyledTabList = styled("div", {
  display: "flex",
  flexFlow: "row nowrap",
  gap: "0.5em",
});

const StyledTabPanels = styled("div", {
  marginTop: "1em",
});
