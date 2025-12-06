import { diff } from "@bokuweb/image-diff-wasm";
import { assertLess } from "@std/assert/less";
import { resolve } from "@std/path";

type ImageComparisonParams = {
  actual: Promise<Uint8Array>;
  expect: Promise<Uint8Array>;
  name: string;
};

export async function assertPixelsEqual({ actual, expect, name }: ImageComparisonParams) {
  const [expectedRaw, actualRaw] = await Promise.all([expect, actual]);

  try {
    const { diffCount, width, height } = diff(expectedRaw, actualRaw, { threshold: 0.05 });
    const threshold = width * height * 0.01;
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

    if (relativePath === "mock/tampermonkey-polyfill.js") {
      const script = await Deno.readTextFile("vim_comic_viewer.user.js");
      const header = [
        ...script.match(/@resource\s+(\S+)\s+(\S+)/g) ?? [],
        `@resource link:vim_comic_viewer /vim_comic_viewer.user.js`,
      ].join("\n");
      return new Response(`const header=\`${header}\``, {
        headers: { "Content-Type": "text/javascript" },
      });
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
