import { describe, expect, it } from "vitest";
import { entries } from "../src/data/entries";
import { buildSitemapXml } from "./generate-sitemap";

describe("buildSitemapXml", () => {
  const xml = buildSitemapXml(entries, "https://bitrot.example");

  it("includes the xml preamble and urlset root", () => {
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.trim().endsWith("</urlset>")).toBe(true);
  });

  it("includes all four static routes", () => {
    expect(xml).toContain("<loc>https://bitrot.example/</loc>");
    expect(xml).toContain("<loc>https://bitrot.example/about</loc>");
    expect(xml).toContain("<loc>https://bitrot.example/privacy</loc>");
    expect(xml).toContain("<loc>https://bitrot.example/stats</loc>");
  });

  it("includes every entry with a clean entry path", () => {
    for (const entry of entries) {
      expect(xml).toContain(`<loc>https://bitrot.example/entry/${entry.id}</loc>`);
    }
  });

  it("totals to 4 static + all entries", () => {
    const urlCount = (xml.match(/<url>/g) ?? []).length;
    expect(urlCount).toBe(4 + entries.length);
  });

  it("does not emit hash-style URLs", () => {
    expect(xml).not.toMatch(/\/#\/entry\//);
  });
});
