import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

// Jekyll's `permalink: none` style: /:categories/:title.html, where :title is
// the filename minus its date prefix. The filename wins over the frontmatter
// date (2026-10-27-kapell-remote is dated the 26th), exactly as Jekyll did it.
export function postSlug(post: Post): string {
  const title = post.id.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  return [...post.data.categories, title].join("/");
}

export function postPath(post: Post): string {
  return `/${postSlug(post)}.html`;
}

// Published posts, newest first. Same-date ties fall back to the filename, as
// Jekyll's did, so the index and feed keep their order.
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", (p) => !p.data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || b.id.localeCompare(a.id));
}

export const PER_PAGE = 5;

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
