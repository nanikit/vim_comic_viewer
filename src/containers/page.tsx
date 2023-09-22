import { useAtomValue } from "jotai";
import { CircledX } from "../components/icons.tsx";
import { Image, LinkColumn, Overlay, Spinner } from "../components/spinner.tsx";
import { MouseEventHandler, useCallback, useRef } from "../deps.ts";
import { createPageAtom } from "../hooks/create_page_atom.ts";

export const Page = ({
  fullWidth,
  atom,
  ...props
}: {
  atom: ReturnType<typeof createPageAtom>;
  fullWidth?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const controller = useAtomValue(atom);
  const imageProps = controller.useInstance({ ref });
  const { state, src, urls } = controller.state;

  const reloadErrored: MouseEventHandler = useCallback(async (event) => {
    event.stopPropagation();
    await controller.reload();
  }, []);

  return (
    <Overlay ref={ref} placeholder={state !== "complete"} fullWidth={fullWidth}>
      {state === "loading" && <Spinner />}
      {state === "error" && (
        <LinkColumn onClick={reloadErrored}>
          <CircledX />
          <p>이미지를 불러오지 못했습니다</p>
          <p>
            {src ? src : urls?.join("\n")}
          </p>
        </LinkColumn>
      )}
      <Image {...imageProps} {...props} />
    </Overlay>
  );
};
