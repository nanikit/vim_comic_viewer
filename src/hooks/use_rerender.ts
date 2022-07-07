import { useReducer } from "../deps.ts";

export const useRerender = () => {
  const [, rerender] = useReducer(() => ({}), {});
  return rerender;
};
