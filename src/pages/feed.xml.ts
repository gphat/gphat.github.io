import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { FEED_ORIGIN, SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { getPosts, postPath } from "../lib/posts";

// Post bodies use root-relative image paths (/assets/images/…), which a feed
// reader can't resolve. Make them absolute on the way out.
function absolutise(html: string): string {
  return html.replace(/(\s(?:src|href)=")\/(?!\/)/g, `$1${FEED_ORIGIN}/`);
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
      description: absolutise(post.rendered?.html ?? ""),
      categories: post.data.categories,
    })),
    customData: `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
  });
}
