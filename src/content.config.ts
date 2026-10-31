import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Posts keep their Jekyll filenames (2019-04-04-some-slug.md). The URL comes
// from `categories` plus the filename's slug — see src/lib/posts.ts.
const posts = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // Space-separated, as Jekyll wrote them: "observability dashboards".
    categories: z
      .string()
      .default("")
      .transform((s) => s.split(/\s+/).filter(Boolean)),
    // Shown on the index and used as the meta description.
    summary: z.string().optional(),
    // Link-preview image, a path under public/.
    image: z.string().optional(),
    draft: z.boolean().default(false),
    // A multi-part series; the post layout shows the series box.
    series: z.enum(["gc", "dashboards", "automation"]).optional(),
  }),
});

export const collections = { posts };
