import { imageSourceToIterable } from "../services/user_utils.ts";
import { ImageSource } from "../types.ts";
import { defer, Deferred } from "../utils.ts";
import { useEffect, useMemo, useState } from "react";

type PageState = { src?: string; state: "loading" | "complete" | "error" };

const makeSourceController = (source: ImageSource) => {
  let imageLoad: Deferred<boolean>;
  let setState: (state: PageState) => void;

  const load = async () => {
    for await (const url of imageSourceToIterable(source)) {
      imageLoad = defer();
      setState({ src: url, state: "loading" });
      const success = await imageLoad.promise;
      if (success) {
        setState({ src: url, state: "complete" });
        return;
      }
    }
    setState({ state: "error" });
  };

  const useInstance = () => {
    let state: PageState;
    [state, setState] = useState<PageState>({ src: "", state: "loading" });

    useEffect(() => {
      load();
    }, []);

    return {
      state,
      onError: () => imageLoad.resolve(false),
      onLoad: () => imageLoad.resolve(true),
    };
  };

  return useInstance;
};

export const useSourceController = (source: ImageSource) => {
  const useInstance = useMemo(() => makeSourceController(source), [source]);
  return useInstance();
};
