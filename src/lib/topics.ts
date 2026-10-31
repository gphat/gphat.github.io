// The site's topics. Each one is a colour block with its own print screen,
// shown three ways that must agree: its chip in the nav, its block on the home
// page, and the header of its own page.
export interface Topic {
  href: string;
  label: string;
  since: number;
  // Block colour: .block--<color> and .site-nav a[data-topic="<color>"].
  color: "slate" | "plum" | "ochre";
  // Halftone screen: .ht--<screen>.
  screen: "hlines" | "dots45" | "vlines";
}

export const TOPICS = {
  // Gridlines, like a chart's.
  observability: { href: "/observability", label: "Observability", since: 2012, color: "slate", screen: "hlines" },
  // The classic offset-dot halftone.
  resilience: { href: "/resilience", label: "Resilience", since: 2019, color: "plum", screen: "dots45" },
  // Vertical bars, like an equaliser.
  music: { href: "/music", label: "Music", since: 2026, color: "ochre", screen: "vlines" },
} satisfies Record<string, Topic>;

export type TopicKey = keyof typeof TOPICS;
