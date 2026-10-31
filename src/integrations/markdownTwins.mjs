// Markdown twins, after kapell-site's: once the build is done, write a .md
// beside every .html page, converted from the page's <main>. A post at
// /observability/foo.html gets /observability/foo.md; /about/index.html gets
// /about/index.md. Base.astro advertises each with
// <link rel="alternate" type="text/markdown">, and /llms.txt lists them.
//
// GitHub Pages can't vary on Accept the way kapell.fm's Caddy does, so agents
// reach the twins by those links rather than by content negotiation.
//
// Converting the built HTML rather than the sources covers the .astro pages
// too, and the twin can't drift from what the page shows. Mark page chrome
// with `data-md-skip`; anything aria-hidden="true" is dropped too.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import TurndownService from "turndown";

// Pages, not the 404 or throwaway test pages (dist/_*.html).
async function* htmlPages(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlPages(path);
    else if (entry.name.endsWith(".html") && entry.name !== "404.html" && !entry.name.startsWith("_")) yield path;
  }
}

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

function meta(html, attr, name) {
  const m = html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`));
  return m ? decode(m[1]) : undefined;
}

function converter(site) {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*",
  });
  td.remove(["script", "style", "svg", "button", "noscript", "template", "form", "video", "iframe"]);
  // Absolute URLs, so a twin still works once it's been lifted out of the site.
  const absolute = (url) => (url && url.startsWith("/") && !url.startsWith("//") ? new URL(url, site).href : url);
  td.addRule("link", {
    filter: (node) => node.nodeName === "A" && node.getAttribute("href"),
    replacement: (content, node) => {
      const href = node.getAttribute("href");
      const text = content.trim();
      if (!text) return "";
      if (href.startsWith("#")) return text;
      return `[${text}](${absolute(href)})`;
    },
  });
  td.addRule("image", {
    filter: "img",
    replacement: (_content, node) => {
      const alt = node.getAttribute("alt") || "";
      return `![${alt}](${absolute(node.getAttribute("src"))})`;
    },
  });
  // Shiki's blocks carry their language on the <pre>; keep it on the fence.
  td.addRule("code", {
    filter: (node) => node.nodeName === "PRE" && node.hasAttribute("data-language"),
    replacement: (_content, node) => {
      const lang = node.getAttribute("data-language");
      const code = node.textContent.replace(/\n$/, "");
      return `\n\n\`\`\`${lang === "plaintext" ? "" : lang}\n${code}\n\`\`\`\n\n`;
    },
  });
  // YouTube embeds become links to the video.
  td.addRule("embed", {
    filter: (node) => node.nodeName === "IFRAME" && /youtube/.test(node.getAttribute("src") || ""),
    replacement: (_content, node) => {
      const id = (node.getAttribute("src").match(/embed\/([\w-]+)/) || [])[1];
      return id ? `\n\n[Video: ${node.getAttribute("title") || "YouTube"}](https://www.youtube.com/watch?v=${id})\n\n` : "";
    },
  });
  // Registered last because turndown tries the most recently added rule
  // first, and this has to beat the others.
  td.addRule("skip", {
    filter: (node) => node.getAttribute("aria-hidden") === "true" || node.hasAttribute("data-md-skip"),
    replacement: () => "",
  });
  return td;
}

export default function markdownTwins() {
  let site;
  return {
    name: "onemogin:markdown-twins",
    hooks: {
      "astro:config:done": ({ config }) => {
        site = config.site;
      },
      "astro:build:done": async ({ dir, logger }) => {
        const td = converter(site);
        const root = fileURLToPath(dir);
        let count = 0;
        for await (const htmlPath of htmlPages(root)) {
          const html = await readFile(htmlPath, "utf8");
          const main = html.match(/<main[^>]*>([\s\S]*)<\/main>/);
          if (!main) continue;

          const front = {
            title: decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""),
            description: meta(html, "name", "description"),
            canonical: meta(html, "property", "og:url"),
            published: meta(html, "property", "article:published_time"),
            author: "Cory Watson",
          };
          const yaml = Object.entries(front)
            .filter(([, v]) => v)
            .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
            .join("\n");
          const body = td
            .turndown(main[1])
            .replace(/^(\s*)-   /gm, "$1- ")
            .replace(/^(\s*\d+\.)  /gm, "$1 ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

          await writeFile(htmlPath.replace(/\.html$/, ".md"), `---\n${yaml}\n---\n\n${body}\n`);
          count++;
        }
        logger.info(`wrote ${count} Markdown twins`);
      },
    },
  };
}
