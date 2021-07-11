/** @jsx createElement */
import { Image, LinkColumn, Overlay, Spinner } from "../components/spinner.tsx";
import { createElement, useCallback, useRef } from "react";
import { CircledX } from "../components/icons.tsx";
import { makePageController } from "../hooks/make_page_controller.ts";

export const Page = ({
  fullWidth,
  controller,
  ...props
}: {
  controller: ReturnType<typeof makePageController>;
  fullWidth?: boolean;
}) => {
  const ref = useRef<HTMLImageElement>();
  const imageProps = controller.useInstance({ ref });
  const { state, src, urls } = controller.state;

  const reloadErrored = useCallback(async (event: MouseEvent) => {
    event.stopPropagation();
    await controller.reload();
  }, []);

  return (
    <Overlay ref={ref} placeholder={state !== "complete"} fullWidth={fullWidth}>
      {state === "loading" && <Spinner />}
      {state === "error" && <LinkColumn onClick={reloadErrored}>
        <CircledX />
        <p>이미지를 불러오지 못했습니다</p>
        <p>{src ? src : urls?.join("\n")}</p>
      </LinkColumn>}
      <Image {...imageProps} {...props} />
    </Overlay>
  );
};
