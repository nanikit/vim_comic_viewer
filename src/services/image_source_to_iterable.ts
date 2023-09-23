import { ImageSource } from "../types.ts";

export function imageSourceToIterable(source: ImageSource): AsyncIterable<string> {
  if (typeof source === "string") {
    return (async function* () {
      yield source;
    })();
  } else if (Array.isArray(source)) {
    return (async function* () {
      for (const url of source) {
        yield url;
      }
    })();
  } else {
    return source();
  }
}
