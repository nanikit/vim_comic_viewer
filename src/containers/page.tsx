/** @jsx createElement */
import { Image, Overlay, Spinner } from "../components/spinner.tsx";
import { usePageReducer } from "../hooks/use_page_reducer.ts";
import type { ImageSource } from "../types.ts";
import { createElement, useEffect, useRef } from "react";

export const Page = ({
  source,
  observer,
  ...props
}: {
  source: ImageSource;
  observer?: IntersectionObserver;
}) => {
  const [{ status, src, ...imageProps }] = usePageReducer(source);
  const ref = useRef<HTMLImageElement>();

  useEffect(() => {
    const target = ref.current;
    if (target && observer) {
      observer.observe(target);
      return () => observer.unobserve(target);
    }
  }, [observer, ref.current]);

  return (
    <Overlay ref={ref} placeholder={status === "loading"}>
      {status === "loading" && <Spinner />}
      <Image {...(src ? { src } : {})} {...imageProps} {...props} />
    </Overlay>
  );
};
