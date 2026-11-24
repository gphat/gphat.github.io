import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { FEED_ORIGIN, SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { getPosts, postPath } from "../lib/posts";

// Post bodies use root-relative image paths (/assets/images/…), which a feed
// reader can't resolve. Make them absolute on the way out.
function absolutise(html: string): string {
  return html.replace(/(\s(?:src|href)=")\/(?!\/)/g, `$1${FEED_ORIGIN}/`);
}

// Drop the heading anchors (src/lib/headingAnchors.mjs). They're an icon that
// the site's CSS sizes and hides; a reader has neither, and draws a stray,
// sometimes huge, link glyph beside every heading.
function stripAnchors(html: string): string {
  return html.replace(/<a class="anchor"[^>]*>[\s\S]*?<\/a>/g, "");
}

// Inline SVG diagrams draw in the site's CSS variables, which a reader doesn't
// have, so they come out as black shapes or nothing. Swap each for a link to
// the post, described by the diagram's own <title>.
function replaceDiagrams(html: string, link: string): string {
  return html.replace(/<svg[\s\S]*?<\/svg>/g, (svg) => {
    const title = svg.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim();
    const what = title ? `: ${title}` : "";
    return `<p><em><a href="${link}">Diagram on the site</a>${what}</em></p>`;
  });
}

// Same shape as the Jekyll feed: the ten newest posts, full HTML in
// <description>, link and guid on FEED_ORIGIN (see consts.ts for why it's http).
export async function GET(context: APIContext) {
  const posts = (await getPosts()).slice(0, 10);
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: FEED_ORIGIN,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `${FEED_ORIGIN}${postPath(post)}`,
      description: absolutise(
        replaceDiagrams(stripAnchors(post.rendered?.html ?? ""), `${FEED_ORIGIN}${postPath(post)}`),
      ),
      categories: post.data.categories,
    })),
    customData: `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
  });
}
