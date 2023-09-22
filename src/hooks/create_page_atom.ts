import { atom, useAtomValue } from "jotai";
import { scrollObserverAtom } from "../atoms/viewer_atoms.ts";
import { RefObject, useEffect, useState } from "../deps.ts";
import { imageSourceToIterable } from "../services/user_utils.ts";
import { ImageSource } from "../types.ts";
import { defer, Deferred } from "../utils.ts";

type PageState = {
  src?: string;
  urls?: string[];
  state: "loading" | "complete" | "error";
};

type PageProps = {
  source: ImageSource;
};

export const createPageAtom = ({ source }: PageProps) => {
  let imageLoad: Deferred<boolean | null>;
  let state: PageState;
  let setState: (state: PageState) => void | undefined;
  let key = "";

  const load = async () => {
    const urls = [];
    key = `${Math.random()}`;
    for await (const url of imageSourceToIterable(source)) {
      urls.push(url);
      imageLoad = defer();
      setState?.({ src: url, state: "loading" });
      const result = await imageLoad.promise;
      switch (result) {
        case true:
          setState?.({ src: url, state: "complete" });
          return;
        case null:
          return;
      }
    }
    setState?.({ urls, state: "error" });
  };

  const useInstance = (
    { ref }: { ref: RefObject<HTMLElement | undefined> },
  ) => {
    const observer = useAtomValue(scrollObserverAtom);
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

  return atom({
    get state() {
      return state;
    },

    reload: async () => {
      setState?.({ state: "complete" });
      imageLoad.resolve(null);
      await load();
    },
    useInstance,
  });
};
