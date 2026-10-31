// The home-screen icon (iOS asks for /apple-touch-icon.png by name), drawn
// from public/favicon.svg so the two can't drift.
import type { APIRoute } from "astro";
import { renderIcon } from "../lib/icon";

export const GET: APIRoute = async () =>
  new Response(await renderIcon(180), { headers: { "Content-Type": "image/png" } });
