import { i18nAtom } from "../../atoms/i18n_atom.ts";
import { atom, ReactNode, useAtomValue } from "../../deps.ts";
import { styled } from "../../vendors/stitches.ts";

export function HelpTab() {
  const keyBindings = useAtomValue(keyBindingsAtom);
  const strings = useAtomValue(i18nAtom);

  return (
    <>
      <p>{strings.keyBindings}</p>
      <table>
        {keyBindings.map(([action, keyBinding]) => (
          <tr>
            <ActionName>{action}</ActionName>
            <td>{keyBinding}</td>
          </tr>
        ))}
      </table>
    </>
  );
}

const keyBindingsAtom = atom((get) => {
  const strings = get(i18nAtom);
  return [
    [
      strings.toggleViewer,
      <>
        <kbd>i</kbd>, <kbd>Enter⏎</kbd>, <kbd>NumPad0</kbd>
      </>,
    ],
    [
      strings.toggleFullscreenSetting,
      <>
        <kbd>⇧Shift</kbd>+(<kbd>i</kbd>, <kbd>Enter⏎</kbd>, <kbd>NumPad0</kbd>)
      </>,
    ],
    [strings.nextPage, <kbd>j</kbd>],
    [strings.previousPage, <kbd>k</kbd>],
    [strings.download, <kbd>;</kbd>],
    [strings.refresh, <kbd>'</kbd>],
    [strings.increaseSinglePageCount, <kbd>/</kbd>],
    [strings.decreaseSinglePageCount, <kbd>?</kbd>],
  ] as [ReactNode, ReactNode][];
});

const ActionName = styled("td", {
  width: "50%",
});
