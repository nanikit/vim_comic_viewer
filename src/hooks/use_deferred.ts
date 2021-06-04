import { defer, Deferred } from "../utils.ts";
import { useState } from "react";

export const useDeferred = <T>() => {
  const [deferred] = useState<Deferred<T>>(defer);
  return deferred;
};
