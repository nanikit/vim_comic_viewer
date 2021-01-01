import { defer } from '../utils.ts';

export const sparseObservable = <T>() => {
  let head = defer<IteratorResult<T>>();
  let tail = defer<IteratorResult<T>>();
  let hasTail = false;
  let isClosed = false;

  const queue = (result: IteratorResult<T>) => {
    if (hasTail) {
      tail = head;
      head = defer();
      tail.resolve(result);
    } else {
      tail.resolve(result);
      hasTail = true;
    }
  };

  const push = (value: T) => {
    if (isClosed) {
      throw new Error('pushed to already closed observable');
    }

    queue({ value, done: false });
  };

  const close = () => {
    if (isClosed) {
      return;
    }

    queue({ done: true } as IteratorReturnResult<T>);
    isClosed = true;
  };

  async function* subscribe() {
    let last = tail;
    while (true) {
      const resolved = await last.promise;
      if (resolved.done) {
        return;
      }
      yield resolved.value;

      if (last === tail) {
        last = head;
      } else {
        last = tail;
      }
    }
  }

  return {
    push,
    close,
    [Symbol.asyncIterator]: subscribe,
  };
};
