import { imageSourceToIterable } from "../services/user_utils.ts";
import { ImageSource } from "../types.ts";
import { defer, Deferred } from "../utils.ts";
import { RefObject, useEffect, useMemo, useState } from "react";

type PageState = {
  src?: string;
  urls?: string[];
  state: "loading" | "complete" | "error";
};

type PageProps = {
  source: ImageSource;
  ref: RefObject<HTMLImageElement | undefined>;
  observer?: IntersectionObserver;
};

const makeSourceController = ({ source, ref, observer }: PageProps) => {
  let imageLoad: Deferred<boolean>;
  let setState: (state: PageState) => void;

  const load = async () => {
    const urls = [];
    for await (const url of imageSourceToIterable(source)) {
      urls.push(url);
      imageLoad = defer();
      setState({ src: url, state: "loading" });
      const success = await imageLoad.promise;
      if (success) {
        setState({ src: url, state: "complete" });
        return;
      }
    }
    setState({ urls, state: "error" });
  };

  const useInstance = () => {
    let state: PageState;
    [state, setState] = useState<PageState>({ src: "", state: "loading" });

    useEffect(() => {
      load();
    }, []);

    useEffect(() => {
      const target = ref?.current;
      if (target && observer) {
        observer.observe(target);
        return () => observer.unobserve(target);
      }
    }, [observer, ref.current]);

    return {
      state,
      onError: () => imageLoad.resolve(false),
      onLoad: () => imageLoad.resolve(true),
    };
  };

  return useInstance;
};

export const useSourceController = (params: PageProps) => {
  const { source, ref, observer } = params;
  const useInstance = useMemo(() => makeSourceController(params), [
    source,
    ref,
    observer,
  ]);
  return useInstance();
};
