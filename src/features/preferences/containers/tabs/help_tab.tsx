import { atom, ReactNode, useAtomValue } from "../../../../deps.ts";
import { i18nAtom } from "../../../../modules/i18n/atoms.ts";
import { styled } from "../../../../modules/stitches.ts";

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
    [
      strings.nextPage,
      <>
        <kbd>j</kbd>, <kbd>↓</kbd>, <kbd>q</kbd>
      </>,
    ],
    [
      strings.previousPage,
      <>
        <kbd>k</kbd>, <kbd>↑</kbd>
      </>,
    ],
    [strings.download, <kbd>;</kbd>],
    [strings.refresh, <kbd>'</kbd>],
    [strings.increaseSinglePageCount, <kbd>/</kbd>],
    [strings.decreaseSinglePageCount, <kbd>?</kbd>],
  ] as [ReactNode, ReactNode][];
});

const ActionName = styled("td", {
  width: "50%",
});
