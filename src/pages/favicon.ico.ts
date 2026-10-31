// /favicon.ico, for the browsers, feed readers and unfurlers that ask for it
// by name instead of reading <link rel="icon">: a 32px PNG of
// public/favicon.svg in an ICO wrapper.
import type { APIRoute } from "astro";
import { renderIcon } from "../lib/icon";

export const GET: APIRoute = async () => {
  const png = await renderIcon(32);
  // ICONDIR (6 bytes) + one ICONDIRENTRY (16 bytes), then the PNG itself.
  const head = Buffer.alloc(22);
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(1, 4); // one image
  head.writeUInt8(32, 6); // width
  head.writeUInt8(32, 7); // height
  head.writeUInt16LE(1, 10); // colour planes
  head.writeUInt16LE(32, 12); // bits per pixel
  head.writeUInt32LE(png.length, 14);
  head.writeUInt32LE(22, 18); // offset of the image data
  return new Response(Buffer.concat([head, png]), { headers: { "Content-Type": "image/x-icon" } });
};
