import { createPageAtom } from "../atoms/create_page_atom.ts";
import { CircledX } from "../components/icons.tsx";
import { Image, LinkColumn, Overlay, Spinner } from "../components/spinner.tsx";
import { MouseEventHandler, useAtomValue, useSetAtom } from "../deps.ts";

export const Page = ({
  fullWidth,
  atom,
  ...props
}: {
  atom: ReturnType<typeof createPageAtom>;
  fullWidth?: boolean;
}) => {
  const { elementAtom, imageProps, reloadAtom, state: pageState } = useAtomValue(atom);
  const setElement = useSetAtom(elementAtom);
  const reload = useSetAtom(reloadAtom);
  const { state } = pageState;

  const reloadErrored: MouseEventHandler = async (event) => {
    event.stopPropagation();
    await reload();
  };

  return (
    <Overlay ref={setElement} placeholder={state !== "complete"} fullWidth={fullWidth}>
      {state === "loading" && <Spinner />}
      {state === "error" && (
        <LinkColumn onClick={reloadErrored}>
          <CircledX />
          <p>이미지를 불러오지 못했습니다</p>
          <p>
            {pageState.urls?.join("\n")}
          </p>
        </LinkColumn>
      )}
      <Image {...imageProps} {...props} />
    </Overlay>
  );
};
