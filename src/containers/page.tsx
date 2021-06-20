/** @jsx createElement */
import {
  ColumnNowrap,
  Image,
  Overlay,
  Spinner,
} from "../components/spinner.tsx";
import { useSourceController } from "../hooks/use_source_controller.ts";
import type { ImageSource } from "../types.ts";
import { createElement, useEffect, useRef } from "react";
import { CircledX } from "../components/icons.tsx";

export const Page = ({
  source,
  observer,
  ...props
}: {
  source: ImageSource;
  observer?: IntersectionObserver;
}) => {
  const { state: { src, state }, ...imageProps } = useSourceController(source);
  const ref = useRef<HTMLImageElement>();

  useEffect(() => {
    const target = ref.current;
    if (target && observer) {
      observer.observe(target);
      return () => observer.unobserve(target);
    }
  }, [observer, ref.current]);

  return (
    <Overlay ref={ref} placeholder={state !== "complete"}>
      {state === "loading" && <Spinner />}
      {state === "error" && <ColumnNowrap>
        <CircledX />
        <p>이미지를 불러오지 못했습니다</p>
        <p>URL: {src ? src : JSON.stringify(src)}</p>
      </ColumnNowrap>}
      <Image {...(src ? { src } : {})} {...imageProps} {...props} />
    </Overlay>
  );
};
