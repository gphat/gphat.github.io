// The link-preview card for every page: /og/<post slug>.png for posts,
// /og/<section>.png for About and the topic pages, /og/home.png for the rest.
// Base.astro points og:image here (see ogImagePath).
import type { APIRoute, GetStaticPaths } from "astro";
import { renderCard, type Card } from "../../lib/og";
import { fmtDate, getPosts, postSlug } from "../../lib/posts";
import { categoryTopic, SECTIONS, TOPICS } from "../../lib/topics";

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  const cards: { slug: string; card: Card }[] = posts.map((post) => {
    const topic = categoryTopic(post.data.categories);
    const t = topic && TOPICS[topic];
    return {
      slug: postSlug(post),
      card: {
        label: [...(t ? [t.label] : []), fmtDate(post.data.date)],
        title: post.data.title,
        color: t ? t.color : "teal",
        screen: t ? t.screen : "wave",
      },
    };
  });
  for (const [key, s] of Object.entries(SECTIONS)) {
    cards.push({
      slug: key,
      card: { label: "since" in s ? ["Topic", `Since ${s.since}`] : ["Cory Watson"], title: s.label, color: s.color, screen: s.screen },
    });
  }
  cards.push({
    slug: "home",
    card: { label: ["Field notes on systems and sound"], title: "One 'Mo 'Gin", color: "teal", screen: "wave" },
  });
  return cards.map(({ slug, card }) => ({ params: { slug }, props: { card } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(await renderCard(props.card as Card), { headers: { "Content-Type": "image/png" } });
