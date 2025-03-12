import { assertLess } from "jsr:@std/assert/less";
import { resolve } from "jsr:@std/path";
import { diff } from "npm:@bokuweb/image-diff-wasm";

type ImageComparisonParams = {
  actual: Promise<Uint8Array>;
  expect: Promise<Uint8Array>;
  name: string;
};

export async function assertPixelsEqual({ actual, expect, name }: ImageComparisonParams) {
  const [expectedRaw, actualRaw] = await Promise.all([expect, actual]);

  try {
    const { diffCount, width, height } = diff(expectedRaw, actualRaw, { threshold: 0.001 });
    const threshold = width * height * 0.001;
    assertLess(diffCount, threshold, `diffCount: ${diffCount} > ${threshold}`);
  } catch (error) {
    const actualFileName = `${name}-actual.webp`;
    const expectedFileName = `${name}-expect.webp`;
    await Promise.all([
      Deno.writeFile(`test/failure/${actualFileName}`, bufferToUint8Array(actualRaw)),
      Deno.writeFile(`test/failure/${expectedFileName}`, expectedRaw),
    ]);
    throw error;
  }
}

export function runTestHttpServer() {
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

function bufferToUint8Array(actualRaw: Uint8Array) {
  const buffer = new Uint8Array(actualRaw.length);
  for (let i = 0; i < actualRaw.length; i++) {
    buffer[i] = actualRaw[i] as number;
  }
  return buffer;
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
