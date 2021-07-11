/** @jsx createElement */
import {
  ColumnNowrap,
  Image,
  Overlay,
  Spinner,
} from "../components/spinner.tsx";
import { useSourceController } from "../hooks/use_source_controller.ts";
import type { ImageSource } from "../types.ts";
import { createElement, useRef } from "react";
import { CircledX } from "../components/icons.tsx";

export const Page = ({
  source,
  observer,
  fullWidth,
  ...props
}: {
  source: ImageSource;
  observer?: IntersectionObserver;
  fullWidth?: boolean;
}) => {
  const ref = useRef<HTMLImageElement>();
  const controller = useSourceController({ source, ref, observer });
  const { state: { src, state, urls }, ...imageProps } = controller;

  return (
    <Overlay ref={ref} placeholder={state !== "complete"} fullWidth={fullWidth}>
      {state === "loading" && <Spinner />}
      {state === "error" && <ColumnNowrap>
        <CircledX />
        <p>이미지를 불러오지 못했습니다</p>
        <p>{src ? src : urls?.join("\n")}</p>
      </ColumnNowrap>}
      <Image {...(src ? { src } : {})} {...imageProps} {...props} />
    </Overlay>
  );
};
