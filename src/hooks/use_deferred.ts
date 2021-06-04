import { defer, Deferred } from "../utils.ts";
import { useState } from "../vendors/react.ts";

export const useDeferred = <T>() => {
  const [deferred] = useState<Deferred<T>>(defer);
  return deferred;
};
