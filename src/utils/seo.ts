import type { DeadTech } from "../data/types";

const BASE_URL = "https://bitrot.timothybrits.co.za";
const DEFAULT_TITLE = "Bitrot — Dead Tech Memorial";
const DEFAULT_DESCRIPTION =
  "An interactive memorial for dead technology. Browse the tombstones of killed products, defunct platforms, and abandoned tech.";

interface SeoData {
  title: string;
  description: string;
  url: string;
  type?: string;
}

function setMetaTag(attribute: "name" | "property", key: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(url: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = url;
}

function setJsonLd(data: Record<string, unknown>): void {
  const id = "seo-json-ld";
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function updateSeo(data: SeoData): void {
  document.title = data.title;

  setMetaTag("name", "description", data.description);
  setMetaTag("property", "og:title", data.title);
  setMetaTag("property", "og:description", data.description);
  setMetaTag("property", "og:url", data.url);
  setMetaTag("property", "og:type", data.type ?? "website");
  setMetaTag("name", "twitter:title", data.title);
  setMetaTag("name", "twitter:description", data.description);

  setCanonical(data.url);
}

export function updateSeoForEntry(entry: DeadTech): void {
  const truncatedAutopsy =
    entry.autopsy.length > 120 ? `${entry.autopsy.slice(0, 120)}…` : entry.autopsy;
  const description = `${entry.name} (${entry.born}–${entry.died}): ${entry.tagline}. ${truncatedAutopsy}`;
  const url = `${BASE_URL}/#/entry/${entry.id}`;

  updateSeo({
    title: `${entry.name} — Bitrot`,
    description,
    url,
    type: "article",
  });

  setJsonLd({
    "@context": "https://schema.org",
    "@type": "Article",
    name: entry.name,
    headline: `${entry.name}: ${entry.tagline}`,
    description,
    url,
    datePublished: `${entry.born}-01-01`,
    dateModified: `${entry.died}-01-01`,
    publisher: {
      "@type": "Organization",
      name: "Bitrot",
      url: BASE_URL,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Bitrot",
      url: BASE_URL,
    },
    ...(entry.parent ? { author: { "@type": "Organization", name: entry.parent } } : {}),
  });
}

export function resetSeo(): void {
  updateSeo({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: BASE_URL,
    type: "website",
  });

  setJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bitrot",
    url: BASE_URL,
    description: DEFAULT_DESCRIPTION,
  });
}
