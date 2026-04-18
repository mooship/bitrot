import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { entries } from "../src/data/entries.ts";
import type { DeadTech } from "../src/data/types.ts";

const BASE_URL = (process.env.VITE_PUBLIC_URL ?? "https://bitrot.timothybrits.co.za").replace(
  /\/$/,
  ""
);

interface SitemapUrl {
  loc: string;
  changefreq: "yearly" | "monthly" | "weekly" | "daily";
  priority: string;
}

const STATIC_URLS: SitemapUrl[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/about", changefreq: "monthly", priority: "0.5" },
  { loc: "/privacy", changefreq: "monthly", priority: "0.3" },
  { loc: "/stats", changefreq: "weekly", priority: "0.6" },
];

export function buildSitemapXml(allEntries: DeadTech[], baseUrl: string = BASE_URL): string {
  const entryUrls: SitemapUrl[] = allEntries.map((e) => ({
    loc: `/entry/${e.id}`,
    changefreq: "yearly",
    priority: "0.7",
  }));
  const all = [...STATIC_URLS, ...entryUrls];
  const body = all
    .map(
      ({ loc, changefreq, priority }) =>
        `  <url>\n    <loc>${baseUrl}${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

const isMain =
  import.meta.url.startsWith("file:") && process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const xml = buildSitemapXml(entries);
  const outPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public", "sitemap.xml");
  writeFileSync(outPath, xml);
  console.log(`Wrote ${outPath} with ${STATIC_URLS.length + entries.length} URLs`);
}
