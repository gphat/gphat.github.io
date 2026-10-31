// Run after `npm run build`. Fails if the build dropped a URL the Jekyll site
// served, if the feed's guids changed shape, or if any internal link is dead.
//
// expected-urls.txt was captured from the live Jekyll site before the move to
// Astro (every page, post, pagination page, the feed, and every asset).
// expected-feed-guids.txt is that site's feed.xml guids at the same moment.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;
const here = (f) => new URL(f, import.meta.url).pathname;
const lines = (f) => readFileSync(here(f), "utf8").split("\n").filter(Boolean);
const FEED_ORIGIN = "http://onemogin.com";

// What GitHub Pages serves for a URL path.
function fileFor(urlPath) {
  const p = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const candidates = p.endsWith("/")
    ? [join(p, "index.html")]
    : [p, `${p}.html`, join(p, "index.html")];
  return candidates.map((c) => join(DIST, c)).find((c) => existsSync(c) && statSync(c).isFile());
}

const failures = [];

// 1. Every URL the old site served.
const expected = lines("expected-urls.txt");
for (const url of expected) {
  if (!fileFor(url)) failures.push(`missing: ${url}`);
}

// 2. Feed guids: same http origin as Jekyll used, each pointing at a real post.
const feed = readFileSync(join(DIST, "feed.xml"), "utf8");
const guids = [...feed.matchAll(/<guid[^>]*>([^<]*)<\/guid>/g)].map((m) => m[1]);
if (guids.length === 0) failures.push("feed: no guids");
for (const g of guids) {
  if (!g.startsWith(`${FEED_ORIGIN}/`)) failures.push(`feed: guid not on ${FEED_ORIGIN}: ${g}`);
  else if (!fileFor(g.slice(FEED_ORIGIN.length))) failures.push(`feed: guid has no page: ${g}`);
}
const oldGuids = lines("expected-feed-guids.txt");
const changed = oldGuids.filter((g) => !guids.includes(g));
// Older guids legitimately fall out of the 10-item window as new posts land,
// so only report it; the two checks above are the hard ones.
if (changed.length) console.log(`note: ${changed.length} old feed guid(s) no longer in the feed window`);

// 3. Internal links and assets in every built page.
function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (p.endsWith(".html")) yield p;
  }
}
const sameSite = /^https?:\/\/onemogin\.com(?=\/|$)/;
// Other gphat repos with GitHub Pages turned on are served from onemogin.com/<repo>/
// because this repo is the user site. They aren't in dist, and they're fine.
// List: gh api "users/gphat/repos?per_page=100" --jq '.[] | select(.has_pages) | .name'
const PROJECT_SITES = ["chart-clicker", "clack", "falconry", "hrt", "treasurer", "wabisabi"];
const isProjectSite = (path) => PROJECT_SITES.some((r) => path === `/${r}` || path.startsWith(`/${r}/`));
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, "utf8");
  for (const [, ref] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const path = ref.replace(sameSite, "") || "/";
    if (!path.startsWith("/") || path.startsWith("//") || isProjectSite(path)) continue;
    if (!fileFor(path)) failures.push(`dead link in ${file.slice(DIST.length)}: ${ref}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`\n${failures.length} problem(s)`);
  process.exit(1);
}
console.log(`ok: ${expected.length} old URLs present, ${guids.length} feed guids valid, internal links resolve`);
