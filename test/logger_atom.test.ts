import { assertEquals } from "@std/assert";
import { createStore } from "../src/deps.ts";
import {
  beginNavigationTraceAtom,
  logAtom,
  recordDebugEventAtom,
} from "../src/atoms/logger_atom.ts";

Deno.test("navigation trace id is reused by subsequent debug events", () => {
  const store = createStore();

  const traceId = store.set(beginNavigationTraceAtom, {
    input: { source: "api", action: "nextPage" },
  });
  store.set(recordDebugEventAtom, { event: "navigation:decision" });

  const logs = store.get(logAtom);
  const first = logs[0] as Record<string, unknown> | undefined;
  const second = logs[1] as Record<string, unknown> | undefined;

  assertEquals(traceId, 1);
  assertEquals(logs.length, 2);
  assertEquals(first?.traceId, 1);
  assertEquals(second?.traceId, 1);
});
