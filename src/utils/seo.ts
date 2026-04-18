import type { DeadTech } from "../data/types";

const BASE_URL = (import.meta.env?.VITE_PUBLIC_URL ?? "https://bitrot.timothybrits.co.za").replace(
  /\/$/,
  ""
);
const DEFAULT_TITLE = "Bitrot — Dead Tech Memorial";
const DEFAULT_DESCRIPTION =
  "An interactive memorial for dead technology. Browse the tombstones of killed products, defunct platforms, and abandoned tech.";
const DEFAULT_IMAGE_PATH = "/og-image.png";
const DEFAULT_IMAGE_ALT = "Bitrot — Dead Tech Memorial";

export type StaticPage = "home" | "about" | "privacy" | "stats";

export function getEntryPath(entryId: string): string {
  return `/entry/${entryId}`;
}

export function getEntryUrl(entryId: string): string {
  return `${BASE_URL}${getEntryPath(entryId)}`;
}

export function getEntryOgImageUrl(entryId: string): string {
  return `${BASE_URL}/og/${entryId}.png`;
}

interface SeoData {
  title: string;
  description: string;
  url: string;
  type: "website" | "article";
  image: string;
  imageAlt: string;
}

function getOrCreateHeadElement<T extends HTMLElement>(selector: string, create: () => T): T {
  const existing = document.head.querySelector<T>(selector);
  if (existing) {
    return existing;
  }
  const el = create();
  document.head.appendChild(el);
  return el;
}

function setMetaTag(attribute: "name" | "property", key: string, content: string): void {
  const el = getOrCreateHeadElement<HTMLMetaElement>(`meta[${attribute}="${key}"]`, () => {
    const meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    return meta;
  });
  el.content = content;
}

function setCanonical(url: string): void {
  const link = getOrCreateHeadElement<HTMLLinkElement>('link[rel="canonical"]', () => {
    const l = document.createElement("link");
    l.rel = "canonical";
    return l;
  });
  link.href = url;
}

function setJsonLd(data: Record<string, unknown>): void {
  const script = getOrCreateHeadElement<HTMLScriptElement>("script#seo-json-ld", () => {
    const s = document.createElement("script");
    s.id = "seo-json-ld";
    s.type = "application/ld+json";
    return s;
  });
  script.textContent = JSON.stringify(data);
}

function applySeo(data: SeoData): void {
  document.title = data.title;

  setMetaTag("name", "description", data.description);
  setMetaTag("property", "og:title", data.title);
  setMetaTag("property", "og:description", data.description);
  setMetaTag("property", "og:url", data.url);
  setMetaTag("property", "og:type", data.type);
  setMetaTag("property", "og:locale", "en_US");
  setMetaTag("property", "og:site_name", "Bitrot");
  setMetaTag("property", "og:image", data.image);
  setMetaTag("property", "og:image:alt", data.imageAlt);
  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", data.title);
  setMetaTag("name", "twitter:description", data.description);
  setMetaTag("name", "twitter:image", data.image);

  setCanonical(data.url);
}

interface StaticPageConfig {
  title: string;
  description: string;
  path: string;
  jsonLdType: "WebSite" | "AboutPage" | "WebPage" | "CollectionPage";
}

const STATIC_PAGES: Record<StaticPage, StaticPageConfig> = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "",
    jsonLdType: "WebSite",
  },
  about: {
    title: "About · Bitrot",
    description:
      "About Bitrot: an interactive memorial for dead technology, built as short eulogies for software, services, and hardware people actually used.",
    path: "/about",
    jsonLdType: "AboutPage",
  },
  privacy: {
    title: "Privacy Policy · Bitrot",
    description:
      "How Bitrot handles data: cookieless Cloudflare Web Analytics, no personal information collected, no tracking across sites.",
    path: "/privacy",
    jsonLdType: "WebPage",
  },
  stats: {
    title: "Stats · Bitrot",
    description:
      "A memorial by the numbers. Causes of death, deaths by decade, average lifespan by category, and the most-mourned entries.",
    path: "/stats",
    jsonLdType: "CollectionPage",
  },
};

export function updatePageSeo(page: StaticPage): void {
  const config = STATIC_PAGES[page];
  const url = `${BASE_URL}${config.path}`;
  const image = `${BASE_URL}${DEFAULT_IMAGE_PATH}`;

  applySeo({
    title: config.title,
    description: config.description,
    url,
    type: "website",
    image,
    imageAlt: DEFAULT_IMAGE_ALT,
  });

  setJsonLd({
    "@context": "https://schema.org",
    "@type": config.jsonLdType,
    name: config.title,
    url,
    description: config.description,
    ...(page === "home" ? {} : { isPartOf: { "@type": "WebSite", name: "Bitrot", url: BASE_URL } }),
  });
}

export function updateSeo(entry: DeadTech | null): void {
  if (!entry) {
    updatePageSeo("home");
    return;
  }

  const truncatedAutopsy =
    entry.autopsy.length > 120 ? `${entry.autopsy.slice(0, 120)}…` : entry.autopsy;
  const description = `${entry.name} (${entry.born}–${entry.died}): ${entry.tagline}. ${truncatedAutopsy}`;
  const url = getEntryUrl(entry.id);
  const title = `${entry.name} — Bitrot`;

  applySeo({
    title,
    description,
    url,
    type: "article",
    image: getEntryOgImageUrl(entry.id),
    imageAlt: `${entry.name} — Bitrot`,
  });

  setJsonLd({
    "@context": "https://schema.org",
    "@type": "Article",
    name: entry.name,
    headline: `${entry.name}: ${entry.tagline}`,
    description,
    url,
    image: getEntryOgImageUrl(entry.id),
    datePublished: `${entry.died}-01-01`,
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
