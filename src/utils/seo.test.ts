import { beforeEach, describe, expect, it } from "vitest";
import { mockEntry, mockEntryMinimal } from "../test/fixtures";
import { resetSeo, updateSeoForEntry } from "./seo";

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

  describe("updateSeoForEntry", () => {
    it("sets document.title to entry name", () => {
      updateSeoForEntry(mockEntry);
      expect(document.title).toBe("Google Reader — Bitrot");
    });

    it("sets meta description with entry details", () => {
      updateSeoForEntry(mockEntry);
      const desc = getMetaContent("name", "description");
      expect(desc).toContain("Google Reader");
      expect(desc).toContain("2005–2013");
      expect(desc).toContain(mockEntry.tagline);
    });

    it("sets og:title and og:description", () => {
      updateSeoForEntry(mockEntry);
      expect(getMetaContent("property", "og:title")).toBe("Google Reader — Bitrot");
      expect(getMetaContent("property", "og:description")).toContain("Google Reader");
    });

    it("sets og:url with entry hash route", () => {
      updateSeoForEntry(mockEntry);
      expect(getMetaContent("property", "og:url")).toBe(
        "https://bitrot.timothybrits.co.za/#/entry/google-reader"
      );
    });

    it("sets og:type to article", () => {
      updateSeoForEntry(mockEntry);
      expect(getMetaContent("property", "og:type")).toBe("article");
    });

    it("sets twitter meta tags", () => {
      updateSeoForEntry(mockEntry);
      expect(getMetaContent("name", "twitter:title")).toBe("Google Reader — Bitrot");
      expect(getMetaContent("name", "twitter:description")).toContain("Google Reader");
    });

    it("sets canonical URL", () => {
      updateSeoForEntry(mockEntry);
      expect(getCanonicalHref()).toBe("https://bitrot.timothybrits.co.za/#/entry/google-reader");
    });

    it("injects JSON-LD with Article schema", () => {
      updateSeoForEntry(mockEntry);
      const ld = getJsonLd();
      expect(ld).not.toBeNull();
      expect(ld?.["@type"]).toBe("Article");
      expect(ld?.name).toBe("Google Reader");
      expect(ld?.headline).toBe("Google Reader: The RSS reader that united the internet");
    });

    it("includes author in JSON-LD when parent exists", () => {
      updateSeoForEntry(mockEntry);
      const ld = getJsonLd();
      expect(ld?.author).toEqual({ "@type": "Organization", name: "Google" });
    });

    it("omits author in JSON-LD when no parent", () => {
      updateSeoForEntry(mockEntryMinimal);
      const ld = getJsonLd();
      expect(ld?.author).toBeUndefined();
    });

    it("truncates long autopsy text in description", () => {
      const longAutopsy = "A".repeat(200);
      updateSeoForEntry({ ...mockEntry, autopsy: longAutopsy });
      const desc = getMetaContent("name", "description");
      expect(desc?.length).toBeLessThan(250);
      expect(desc).toContain("…");
    });
  });

  describe("resetSeo", () => {
    it("restores default document.title", () => {
      updateSeoForEntry(mockEntry);
      resetSeo();
      expect(document.title).toBe("Bitrot — Dead Tech Memorial");
    });

    it("restores default meta description", () => {
      updateSeoForEntry(mockEntry);
      resetSeo();
      expect(getMetaContent("name", "description")).toBe(
        "An interactive memorial for dead technology. Browse the tombstones of killed products, defunct platforms, and abandoned tech."
      );
    });

    it("restores og:type to website", () => {
      updateSeoForEntry(mockEntry);
      resetSeo();
      expect(getMetaContent("property", "og:type")).toBe("website");
    });

    it("restores JSON-LD to WebSite schema", () => {
      updateSeoForEntry(mockEntry);
      resetSeo();
      const ld = getJsonLd();
      expect(ld?.["@type"]).toBe("WebSite");
      expect(ld?.name).toBe("Bitrot");
    });
  });

  describe("JSON-LD script management", () => {
    it("replaces existing script instead of duplicating", () => {
      updateSeoForEntry(mockEntry);
      updateSeoForEntry(mockEntryMinimal);
      const scripts = document.querySelectorAll("#seo-json-ld");
      expect(scripts.length).toBe(1);
    });

    it("creates script element if missing", () => {
      expect(document.getElementById("seo-json-ld")).toBeNull();
      updateSeoForEntry(mockEntry);
      expect(document.getElementById("seo-json-ld")).not.toBeNull();
    });
  });

  describe("meta tag management", () => {
    it("creates meta elements that do not yet exist", () => {
      expect(document.querySelector('meta[property="og:title"]')).toBeNull();
      updateSeoForEntry(mockEntry);
      expect(document.querySelector('meta[property="og:title"]')).not.toBeNull();
    });

    it("updates existing meta elements without duplicating", () => {
      updateSeoForEntry(mockEntry);
      updateSeoForEntry(mockEntryMinimal);
      const ogTitles = document.querySelectorAll('meta[property="og:title"]');
      expect(ogTitles.length).toBe(1);
      expect((ogTitles[0] as HTMLMetaElement).content).toBe("Test Entry — Bitrot");
    });
  });
});
