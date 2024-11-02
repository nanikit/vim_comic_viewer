import decode from "https://deno.land/x/wasm_image_decoder@v0.0.7/mod.js";
import { assertEquals } from "jsr:@std/assert";
import { delay } from "jsr:@std/async/delay";
import { parse, resolve } from "jsr:@std/path";
import puppeteer from "npm:puppeteer";

Deno.test("With test page", async (test) => {
  const server = runTestHttpServer();

  const headless = true;
  const browser = await puppeteer.launch({
    headless,
    args: [...(headless ? [] : ["--auto-open-devtools-for-tabs"])],
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
      await assertPixelsEqual(
        page.screenshot({ type: "webp" }),
        "test/assets/snapshots/1-after-load.webp",
      );
    });
  });

  await test.step("when press j key", async (test) => {
    await page.keyboard.press("j");

    await test.step("then viewer should show next page", async () => {
      await assertPixelsEqual(page.screenshot({ type: "webp" }), "test/assets/snapshots/2-j.webp");
    });
  });

  await test.step("when click bottom of the page", async (test) => {
    await page.mouse.click(600, 600);

    await test.step("then viewer should show next page", async () => {
      await assertPixelsEqual(
        page.screenshot({ type: "webp" }),
        "test/assets/snapshots/3-click-bottom.webp",
      );
    });
  });

  await test.step("when touch bottom of the page", async (test) => {
    await page.touchscreen.tap(600, 600);

    await test.step("then viewer should show next page", async () => {
      await assertPixelsEqual(
        page.screenshot({ type: "webp" }),
        "test/assets/snapshots/4-touch-bottom.webp",
      );
    });
  });

  await test.step("when touch top of the page", async (test) => {
    await page.touchscreen.tap(600, 200);

    await test.step("then viewer should show previous page", async () => {
      // await assertPixelsEqual(
      //   page.screenshot({ type: "webp" }),
      //   "test/assets/snapshots/3-click-bottom.webp",
      // );
    });
  });

  await test.step("when click top of the page", async (test) => {
    await page.touchscreen.tap(600, 200);

    await test.step("then viewer should show previous page", async () => {
      await assertPixelsEqual(
        page.screenshot({ type: "webp" }),
        "test/assets/snapshots/2-j.webp",
      );
    });
  });

  await test.step("when press k key", async (test) => {
    await page.keyboard.press("k");

    await test.step("then viewer should show previous page", async () => {
      await assertPixelsEqual(
        page.screenshot({ type: "webp" }),
        "test/assets/snapshots/1-after-load.webp",
      );
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

async function assertPixelsEqual(actualPromise: Promise<Uint8Array>, expectedPath: string) {
  const expectedRaw = await Deno.readFile(expectedPath);
  const expected = decode(expectedRaw);
  const actualRaw = await actualPromise;
  const actual = decode(actualRaw);

  try {
    assertEquals(actual.width, expected.width, "width");
    assertEquals(actual.height, expected.height, "height");
    for (let i = 0; i < actual.data.length; i++) {
      assertEquals(actual.data[i], expected.data[i], `index: ${i}`);
    }
  } catch (error) {
    const { base, name, ext } = parse(expectedPath);
    const actualFileName = base;
    const expectedFileName = `${name}-expected${ext}`;
    await Promise.all([
      Deno.writeFile(`test/failure/${actualFileName}`, bufferToUint8Array(actualRaw)),
      Deno.writeFile(`test/failure/${expectedFileName}`, expectedRaw),
    ]);
    throw error;
  }
}

function bufferToUint8Array(actualRaw: Uint8Array) {
  const buffer = new Uint8Array(actualRaw.length);
  for (let i = 0; i < actualRaw.length; i++) {
    buffer[i] = actualRaw[i] as number;
  }
  return buffer;
}

function runTestHttpServer() {
  return Deno.serve({ port: 0 }, async (request) => {
    const url = new URL(request.url);
    const relativePath = url.pathname.replace(/^\//, "");
    if (relativePath === "vim_comic_viewer.user.js") {
      return await giveStaticFile("vim_comic_viewer.user.js");
    }

    const filePath = resolve("test/assets", relativePath);
    return await giveStaticFile(filePath);
  });
}

async function giveStaticFile(path: string) {
  try {
    const file = await Deno.open(path);
    return new Response(file.readable);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return new Response(null, { status: 404 });
    }
    throw error;
  }
}
