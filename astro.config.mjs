// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { satteri } from "@astrojs/markdown-satteri";
import { headingAnchors } from "./src/lib/headingAnchors.mjs";
import markdownTwins from "./src/integrations/markdownTwins.mjs";

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
  markdown: {
    // Astro 7's default Markdown processor. Its plugins are Sätteri hast
    // plugins, not rehype ones (those would need the unified pipeline back).
    processor: satteri({ hastPlugins: [headingAnchors()] }),
    shikiConfig: {
      // onemogin.css swaps to --shiki-dark when the page is in dark mode.
      themes: { light: "everforest-light", dark: "everforest-dark" },
      // Wide code (JVM flag dumps) scrolls, never wraps.
      wrap: false,
    },
  },
  integrations: [sitemap(), markdownTwins()],
});
