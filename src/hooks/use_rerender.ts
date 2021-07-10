import { useReducer } from "react";

export const useRerender = () => {
  const [, rerender] = useReducer(() => ({}), {});
  return rerender;
};
