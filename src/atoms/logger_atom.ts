import { atom } from "../deps.ts";
import { appendDebugLog, type DebugLogEntry, MAX_DEBUG_LOG_ENTRIES } from "./debug_log.ts";

export const logAtom = atom<DebugLogEntry[]>([]);

const nextTraceIdAtom = atom(1);
const activeNavigationTraceIdAtom = atom<number | null>(null);

export const currentNavigationTraceIdAtom = atom((get) => get(activeNavigationTraceIdAtom));

export const loggerAtom = atom(null, (_get, set, message: DebugLogEntry) => {
  set(logAtom, (prev) => appendDebugLog(prev, message, MAX_DEBUG_LOG_ENTRIES));
  console.log(message);
});

export const beginNavigationTraceAtom = atom(
  null,
  (get, set, value: Record<string, unknown>) => {
    const traceId = get(nextTraceIdAtom);
    set(nextTraceIdAtom, traceId + 1);
    set(activeNavigationTraceIdAtom, traceId);
    set(loggerAtom, {
      at: new Date().toISOString(),
      event: "navigation:start",
      traceId,
      ...value,
    });
    return traceId;
  },
);

export const recordDebugEventAtom = atom(
  null,
  (get, set, value: Record<string, unknown>) => {
    const traceId = typeof value.traceId === "number"
      ? value.traceId
      : get(activeNavigationTraceIdAtom) ?? undefined;
    set(loggerAtom, {
      at: new Date().toISOString(),
      ...value,
      ...(traceId !== undefined ? { traceId } : {}),
    });
  },
);

export const clearActiveNavigationTraceAtom = atom(null, (_get, set) => {
  set(activeNavigationTraceIdAtom, null);
});
