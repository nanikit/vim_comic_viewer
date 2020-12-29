import { useState } from '../vendors/react.ts';

export type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

export const defer = <T>(): Deferred<T> => {
  let resolve, reject;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject } as any;
};

export const useDeferred = <T>() => {
  const [deferred] = useState<Deferred<T>>(defer);
  return deferred;
};
