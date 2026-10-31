// /llms.txt, the llmstxt.org index for agents: who writes here, then every
// page and post, linked to its Markdown twin (src/integrations/markdownTwins.mjs).
import type { APIRoute } from "astro";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { getPosts, postPath } from "../lib/posts";
import { SECTIONS } from "../lib/topics";

export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;

  const sections = Object.values(SECTIONS).map((s) => `- [${s.label}](${url(`${s.href}/index.md`)})`);
  const posts = (await getPosts()).map((post) => {
    const date = post.data.date.toISOString().slice(0, 10);
    const note = post.data.summary ? `: ${post.data.summary.trim()}` : "";
    return `- [${post.data.title}](${url(postPath(post).replace(/\.html$/, ".md"))}) (${date})${note}`;
  });

  const body = [
    `# ${SITE_TITLE}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "Written by Cory Watson, an engineer in Nashville: observability, resilience in complex systems, and building Kapell (https://kapell.fm), an Apple Music player for active listening.",
    "",
    "Every page on onemogin.com has a Markdown version: a post at `/<path>.html` is at `/<path>.md`, and any other page at `<page URL>index.md`. Each page links its version with `<link rel=\"alternate\" type=\"text/markdown\">`.",
    "",
    "## Sections",
    "",
    ...sections,
    "",
    "## Posts",
    "",
    ...posts,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
