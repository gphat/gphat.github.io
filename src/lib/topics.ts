// The site's sections. Each one is a colour block with its own print screen,
// shown in up to three places that must agree: its chip in the nav, its block
// on the home page (topics only), and the header of its own page.
export interface Section {
  href: string;
  label: string;
  // Topics show "since" on their home-page block and page header.
  since?: number;
  // Block colour: .block--<color> and .site-nav a[data-topic="<color>"].
  color: "slate" | "plum" | "ochre" | "moss";
  // Halftone screen: .ht--<screen>.
  screen: "hlines" | "dots45" | "vlines" | "grain";
}

export const TOPICS = {
  // Gridlines, like a chart's.
  observability: { href: "/observability", label: "Observability", since: 2012, color: "slate", screen: "hlines" },
  // The classic offset-dot halftone.
  resilience: { href: "/resilience", label: "Resilience", since: 2019, color: "plum", screen: "dots45" },
  // Vertical bars, like an equaliser.
  music: { href: "/music", label: "Music", since: 2026, color: "ochre", screen: "vlines" },
} satisfies Record<string, Section>;

// Everything in the nav: the topics, then About. Dusty teal is the home page's
// accent, so About takes moss, and the one screen nobody else uses.
export const SECTIONS = {
  ...TOPICS,
  about: { href: "/about", label: "About", color: "moss", screen: "grain" },
} satisfies Record<string, Section>;

export type SectionKey = keyof typeof SECTIONS;
