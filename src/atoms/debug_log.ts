import type { Size } from "../helpers/size.ts";

export const MAX_DEBUG_LOG_ENTRIES = 300;

export type DebugPageRect = {
  index: number;
  top: number;
  bottom: number;
  height: number;
};

export type NavigationDebugInput =
  | {
    source: "key";
    action: string;
    code: string;
    key: string;
    repeat: boolean;
    shiftKey: boolean;
  }
  | {
    source: "wheel";
    action: "nextPage" | "previousPage";
    deltaMode: number;
    deltaY: number;
    diff: number;
  }
  | {
    source: "click";
    action: "nextPage" | "previousPage";
    clientY: number;
    viewerHeight: number;
    isTop: boolean;
  }
  | {
    source: "api";
    action: string;
  };

export type NavigationDebugDecision = {
  direction: "next" | "previous";
  previousMiddle: number;
  currentMiddle?: number | null;
  currentPageIndex?: number;
  targetPageIndex?: number;
  pageCount?: number;
  viewerTop?: number;
  viewerBottom?: number;
  pageTop?: number;
  pageBottom?: number;
  remainingHeight?: number;
  ignorableHeight?: number;
  needsPartialScroll?: boolean;
  operation: "scrollBy" | "scrollIntoView" | "noop";
  block?: "start" | "end";
  yDiff?: number;
  scrollTopBefore?: number;
  scrollTopAfter?: number;
};

export type NavigationDebugCorrection =
  | {
    kind: "restore";
    yDiff?: number;
    scrollTopBefore?: number;
    scrollTopAfter?: number;
  }
  | {
    kind: "resize";
    width: number;
    height: number;
    scrollHeight: number;
  }
  | {
    kind: "sync";
    middle?: number;
    scrollTop: number;
  };

export type NavigationDebugMedia = {
  pageIndex: number;
  phase: "resolved" | "complete";
  status?: string;
  size: Partial<Size>;
  rememberedSize?: Partial<Size>;
};

export type NavigationDebugLog = {
  event: "navigation";
  id?: number;
  at?: string;
  input: NavigationDebugInput;
  before?: {
    scrollTop: number;
    viewer: { width: number; height: number; scrollHeight: number };
    middle: number;
    pageRects?: DebugPageRect[];
  };
  decision?: NavigationDebugDecision;
  corrections?: NavigationDebugCorrection[];
  media?: NavigationDebugMedia[];
  after?: {
    scrollTop?: number;
    middle?: number;
    viewer?: { width: number; height: number; scrollHeight: number };
  };
};

export type DebugLogEntry = NavigationDebugLog | Record<string, unknown>;

export function appendDebugLog<T extends DebugLogEntry>(
  entries: T[],
  entry: T,
  limit = MAX_DEBUG_LOG_ENTRIES,
) {
  return [...entries, entry].slice(-limit);
}

export function mergeNavigationDebug(
  current: NavigationDebugLog,
  patch: Partial<NavigationDebugLog>,
): NavigationDebugLog {
  return {
    ...current,
    ...patch,
    input: patch.input ?? current.input,
    before: patch.before ?? current.before,
    decision: patch.decision ?? current.decision,
    corrections: mergeByKey(
      current.corrections,
      patch.corrections,
      (item) => item.kind,
    ),
    media: mergeByKey(
      current.media,
      patch.media,
      (item) => `${item.pageIndex}:${item.phase}`,
    ),
    after: patch.after ?? current.after,
  };
}

function mergeByKey<T>(
  current: T[] | undefined,
  patch: T[] | undefined,
  getKey: (item: T) => string,
) {
  if (!current?.length) {
    return patch;
  }
  if (!patch?.length) {
    return current;
  }

  const merged = new Map(current.map((item) => [getKey(item), item] as const));
  for (const item of patch) {
    merged.set(getKey(item), item);
  }
  return [...merged.values()];
}
