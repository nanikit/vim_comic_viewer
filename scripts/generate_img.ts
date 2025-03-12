import { parseArgs } from "jsr:@std/cli/parse-args";
import sharp from "npm:sharp";

await main();

async function main() {
  const args = parseArgs(Deno.args, {
    string: ["widths", "heights", "output"],
    alias: {
      w: "widths",
      h: "heights",
      o: "output",
    },
  });

  const { widths: ws, heights: hs, output } = args;

  if (!ws || !hs || !output) {
    console.error(
      `Example: ${Deno.args[0]} --widths <100,200> --heights <100,200> --output <output-dir>`,
    );
    Deno.exit(1);
  }

  await Deno.mkdir(output, { recursive: true });

  const widths = ws.split(",").map(Number);
  const heights = hs.split(",").map(Number);

  for (const width of widths) {
    for (const height of heights) {
      const background = { r: rand255(), g: rand255(), b: rand255() };
      const img = sharp({ create: { width, height, channels: 3, background } });
      await img.toFile(`${output}/solid_${toHexColor(background)}-${width}x${height}.webp`);
    }
  }
}

function rand255() {
  return Math.floor(Math.random() * 255);
}

function toHexColor(background: { r: number; g: number; b: number }) {
  return `${toHex(background.r)}${toHex(background.g)}${toHex(background.b)}`;
}

function toHex(n: number) {
  return n.toString(16).padStart(2, "0");
}
