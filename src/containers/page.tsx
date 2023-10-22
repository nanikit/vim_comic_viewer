import { PageAtom } from "../atoms/create_page_atom.ts";
import { i18nAtom } from "../atoms/i18n_atom.ts";
import { CircledX } from "../components/icons.tsx";
import { Image, LinkColumn, Overlay, Spinner } from "../components/spinner.tsx";
import { MouseEventHandler, useAtomValue, useSetAtom } from "../deps.ts";

export const Page = ({ atom, ...props }: { atom: PageAtom }) => {
  const { imageProps, fullWidth, reloadAtom, isOriginalSize, state: pageState } = useAtomValue(
    atom,
  );
  const strings = useAtomValue(i18nAtom);
  const reload = useSetAtom(reloadAtom);
  const { state } = pageState;

  const reloadErrored: MouseEventHandler = async (event) => {
    event.stopPropagation();
    await reload();
  };

  return (
    <Overlay
      placeholder={state !== "complete"}
      originalSize={isOriginalSize}
      fullWidth={fullWidth}
    >
      {state === "loading" && <Spinner />}
      {state === "error" && (
        <LinkColumn onClick={reloadErrored}>
          <CircledX />
          <p>{strings.failedToLoadImage}</p>
          <p>{pageState.urls?.join("\n")}</p>
        </LinkColumn>
      )}
      <Image {...imageProps} originalSize={isOriginalSize} {...props} />
    </Overlay>
  );
};
