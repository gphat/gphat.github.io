// Multi-part series. A post joins one with `series: <key>` in its frontmatter;
// Series.astro renders the box and highlights the post's own part.
export interface Series {
  name: string;
  // Completes "This post is part of …".
  description: string;
  // An extra line under the list (credits, caveats).
  note?: string;
  parts: { title: string; url: string }[];
}

export const SERIES = {
  gc: {
    name: "Garbage Collection",
    description: "a series on garbage collection. I'm not remotely close to an expert on the subject, but I'm learning. If you've got comments leave feedback at the bottom",
    parts: [
      { title: "Why Garbage Collection", url: "/programming/gc/why-garbage-collection.html" },
      { title: "Java GC Tuning for Noobs: Part 1", url: "/java/gc/java-gc-tuning-for-noobs-1.html" },
      { title: "Java GC Tuning for Noobs Part 2: Generational", url: "/java/gc/java-gc-tuning-generational.html" },
      { title: "GC Tuning for Noobs: Part 3, Parallelism", url: "/java/gc/java-gc-cms.html" },
    ],
  },
  dashboards: {
    name: "Dashboard Design",
    description: "A Practitioner's Guide to System Dashboard Design",
    parts: [
      { title: "Structure and Layout", url: "/observability/dashboards/practitioners-guide-to-system-dashboard-design.html" },
      { title: "Presentation and Accessibility", url: "/observability/dashboards/practitioners-guide-to-system-dashboard-design-p2.html" },
      { title: "What Charts To Use", url: "/observability/dashboards/practitioners-guide-to-system-dashboard-design-p3.html" },
      { title: "Context Improvement", url: "/observability/dashboards/practitioners-guide-to-system-dashboard-design-p4.html" },
      { title: "Naming and Organization", url: "/observability/dashboards/dashboard-naming-and-organization.html" },
    ],
  },
  automation: {
    name: "Automation",
    description: "a series on automation, the result of many months of research and reading. I may adjust these posts as my research grows",
    note: "Thanks to Arijit Mukherji, Franklin Hu, Jay Shirley, Rajesh Raman, and Sam Boyer for their feedback and reviews of these posts.",
    parts: [
      { title: "Stop Hitting Yourself: How Automation Is Hurting You", url: "/automation/automation-is-hurting-you.html" },
      { title: "Alternatives to Automation: Amplification, Complexity, and Control", url: "/automation/alternatives-to-automation.html" },
      { title: "Improving Automation: Working Together", url: "/automation/improving-automation.html" },
    ],
  },
} satisfies Record<string, Series>;

export type SeriesKey = keyof typeof SERIES;
