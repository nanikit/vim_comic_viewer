import { assertEquals } from "jsr:@std/assert";
import { delay } from "jsr:@std/async/delay";
import puppeteer from "npm:puppeteer";
import { assertPixelsEqual, runTestHttpServer } from "./helpers.ts";

Deno.test("With test page", async (test) => {
  const server = runTestHttpServer();

  const headless = true;
  const browser = await puppeteer.launch({
    headless,
    args: [...(headless ? [] : ["--auto-open-devtools-for-tabs"])],
    browser: "chrome",
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1283,
    height: 719,
    deviceScaleFactor: 1.5,
    isMobile: false,
  });
  await page.bringToFront();
  await page.goto(`http://localhost:${server.addr.port}/test.html`);
  await page.waitForNetworkIdle();

  await test.step("when press i key", async (test) => {
    await delay(300);
    await page.keyboard.press("i");

    await test.step("then viewer should be shown", async () => {
      await assertPixelsEqual({
        actual: page.screenshot({ type: "webp" }),
        expect: Deno.readFile("test/assets/snapshots/1-after-load.webp"),
        name: "1-after-load",
      });
    });
  });

  await test.step("when press j key", async (test) => {
    await page.keyboard.press("j");

    await test.step("then viewer should show next page", async () => {
      await assertPixelsEqual({
        actual: page.screenshot({ type: "webp" }),
        expect: Deno.readFile("test/assets/snapshots/2-j.webp"),
        name: "2-j",
      });
    });
  });

  await test.step("when click bottom of the page", async (test) => {
    await page.mouse.click(600, 600);

    await test.step("then viewer should show next page", async () => {
      await assertPixelsEqual({
        actual: page.screenshot({ type: "webp" }),
        expect: Deno.readFile("test/assets/snapshots/3-click-bottom.webp"),
        name: "3-click-bottom",
      });
    });
  });

  await test.step("when touch bottom of the page", async (test) => {
    await page.touchscreen.tap(600, 600);

    await test.step("then viewer should show next page", async () => {
      await assertPixelsEqual({
        actual: page.screenshot({ type: "webp" }),
        expect: Deno.readFile("test/assets/snapshots/4-touch-bottom.webp"),
        name: "4-touch-bottom",
      });
    });
  });

  await test.step("when touch top of the page", async (test) => {
    await page.touchscreen.tap(600, 200);

    await test.step({
      name: "then viewer should show previous page",
      ignore: true,
      fn: async () => {
        await assertPixelsEqual({
          actual: page.screenshot({ type: "webp" }),
          expect: Deno.readFile("test/assets/snapshots/3-click-bottom.webp"),
          name: "5-touch-top",
        });
      },
    });
  });

  await test.step("when click top of the page", async (test) => {
    await page.mouse.click(600, 200);

    await test.step("then viewer should show previous page", async () => {
      await assertPixelsEqual({
        actual: page.screenshot({ type: "webp" }),
        expect: Deno.readFile("test/assets/snapshots/2-j.webp"),
        name: "6-click-top",
      });
    });
  });

  await test.step("when press k key", async (test) => {
    await page.keyboard.press("k");

    await test.step("then viewer should show previous page", async () => {
      await assertPixelsEqual({
        actual: page.screenshot({ type: "webp" }),
        expect: Deno.readFile("test/assets/snapshots/5-return.webp"),
        name: "7-press-k",
      });
    });
  });

  await test.step("when press l key", async (test) => {
    await page.keyboard.press("l");

    await test.step("then viewer should show next series", async () => {
      const onNextSeriesCount = await page.evaluate(() => {
        // @ts-ignore remote function
        return globalThis.onNextSeriesCount as number;
      });

      assertEquals(onNextSeriesCount, 1);
    });
  });

  await test.step("when click right side", async (test) => {
    await page.mouse.click(1200, 300);

    await test.step("then viewer should show next series", async () => {
      const onNextSeriesCount = await page.evaluate(() => {
        // @ts-ignore remote function
        return globalThis.onNextSeriesCount as number;
      });

      assertEquals(onNextSeriesCount, 2);
    });
  });

  await test.step("when swipe to left side", async (test) => {
    await page.touchscreen.touchStart(900, 300);
    await page.touchscreen.touchMove(700, 300);
    await page.touchscreen.touchEnd();

    await test.step("then viewer should show next series", async () => {
      const onNextSeriesCount = await page.evaluate(() => {
        // @ts-ignore remote function
        return globalThis.onNextSeriesCount as number;
      });

      assertEquals(onNextSeriesCount, 3);
    });
  });

  await test.step("when press h key", async (test) => {
    await page.keyboard.press("h");

    await test.step("then viewer should show previous series", async () => {
      const onPreviousSeriesCount = await page.evaluate(() => {
        // @ts-ignore remote function
        return globalThis.onPreviousSeriesCount as number;
      });

      assertEquals(onPreviousSeriesCount, 1);
    });
  });

  await test.step("when click left side", async (test) => {
    await page.mouse.click(100, 300);

    await test.step("then viewer should show previous series", async () => {
      const onPreviousSeriesCount = await page.evaluate(() => {
        // @ts-ignore remote function
        return globalThis.onPreviousSeriesCount as number;
      });

      assertEquals(onPreviousSeriesCount, 2);
    });
  });

  await test.step("when swipe to right side", async (test) => {
    await page.touchscreen.touchStart(200, 300);
    await page.touchscreen.touchMove(400, 300);
    await page.touchscreen.touchEnd();

    await test.step("then viewer should show previous series", async () => {
      const onPreviousSeriesCount = await page.evaluate(() => {
        // @ts-ignore remote function
        return globalThis.onPreviousSeriesCount as number;
      });

      assertEquals(onPreviousSeriesCount, 3);
    });
  });

  await Promise.all([browser.close(), server.shutdown()]);

  // puppeteer-core/23.6.0/lib/esm/puppeteer/cdp/FrameManager.js:L24 TIME_FOR_WAITING_FOR_SWAP
  await delay(100);
});
