import { PageAtom } from "../atoms/create_page_atom.ts";
import { i18nAtom } from "../atoms/i18n_atom.ts";
import { CircledX } from "../components/icons.tsx";
import { Image, LinkColumn, Overlay, Spinner } from "../components/spinner.tsx";
import { MouseEventHandler, useAtomValue, useSetAtom } from "../deps.ts";

export const Page = ({ atom, ...props }: { atom: PageAtom }) => {
  const { imageProps, fullWidth, reloadAtom, shouldBeOriginalSize, state: pageState, divAtom } =
    useAtomValue(atom);
  const strings = useAtomValue(i18nAtom);
  const reload = useSetAtom(reloadAtom);
  const setDiv = useSetAtom(divAtom);
  const { status } = pageState;

  const reloadErrored: MouseEventHandler = async (event) => {
    event.stopPropagation();
    await reload();
  };

  return (
    <Overlay
      ref={setDiv}
      placeholder={status !== "complete"}
      originalSize={shouldBeOriginalSize}
      fullWidth={fullWidth}
    >
      {status === "loading" && <Spinner />}
      {status === "error" && (
        <LinkColumn onClick={reloadErrored}>
          <CircledX />
          <p>{strings.failedToLoadImage}</p>
          <p>{pageState.urls?.join("\n")}</p>
        </LinkColumn>
      )}
      <Image {...imageProps} originalSize={shouldBeOriginalSize} {...props} />
    </Overlay>
  );
};
