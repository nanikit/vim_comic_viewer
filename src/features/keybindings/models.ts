export type KeyAction =
  | "toggleViewer"
  | "nextPage"
  | "previousPage"
  | "nextSeries"
  | "previousSeries"
  | "download"
  | "refresh"
  | "decreaseSinglePageCount"
  | "increaseSinglePageCount"
  | "anchorSinglePageCount";

export type KeyBindings = Record<KeyAction, string[]>;

export const defaultKeyBindings: KeyBindings = {
  toggleViewer: ["KeyI", "Numpad0", "Enter"],
  nextPage: ["KeyJ", "ArrowDown", "KeyQ", "PageDown"],
  previousPage: ["KeyK", "ArrowUp", "PageUp"],
  nextSeries: ["KeyL", "ArrowRight", "KeyW"],
  previousSeries: ["KeyH", "ArrowLeft"],
  download: ["Semicolon"],
  refresh: ["Quote"],
  decreaseSinglePageCount: ["Comma"],
  increaseSinglePageCount: ["Period"],
  anchorSinglePageCount: ["Slash"],
};

// No bindings
export const globalActions: KeyAction[] = ["toggleViewer"];
export const elementActions: KeyAction[] = [
  "nextPage",
  "previousPage",
  "nextSeries",
  "previousSeries",
  "download",
  "refresh",
  "decreaseSinglePageCount",
  "increaseSinglePageCount",
  "anchorSinglePageCount",
];

export const keyCodeDisplayNames: Record<string, string> = {
  KeyI: "i",
  KeyJ: "j",
  KeyK: "k",
  KeyH: "h",
  KeyL: "l",
  KeyQ: "q",
  KeyW: "w",
  Numpad0: "NumPad0",
  Enter: "Enter⏎",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  PageUp: "PgUp",
  PageDown: "PgDown",
  Semicolon: ";",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Quote: "'",
};

export function getKeyDisplayName(code: string): string {
  return keyCodeDisplayNames[code] ?? code;
}
