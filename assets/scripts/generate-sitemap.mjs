// /scripts/generate-sitemap.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.SITE_BASE || "https://www.woofofwalkstreet.com"; // can override in CI

// Core site pages you want in the sitemap
const CORE = [
  "/", "/dog-walking.html", "/weekend-woof-club.html",
  "/blog/", "/contact.html", "/agreements.html",
  "/blog/tag/" // tag hub
];

// Priority / changefreq map (fallbacks provided)
const META = new Map([
  ["/",                      { priority: "1.0", changefreq: "weekly" }],
  ["/dog-walking.html",      { priority: "0.9", changefreq: "monthly" }],
  ["/weekend-woof-club.html",{ priority: "0.9", changefreq: "monthly" }],
  ["/blog/",                 { priority: "0.8", changefreq: "weekly" }],
  ["/contact.html",          { priority: "0.7", changefreq: "monthly" }],
  ["/agreements.html",       { priority: "0.5", changefreq: "yearly" }],
  ["/blog/tag/",             { priority: "0.6", changefreq: "weekly" }]
]);

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function row(loc, { priority = "0.6", changefreq = "yearly" } = {}) {
  return `  <url>
    <loc>${BASE}${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function unique(arr) { return [...new Set(arr)]; }

function buildSitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => row(u, META.get(u))).join("\n")}
</urlset>
`;
}

function buildRobots() {
  // Robots only controls crawling on the same host as this file.
  // Use _redirects (already added) to handle staging domain.
  return `User-agent: *
Allow: /

# Sensible defaults if you ever add these
Disallow: /_/
Disallow: /admin/
Disallow: /drafts/
Disallow: /preview/

Sitemap: ${BASE}/sitemap.xml
`;
}

function main() {
  // 1) Read posts
  const postsPath = resolve("blog", "posts.json");
  const postsRaw = readFileSync(postsPath, "utf8");
  /** @type {{url:string,tags?:string[]}[]} */
  const posts = JSON.parse(postsRaw);

  // 2) Collect tag pages from posts.json
  const tags = unique(posts.flatMap(p => (p.tags || []).map(t => slugify(t)))).filter(Boolean);
  const tagPages = tags.map(t => `/blog/tag/${t}.html`);

  // 3) Compose final list of URLs
  const urls = [
    ...CORE,
    ...posts.map(p => p.url),
    ...tagPages
  ];

  // 4) Write sitemap.xml
  const sitemap = buildSitemap(urls);
  writeFileSync(resolve("sitemap.xml"), sitemap, "utf8");
  console.log(`✅ sitemap.xml generated with ${urls.length} URLs`);

  // 5) Write robots.txt
  const robots = buildRobots();
  writeFileSync(resolve("robots.txt"), robots, "utf8");
  console.log(`✅ robots.txt generated → references ${BASE}/sitemap.xml`);
}

main();
