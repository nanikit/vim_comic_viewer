import { PageAtom } from "../atoms/create_page_atom.ts";
import { i18nAtom } from "../atoms/i18n_atom.ts";
import { CircledX } from "../components/icons.tsx";
import { Image, LinkColumn, Overlay, Spinner, Video } from "../components/spinner.tsx";
import { MouseEventHandler, useAtomValue, useSetAtom } from "../deps.ts";

export const Page = ({ atom, ...props }: { atom: PageAtom }) => {
  const {
    imageProps,
    videoProps,
    fullWidth,
    reloadAtom,
    shouldBeOriginalSize,
    state: pageState,
    setDiv,
  } = useAtomValue(atom);
  const strings = useAtomValue(i18nAtom);
  const reload = useSetAtom(reloadAtom);
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
      {videoProps && <Video {...videoProps} originalSize={shouldBeOriginalSize} {...props} />}
      {imageProps && <Image {...imageProps} originalSize={shouldBeOriginalSize} {...props} />}
    </Overlay>
  );
};
