import { decode, encode } from "https://deno.land/x/pngs@0.1.1/mod.ts";
import { Browser, launch } from "jsr:@astral/astral";
import { decodeBase64, encodeBase64 } from "jsr:@std/encoding/base64";
import { resolve } from "jsr:@std/path";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

type Celestial = ReturnType<InstanceType<typeof Browser>["unsafelyGetCelestialBindings"]>;

const snapshotContext = {
  name: "",
  count: 0,
};

Deno.test("With test page", async (test) => {
  const server = runTestHttpServer();

  const browser = await launch({ headless: true });
  const page = await browser.newPage(`http://localhost:${server.addr.port}/test.html`);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForNetworkIdle();

  await test.step("when press i key", async (test) => {
    await pressKey(page.unsafelyGetCelestialBindings());

    await test.step("then viewer should be shown", async (test) => {
      const screenshot = await page.screenshot();
      await assertScreenshotEqual(test, screenshot);
    });
  });

  await Promise.all([browser.close(), server.shutdown()]);
});

async function assertScreenshotEqual(test: Deno.TestContext, screenshot: Uint8Array) {
  const encoded = rewritePngForStability(screenshot);
  try {
    await assertSnapshot(test, encodeBase64(encoded), "screenshot.png");
  } catch (error) {
    await Promise.all([
      Deno.writeFile("test/failure/actual.png", screenshot),
      getSnapshot(test).then((binary) => Deno.writeFile("test/failure/expected.png", binary)),
    ]);
    throw error;
  }
}

function rewritePngForStability(screenshot: Uint8Array) {
  const { image, width, height, colorType, bitDepth } = decode(screenshot);
  return encode(image, width, height, { color: colorType, depth: bitDepth });
}

async function getSnapshot(test: Deno.TestContext) {
  const segments = import.meta.url.split("/");
  const snapshotPath = [
    ...segments.slice(0, segments.length - 1),
    "__snapshots__",
    segments.at(-1) + ".snap",
  ].join("/");

  const { snapshot } = await import(snapshotPath);
  const name = `${getTestName(test)} ${++snapshotContext.count}`;
  const data = JSON.parse(snapshot[name]);
  return decodeBase64(data);
}

function getTestName(context: Deno.TestContext): string {
  return context.parent ? `${getTestName(context.parent)} > ${context.name}` : context.name;
}

async function pressKey(celestial: Celestial) {
  await celestial.Input.dispatchKeyEvent({
    type: "keyDown",
    key: "i",
    code: "KeyI",
    location: 0,
    text: "i",
  });
  await celestial.Input.dispatchKeyEvent({
    type: "keyUp",
    key: "i",
    code: "KeyI",
    location: 0,
    text: "i",
  });
}

function runTestHttpServer() {
  return Deno.serve({ port: 0 }, async (request) => {
    try {
      const url = new URL(request.url);
      const relativePath = url.pathname.replace(/^\//, "");
      if (relativePath === "vim_comic_viewer.user.js") {
        return giveStaticFile("vim_comic_viewer.user.js");
      }

      const filePath = resolve("test/assets", relativePath);
      return await giveStaticFile(filePath);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return new Response(null, { status: 404 });
      }
      throw error;
    }
  });
}

async function giveStaticFile(path: string) {
  const file = await Deno.open(path);
  return new Response(file.readable);
}
