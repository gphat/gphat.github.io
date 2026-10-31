// Sätteri hast plugin: GitHub-style heading anchors. Prepends
// <a class="anchor" href="#slug"> with a Lucide "link" icon to h1–h4;
// onemogin.css shows it in the left gutter on hover.
//
// User plugins run before Astro's own heading-ids plugin, so this assigns the
// id itself. It uses the same slugger, one instance per document, so the ids
// are exactly what Astro would have produced; Astro keeps an existing id.
import Slugger from "github-slugger";

const linkIcon = {
  type: "element",
  tagName: "svg",
  properties: { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", ariaHidden: "true" },
  children: [
    { type: "element", tagName: "path", properties: { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }, children: [] },
    { type: "element", tagName: "path", properties: { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }, children: [] },
  ],
};

export function headingAnchors() {
  return () => {
    const slugger = new Slugger();
    return {
      name: "heading-anchors",
      element: {
        // h5/h6 still get ids from Astro, just no anchor. The slugger has to see
        // them anyway so later duplicate slugs number the same way Astro's would.
        filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
        visit(node, ctx) {
          const existing = node.properties?.id;
          const id = typeof existing === "string" ? existing : slugger.slug(ctx.textContent(node));
          if (typeof existing !== "string") ctx.setProperty(node, "id", id);
          if (node.tagName === "h5" || node.tagName === "h6") return;
          ctx.prependChild(node, {
            type: "element",
            tagName: "a",
            properties: { className: ["anchor"], href: `#${id}`, ariaLabel: "Link to this section", tabIndex: -1 },
            children: [linkIcon],
          });
        },
      },
    };
  };
}
