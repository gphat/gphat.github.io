// Rasterises public/favicon.svg for the places that want a PNG.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

export async function renderIcon(size: number): Promise<Buffer> {
  const svg = await readFile(join(process.cwd(), "public/favicon.svg"), "utf8");
  return new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
}
