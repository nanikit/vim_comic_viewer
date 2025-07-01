import { PageModel } from "../atoms/create_page_atom.ts";
import { CircledX } from "../components/icons.tsx";
import { Image, LinkColumn, Overlay, Spinner, Video } from "../components/spinner.tsx";
import { Atom, MouseEventHandler, useAtomValue, useSetAtom } from "../deps.ts";
import { i18nAtom } from "../modules/i18n/atoms.ts";

export const Page = ({ atom, ...props }: { atom: Atom<PageModel> }) => {
  const {
    imageProps,
    videoProps,
    fullWidth,
    reloadAtom,
    shouldBeOriginalSize,
    divCss,
    state: pageState,
    setDiv,
  } = useAtomValue(atom);
  const strings = useAtomValue(i18nAtom);
  const reload = useSetAtom(reloadAtom);
  const { status } = pageState;

  const reloadErrored: MouseEventHandler = async (event) => {
    event.stopPropagation();
    await reload("load");
  };

  return (
    <Overlay ref={setDiv} css={divCss} fullWidth={fullWidth}>
      {status === "loading" && <Spinner />}
      {status === "error" && (
        <LinkColumn onClick={reloadErrored}>
          <CircledX />
          <p>{strings.failedToLoadImage}</p>
          <p>{pageState.urls?.join("\n")}</p>
        </LinkColumn>
      )}
      {videoProps && <Video {...videoProps} originalSize={shouldBeOriginalSize} {...props} />}
      {imageProps && <Image {...imageProps} originalSize={shouldBeOriginalSize} {...props} />}
    </Overlay>
  );
};
