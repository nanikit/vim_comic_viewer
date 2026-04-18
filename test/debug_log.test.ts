import { assertEquals } from "@std/assert";
import {
  appendDebugLog,
  MAX_DEBUG_LOG_ENTRIES,
  mergeNavigationDebug,
} from "../src/atoms/debug_log.ts";

Deno.test("appendDebugLog keeps only the newest entries", () => {
  const entries = Array.from({ length: MAX_DEBUG_LOG_ENTRIES + 2 }, (_, index) => ({
    event: "navigation",
    id: index,
  }));

  const appended = entries.reduce(
    (logs, entry) => appendDebugLog(logs, entry),
    [] as typeof entries,
  );

  assertEquals(appended.length, MAX_DEBUG_LOG_ENTRIES);
  assertEquals(appended[0]?.id, 2);
  assertEquals(appended.at(-1)?.id, MAX_DEBUG_LOG_ENTRIES + 1);
});

Deno.test("mergeNavigationDebug replaces duplicate correction kinds instead of appending", () => {
  const merged = mergeNavigationDebug(
    {
      event: "navigation",
      input: {
        source: "key",
        action: "nextPage",
        code: "KeyJ",
        key: "j",
        repeat: false,
        shiftKey: false,
      },
      corrections: [{ kind: "restore", yDiff: 10 }],
    },
    {
      corrections: [
        { kind: "restore", yDiff: 20 },
        { kind: "resize", width: 800, height: 600, scrollHeight: 1200 },
      ],
    },
  );

  assertEquals(merged.corrections, [
    { kind: "restore", yDiff: 20 },
    { kind: "resize", width: 800, height: 600, scrollHeight: 1200 },
  ]);
});

Deno.test("mergeNavigationDebug replaces duplicate media phases per page", () => {
  const merged = mergeNavigationDebug(
    {
      event: "navigation",
      input: {
        source: "wheel",
        action: "nextPage",
        deltaMode: 0,
        deltaY: 120,
        diff: 12,
      },
      media: [{ pageIndex: 3, phase: "resolved", size: { width: 100, height: 200 } }],
    },
    {
      media: [
        { pageIndex: 3, phase: "resolved", size: { width: 150, height: 250 } },
        { pageIndex: 3, phase: "complete", size: { width: 150, height: 250 } },
      ],
    },
  );

  assertEquals(merged.media, [
    { pageIndex: 3, phase: "resolved", size: { width: 150, height: 250 } },
    { pageIndex: 3, phase: "complete", size: { width: 150, height: 250 } },
  ]);
});
