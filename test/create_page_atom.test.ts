import { assertEquals } from "@std/assert";
import { getStableMediaSize } from "../src/atoms/page_size.ts";

Deno.test("getStableMediaSize keeps remembered size while media dimensions are unavailable", () => {
  assertEquals(
    getStableMediaSize({
      source: { naturalWidth: 0, naturalHeight: 0 },
      rememberedSize: { width: 1067, height: 1348 },
    }),
    { width: 1067, height: 1348 },
  );
});

Deno.test("getStableMediaSize prefers current media dimensions when they are available", () => {
  assertEquals(
    getStableMediaSize({
      source: { naturalWidth: 800, naturalHeight: 1200 },
      rememberedSize: { width: 1067, height: 1348 },
    }),
    { width: 800, height: 1200 },
  );
});

Deno.test("getStableMediaSize reads video dimensions too", () => {
  assertEquals(
    getStableMediaSize({
      source: { videoWidth: 1920, videoHeight: 1080 },
    }),
    { width: 1920, height: 1080 },
  );
});
