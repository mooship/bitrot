import { beforeEach, describe, expect, it } from "vitest";
import { mockEntry, mockEntryMinimal } from "../test/fixtures";
import { updatePageSeo, updateSeo } from "./seo";

function getMetaContent(attribute: "name" | "property", key: string): string | null {
  return document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)?.content ?? null;
}

function getCanonicalHref(): string | null {
  return document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null;
}

function getJsonLd(): Record<string, unknown> | null {
  const script = document.getElementById("seo-json-ld");
  if (!script?.textContent) return null;
  return JSON.parse(script.textContent);
}

function clearElements(selector: string): void {
  for (const el of document.head.querySelectorAll(selector)) {
    el.remove();
  }
}

describe("seo", () => {
  beforeEach(() => {
    document.title = "";
    clearElements('meta[property^="og:"]');
    clearElements('meta[name="description"]');
    clearElements('meta[name^="twitter:"]');
    clearElements('link[rel="canonical"]');
    clearElements("#seo-json-ld");
  });

  describe("updateSeo with entry", () => {
    it("sets document.title to entry name", () => {
      updateSeo(mockEntry);
      expect(document.title).toBe("Google Reader — Bitrot");
    });

    it("sets meta description with entry details", () => {
      updateSeo(mockEntry);
      const desc = getMetaContent("name", "description");
      expect(desc).toContain("Google Reader");
      expect(desc).toContain("2005–2013");
      expect(desc).toContain(mockEntry.tagline);
    });

    it("sets og:title and og:description", () => {
      updateSeo(mockEntry);
      expect(getMetaContent("property", "og:title")).toBe("Google Reader — Bitrot");
      expect(getMetaContent("property", "og:description")).toContain("Google Reader");
    });

    it("sets og:url with clean entry path", () => {
      updateSeo(mockEntry);
      expect(getMetaContent("property", "og:url")).toBe(
        "https://bitrot.timothybrits.co.za/entry/google-reader"
      );
    });

    it("sets og:type to article", () => {
      updateSeo(mockEntry);
      expect(getMetaContent("property", "og:type")).toBe("article");
    });

    it("sets per-entry og:image and twitter:image", () => {
      updateSeo(mockEntry);
      const expected = "https://bitrot.timothybrits.co.za/og/google-reader.png";
      expect(getMetaContent("property", "og:image")).toBe(expected);
      expect(getMetaContent("name", "twitter:image")).toBe(expected);
      expect(getMetaContent("property", "og:image:alt")).toBe("Google Reader — Bitrot");
    });

    it("sets og:locale and og:site_name", () => {
      updateSeo(mockEntry);
      expect(getMetaContent("property", "og:locale")).toBe("en_US");
      expect(getMetaContent("property", "og:site_name")).toBe("Bitrot");
    });

    it("sets twitter meta tags", () => {
      updateSeo(mockEntry);
      expect(getMetaContent("name", "twitter:card")).toBe("summary_large_image");
      expect(getMetaContent("name", "twitter:title")).toBe("Google Reader — Bitrot");
      expect(getMetaContent("name", "twitter:description")).toContain("Google Reader");
    });

    it("sets canonical URL with clean path", () => {
      updateSeo(mockEntry);
      expect(getCanonicalHref()).toBe("https://bitrot.timothybrits.co.za/entry/google-reader");
    });

    it("injects JSON-LD with Article schema", () => {
      updateSeo(mockEntry);
      const ld = getJsonLd();
      expect(ld).not.toBeNull();
      expect(ld?.["@type"]).toBe("Article");
      expect(ld?.name).toBe("Google Reader");
      expect(ld?.headline).toBe("Google Reader: The RSS reader that united the internet");
    });

    it("uses died year as datePublished and omits dateModified", () => {
      updateSeo(mockEntry);
      const ld = getJsonLd();
      expect(ld?.datePublished).toBe("2013-01-01");
      expect(ld?.dateModified).toBeUndefined();
    });

    it("includes per-entry image in JSON-LD", () => {
      updateSeo(mockEntry);
      const ld = getJsonLd();
      expect(ld?.image).toBe("https://bitrot.timothybrits.co.za/og/google-reader.png");
    });

    it("includes author in JSON-LD when parent exists", () => {
      updateSeo(mockEntry);
      const ld = getJsonLd();
      expect(ld?.author).toEqual({ "@type": "Organization", name: "Google" });
    });

    it("omits author in JSON-LD when no parent", () => {
      updateSeo(mockEntryMinimal);
      const ld = getJsonLd();
      expect(ld?.author).toBeUndefined();
    });

    it("truncates long autopsy text in description", () => {
      const longAutopsy = "A".repeat(200);
      updateSeo({ ...mockEntry, autopsy: longAutopsy });
      const desc = getMetaContent("name", "description");
      expect(desc?.length).toBeLessThan(250);
      expect(desc).toContain("…");
    });
  });

  describe("updateSeo with null", () => {
    it("restores default document.title", () => {
      updateSeo(mockEntry);
      updateSeo(null);
      expect(document.title).toBe("Bitrot — Dead Tech Memorial");
    });

    it("restores default meta description", () => {
      updateSeo(mockEntry);
      updateSeo(null);
      expect(getMetaContent("name", "description")).toBe(
        "An interactive memorial for dead technology. Browse the tombstones of killed products, defunct platforms, and abandoned tech."
      );
    });

    it("restores og:type to website", () => {
      updateSeo(mockEntry);
      updateSeo(null);
      expect(getMetaContent("property", "og:type")).toBe("website");
    });

    it("restores og:image to default", () => {
      updateSeo(mockEntry);
      updateSeo(null);
      expect(getMetaContent("property", "og:image")).toBe(
        "https://bitrot.timothybrits.co.za/og-image.png"
      );
    });

    it("restores JSON-LD to WebSite schema", () => {
      updateSeo(mockEntry);
      updateSeo(null);
      const ld = getJsonLd();
      expect(ld?.["@type"]).toBe("WebSite");
      expect(ld?.name).toBe("Bitrot — Dead Tech Memorial");
    });
  });

  describe("updatePageSeo", () => {
    it("about: sets title, canonical, and AboutPage JSON-LD", () => {
      updatePageSeo("about");
      expect(document.title).toBe("About · Bitrot");
      expect(getCanonicalHref()).toBe("https://bitrot.timothybrits.co.za/about");
      expect(getMetaContent("property", "og:type")).toBe("website");
      expect(getJsonLd()?.["@type"]).toBe("AboutPage");
    });

    it("privacy: sets title, canonical, and WebPage JSON-LD", () => {
      updatePageSeo("privacy");
      expect(document.title).toBe("Privacy Policy · Bitrot");
      expect(getCanonicalHref()).toBe("https://bitrot.timothybrits.co.za/privacy");
      expect(getJsonLd()?.["@type"]).toBe("WebPage");
    });

    it("stats: sets title, canonical, and CollectionPage JSON-LD", () => {
      updatePageSeo("stats");
      expect(document.title).toBe("Stats · Bitrot");
      expect(getCanonicalHref()).toBe("https://bitrot.timothybrits.co.za/stats");
      expect(getJsonLd()?.["@type"]).toBe("CollectionPage");
    });

    it("home: sets defaults and WebSite JSON-LD", () => {
      updatePageSeo("home");
      expect(document.title).toBe("Bitrot — Dead Tech Memorial");
      expect(getCanonicalHref()).toBe("https://bitrot.timothybrits.co.za/");
      expect(getJsonLd()?.["@type"]).toBe("WebSite");
    });

    it("uses default og:image across static pages", () => {
      updatePageSeo("about");
      expect(getMetaContent("property", "og:image")).toBe(
        "https://bitrot.timothybrits.co.za/og-image.png"
      );
    });

    it("non-home pages mark isPartOf the WebSite", () => {
      updatePageSeo("about");
      const ld = getJsonLd();
      expect(ld?.isPartOf).toEqual({
        "@type": "WebSite",
        name: "Bitrot",
        url: "https://bitrot.timothybrits.co.za",
      });
    });

    it("transitions from entry page clean up stale entry meta", () => {
      updateSeo(mockEntry);
      updatePageSeo("about");
      expect(getMetaContent("property", "og:type")).toBe("website");
      expect(getMetaContent("property", "og:image")).toBe(
        "https://bitrot.timothybrits.co.za/og-image.png"
      );
      expect(getJsonLd()?.["@type"]).toBe("AboutPage");
    });
  });

  describe("JSON-LD script management", () => {
    it("replaces existing script instead of duplicating", () => {
      updateSeo(mockEntry);
      updateSeo(mockEntryMinimal);
      const scripts = document.querySelectorAll("#seo-json-ld");
      expect(scripts.length).toBe(1);
    });

    it("creates script element if missing", () => {
      expect(document.getElementById("seo-json-ld")).toBeNull();
      updateSeo(mockEntry);
      expect(document.getElementById("seo-json-ld")).not.toBeNull();
    });
  });

  describe("meta tag management", () => {
    it("creates meta elements that do not yet exist", () => {
      expect(document.querySelector('meta[property="og:title"]')).toBeNull();
      updateSeo(mockEntry);
      expect(document.querySelector('meta[property="og:title"]')).not.toBeNull();
    });

    it("updates existing meta elements without duplicating", () => {
      updateSeo(mockEntry);
      updateSeo(mockEntryMinimal);
      const ogTitles = document.querySelectorAll('meta[property="og:title"]');
      expect(ogTitles.length).toBe(1);
      expect((ogTitles[0] as HTMLMetaElement).content).toBe("Test Entry — Bitrot");
    });
  });
});
