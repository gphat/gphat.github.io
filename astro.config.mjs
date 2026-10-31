// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://onemogin.com",
  // URLs are inherited from the Jekyll site and must not move: posts are files
  // (/automation/improving-automation.html) while pages are directories
  // (/about/). "preserve" emits each route the way its file is named, so
  // [...slug].astro writes foo.html and about/index.md writes about/index.html.
  build: { format: "preserve" },
  // GitHub Pages serves /about and /about/ alike, and old links use both.
  trailingSlash: "ignore",
  // Same reasoning as kapell-site: the compressor eats the word gap at a hard
  // wrap beside an inline tag.
  compressHTML: false,
  integrations: [sitemap()],
});
