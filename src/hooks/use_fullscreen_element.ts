import { useEffect, useState } from "../deps.ts";

export const useFullscreenElement = (): Element | undefined => {
  const [element, setElement] = useState(
    document.fullscreenElement || undefined,
  );

  useEffect(() => {
    const notify = () => setElement(document.fullscreenElement || undefined);
    document.addEventListener("fullscreenchange", notify);
    return () => document.removeEventListener("fullscreenchange", notify);
  }, []);

  return element;
};
