// Link-preview cards (og:image): a 1200×630 PNG per page, drawn like the
// site's colour blocks. Satori lays out the card and resvg rasterises it.
//
// Satori can't do the CSS halftones (they lean on blend modes and filters), so
// each screen is drawn here as SVG, its marks in the page's paper colour and
// growing toward the top right corner, clear of the title. Colours are the
// light theme's oklch tokens from public/styles/onemogin.css, in hex, since
// neither library reads oklch.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import wawoff2 from "wawoff2";
import type { Section } from "./topics";
import { OG_HEIGHT, OG_WIDTH } from "../consts";


const C = {
  paper: "#ecefea",
  ink: "#19221a",
  ink2: "#4d554e",
  onDark: "#f4f6f3",
  teal: "#568486",
  slate: "#61778b",
  plum: "#6d4b65",
  ochre: "#d19853",
  moss: "#728867",
};

type Color = Section["color"] | "teal";
type Screen = Section["screen"] | "wave";

// Text on the light blocks is ink; on the dark ones, paper. Title shadows go
// the other way, as .block--* sets --title-shadow.
const LIGHT_BLOCKS: Color[] = ["ochre", "moss"];

export interface Card {
  // Small caps line above the title; parts are set apart by a square.
  label: string[];
  title: string;
  color: Color;
  screen: Screen;
}

// ---- Halftone screens --------------------------------------------------------

// Coverage, 0–1: full in the top right corner, gone well before the bottom
// left, where the label and title sit, as the post headers' screens do.
function ramp(x: number, y: number, w: number, h: number): number {
  const d = Math.hypot((w - x) / (w * 0.62), y / (h * 0.8));
  return Math.max(0, Math.min(1, 1 - d));
}
const f = (n: number) => n.toFixed(1);

// A band along a centre line whose width follows the ramp: a rule (horizontal)
// or a bar (vertical) that swells toward the corner.
function band(line: [number, number][], widths: number[], horizontal: boolean): string | undefined {
  if (!widths.some((wd) => wd > 0.4)) return undefined;
  const side = (sign: number) =>
    line.map(([x, y], i) => (horizontal ? `${f(x)},${f(y + (sign * widths[i]) / 2)}` : `${f(x + (sign * widths[i]) / 2)},${f(y)}`));
  return `<polygon points="${[...side(-1), ...side(1).reverse()].join(" ")}"/>`;
}

function screenMarks(screen: Screen, w: number, h: number): string {
  const out: string[] = [];
  const push = (m: string | undefined) => m && out.push(m);
  if (screen === "dots45") {
    // Two offset grids of dots, the classic 45° screen.
    const cell = 16;
    for (let y = 0; y <= h + cell; y += cell / 2) {
      const odd = Math.round(y / (cell / 2)) % 2;
      for (let x = odd ? cell / 2 : 0; x <= w + cell; x += cell) {
        const r = (cell / Math.SQRT2) * 0.5 * Math.sqrt(ramp(x, y, w, h)) * 1.15;
        if (r > 0.4) out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`);
      }
    }
  } else if (screen === "hlines" || screen === "vlines") {
    // Gridline rules (hlines) or equaliser bars (vlines).
    const horizontal = screen === "hlines";
    const pitch = horizontal ? 12 : 14;
    const [across, along] = horizontal ? [h, w] : [w, h];
    for (let c = pitch / 2; c < across; c += pitch) {
      const line: [number, number][] = [];
      for (let t = 0; t <= along; t += 8) line.push(horizontal ? [t, c] : [c, t]);
      push(band(line, line.map(([x, y]) => pitch * 0.9 * ramp(x, y, w, h)), horizontal));
    }
  } else if (screen === "grain") {
    // Stipple. Seeded, so builds don't churn the image.
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 14000; i++) {
      const x = rand() * w;
      const y = rand() * h;
      if (rand() < ramp(x, y, w, h) * 1.2) out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.2 + rand() * 1.4)}"/>`);
    }
  } else {
    // Rings spreading from beyond the top right corner, as on the home page's
    // feature block, drawn as short strokes that swell toward it.
    const cx = w * 1.3;
    const cy = -h * 0.4;
    const pitch = 15;
    const strokes: string[] = [];
    for (let r = pitch; r < w * 1.6; r += pitch) {
      const step = 6 / r;
      for (let a = Math.PI / 2; a < Math.PI * 1.05; a += step) {
        const x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a);
        const x2 = cx + r * Math.cos(a + step), y2 = cy + r * Math.sin(a + step);
        if (y1 < -pitch || y1 > h + pitch || x2 > w + pitch || x1 < -pitch) continue;
        const sw = pitch * 0.85 * ramp((x1 + x2) / 2, (y1 + y2) / 2, w, h);
        if (sw > 0.4) strokes.push(`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke-width="${f(sw)}"/>`);
      }
    }
    return `<g stroke="currentColor" stroke-linecap="round">${strokes.join("")}</g>`;
  }
  return `<g fill="currentColor">${out.join("")}</g>`;
}

function screenImage(screen: Screen, w: number, h: number): string {
  // The marks are the page's paper, so the block fades into the card around
  // it, as the site's blocks fade into the page.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g color="${C.paper}">${screenMarks(screen, w, h)}</g></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// ---- Fonts -------------------------------------------------------------------

// Satori reads TTF/OTF/WOFF, not WOFF2, so the site's own files are unpacked.
async function font(file: string) {
  const woff2 = await readFile(join(process.cwd(), "public/fonts", `${file}.woff2`));
  return Buffer.from(await wawoff2.decompress(woff2));
}

let fonts: Promise<Parameters<typeof satori>[1]["fonts"]> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all([
    font("Parkly-WideSoft").then((data) => ({ name: "Parkly Wide Soft", data, weight: 400 as const })),
    font("Parkly-Soft").then((data) => ({ name: "Parkly Soft", data, weight: 400 as const })),
    font("NordwandMono-Book").then((data) => ({ name: "Nordwand Mono", data, weight: 400 as const })),
  ]));

// ---- Card --------------------------------------------------------------------

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  // Satori wants every div to be a flex box.
  props: { style: type === "div" ? { display: "flex", ...style } : style, children: children.length === 1 ? children[0] : children },
});

// Long titles step down so they fit four lines at most.
function titleSize(title: string): number {
  const n = title.length;
  return n <= 18 ? 104 : n <= 30 ? 84 : n <= 44 ? 70 : n <= 60 ? 60 : 52;
}

export async function renderCard(card: Card): Promise<Buffer> {
  const light = LIGHT_BLOCKS.includes(card.color);
  const fg = light ? C.ink : C.onDark;
  const shadow = light ? "rgba(244,246,243,0.75)" : C.ink;
  const size = titleSize(card.title);
  const pad = 52;
  const blockW = OG_WIDTH - pad * 2;
  const blockH = OG_HEIGHT - pad - 112;

  const label = card.label.flatMap((part, i) => [
    ...(i ? [h("div", { width: 10, height: 10, background: fg, margin: "0 16px", opacity: 0.8 })] : []),
    h("span", {}, part),
  ]);

  const tree = h(
    "div",
    { width: OG_WIDTH, height: OG_HEIGHT, display: "flex", flexDirection: "column", background: C.paper, padding: `0 ${pad}px ${pad}px` },
    // Masthead, as the site header: wordmark left, address right, ink rule.
    h(
      "div",
      { height: 112, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `3px solid ${C.ink}`, marginBottom: 0 },
      h("div", { fontFamily: "Parkly Wide Soft", fontSize: 34, color: C.ink, textTransform: "uppercase" }, "One Mo' 'Gin"),
      h("div", { fontFamily: "Nordwand Mono", fontSize: 24, color: C.ink2 }, "onemogin.com"),
    ),
    h(
      "div",
      {
        position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end",
        width: blockW, height: blockH, marginTop: 0, padding: "44px 56px 52px",
        background: C[card.color], color: fg, overflow: "hidden",
      },
      { type: "img", props: { src: screenImage(card.screen, blockW, blockH), width: blockW, height: blockH, style: { position: "absolute", left: 0, top: 0 } } },
      h("div", { display: "flex", alignItems: "center", fontFamily: "Parkly Soft", fontSize: 26, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 22 }, ...label),
      h(
        "div",
        {
          fontFamily: "Parkly Wide Soft", fontSize: size, lineHeight: 1.02, textTransform: "uppercase",
          textShadow: `${f(size * 0.085)}px ${f(size * 0.085)}px 0 ${shadow}`, maxWidth: 960,
        },
        card.title,
      ),
    ),
  );

  const svg = await satori(tree as never, { width: OG_WIDTH, height: OG_HEIGHT, fonts: await loadFonts() });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
}
