import { imageSourceToIterable } from "../services/user_utils.ts";
import { ImageSource } from "../types.ts";
import { defer, Deferred } from "../utils.ts";
import { RefObject, useEffect, useState } from "react";

type PageState = {
  src?: string;
  urls?: string[];
  state: "loading" | "complete" | "error";
};

type PageProps = {
  source: ImageSource;
  observer?: IntersectionObserver;
};

export const makePageController = ({ source, observer }: PageProps) => {
  let imageLoad: Deferred<boolean>;
  let state: PageState;
  let setState: (state: PageState) => void | undefined;
  let key = "";
  let isReloaded = false;

  const load = async () => {
    const urls = [];
    key = `${Math.random()}`;
    for await (const url of imageSourceToIterable(source)) {
      urls.push(url);
      imageLoad = defer();
      setState?.({ src: url, state: "loading" });
      const success = await imageLoad.promise;
      if (success) {
        setState?.({ src: url, state: "complete" });
        return;
      }
      if (isReloaded) {
        isReloaded = false;
        return;
      }
    }
    setState?.({ urls, state: "error" });
  };

  const useInstance = (
    { ref }: { ref: RefObject<HTMLImageElement | undefined> },
  ) => {
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
      key,
      ...(state.src ? { src: state.src } : {}),
      onError: () => imageLoad.resolve(false),
      onLoad: () => imageLoad.resolve(true),
    };
  };

  return {
    get state() {
      return state;
    },

    reload: async () => {
      isReloaded = true;
      imageLoad.resolve(false);
      await load();
    },
    useInstance,
  };
};
