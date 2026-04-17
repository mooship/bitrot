export interface Env {
  POURS: KVNamespace;
  POUR_COUNTER: DurableObjectNamespace;
  POUR_RATE_LIMITER: RateLimit;
  ALLOWED_ORIGIN: string;
}

interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

type PourCounts = Record<string, number>;

const VALID_ID = /^[a-z0-9-]{1,64}$/;
const POUR_PATH = /^\/pours\/([a-z0-9-]+)$/;
const TOTALS_KEY = "meta:totals";
const POUR_PREFIX = "pour:";
const TOTALS_CACHE_TTL = 60;
const TOTALS_SMAXAGE = 30;
const TOTALS_CACHE_URL = "https://bitrot-worker.internal/cache/pours";

function parseCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) {
      return Math.floor(n);
    }
  }
  return 0;
}

function parseTotals(raw: string): PourCounts | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const result: PourCounts = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return null;
    }
    result[key] = value;
  }
  return result;
}

async function rebuildTotals(env: Env): Promise<PourCounts> {
  const counts: PourCounts = {};
  let cursor: string | undefined;
  do {
    const page = await env.POURS.list<{ count: number }>({
      prefix: POUR_PREFIX,
      cursor,
    });
    for (const key of page.keys) {
      const id = key.name.slice(POUR_PREFIX.length);
      counts[id] = parseCount(key.metadata?.count);
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  await env.POURS.put(TOTALS_KEY, JSON.stringify(counts));
  return counts;
}

async function readTotals(env: Env): Promise<PourCounts> {
  const raw = await env.POURS.get(TOTALS_KEY, { cacheTtl: TOTALS_CACHE_TTL });
  if (raw !== null) {
    const validated = parseTotals(raw);
    if (validated !== null) {
      return validated;
    }
    console.warn("meta:totals failed validation; rebuilding from pour:* keys");
  }
  return rebuildTotals(env);
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  const view = new Uint8Array(hash);
  let hex = "";
  for (let i = 0; i < view.length; i++) {
    hex += view[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function originsMatch(requestOrigin: string, parsedAllowed: URL | null): boolean {
  if (!requestOrigin || !parsedAllowed) {
    return false;
  }
  try {
    const a = new URL(requestOrigin);
    return a.protocol === parsedAllowed.protocol && a.host === parsedAllowed.host;
  } catch {
    return false;
  }
}

function parseAllowedOrigin(allowed: string): URL | null {
  try {
    return new URL(allowed);
  } catch {
    return null;
  }
}

let cachedAllowedOrigin: string | null = null;
let cachedParsedOrigin: URL | null = null;
let cachedCorsHeaders: Record<string, string> | null = null;

function getCorsHeaders(allowedOrigin: string): Record<string, string> {
  if (cachedAllowedOrigin !== allowedOrigin || !cachedCorsHeaders) {
    cachedAllowedOrigin = allowedOrigin;
    cachedParsedOrigin = parseAllowedOrigin(allowedOrigin);
    cachedCorsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, If-None-Match",
      "Access-Control-Expose-Headers": "ETag",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };
  }
  return cachedCorsHeaders;
}

function getParsedAllowedOrigin(allowedOrigin: string): URL | null {
  getCorsHeaders(allowedOrigin);
  return cachedParsedOrigin;
}

function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

export class PourCounter {
  private state: DurableObjectState;
  private env: Env;
  private count: number | null = null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") ?? "";

    if (this.count === null) {
      const stored = await this.state.storage.get<number>("count");
      if (typeof stored === "number" && Number.isFinite(stored) && stored >= 0) {
        this.count = Math.floor(stored);
      } else {
        const fallback = parseCount(await this.env.POURS.get(`${POUR_PREFIX}${id}`));
        this.count = fallback;
        await this.state.storage.put("count", fallback);
      }
    }

    const next = this.count + 1;
    this.count = next;
    await this.state.storage.put("count", next);

    await this.env.POURS.put(`${POUR_PREFIX}${id}`, String(next), {
      metadata: { count: next },
    });

    return new Response(JSON.stringify({ count: next }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function incrementPour(env: Env, id: string): Promise<number> {
  const doId = env.POUR_COUNTER.idFromName(id);
  const stub = env.POUR_COUNTER.get(doId);
  const res = await stub.fetch(`https://do.invalid/increment?id=${encodeURIComponent(id)}`);
  const data = (await res.json()) as { count: number };
  return data.count;
}

async function buildTotalsResponse(
  env: Env,
  cors: Record<string, string>,
  ifNoneMatch: string | null
): Promise<Response> {
  const counts = await readTotals(env);
  const body = JSON.stringify(counts);
  const etag = `"${await sha256Hex(body)}"`;

  const headers: Record<string, string> = {
    ...cors,
    "Content-Type": "application/json",
    "Cache-Control": `public, max-age=${TOTALS_SMAXAGE}, s-maxage=${TOTALS_SMAXAGE}`,
    ETag: etag,
  };

  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(body, { status: 200, headers });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") ?? "";
    const allowedOrigin = env.ALLOWED_ORIGIN;
    const parsedAllowed = getParsedAllowedOrigin(allowedOrigin);

    if (!originsMatch(origin, parsedAllowed)) {
      return new Response(null, { status: 403 });
    }

    const cors = getCorsHeaders(allowedOrigin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/pours" && request.method === "GET") {
      const cache = caches.default;
      const cacheKey = new Request(TOTALS_CACHE_URL, { method: "GET" });
      const ifNoneMatch = request.headers.get("If-None-Match");

      const cached = await cache.match(cacheKey);
      if (cached) {
        const etag = cached.headers.get("ETag");
        const headers = new Headers(cached.headers);
        for (const [k, v] of Object.entries(cors)) {
          headers.set(k, v);
        }
        if (ifNoneMatch && etag && ifNoneMatch === etag) {
          return new Response(null, { status: 304, headers });
        }
        return new Response(cached.body, { status: cached.status, headers });
      }

      const fresh = await buildTotalsResponse(env, cors, null);
      const toCache = new Response(fresh.clone().body, {
        status: 200,
        headers: fresh.headers,
      });
      ctx.waitUntil(cache.put(cacheKey, toCache));

      if (ifNoneMatch && fresh.headers.get("ETag") === ifNoneMatch) {
        return new Response(null, { status: 304, headers: fresh.headers });
      }
      return fresh;
    }

    const pourMatch = POUR_PATH.exec(url.pathname);
    if (pourMatch) {
      if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405, cors);
      }

      const id = pourMatch[1];

      if (!VALID_ID.test(id)) {
        return jsonResponse({ error: "Invalid entry ID" }, 400, cors);
      }

      const ip = request.headers.get("CF-Connecting-IP");
      if (!ip) {
        return jsonResponse({ error: "Unable to determine client IP" }, 400, cors);
      }

      const { success } = await env.POUR_RATE_LIMITER.limit({ key: ip });
      if (!success) {
        return jsonResponse({ error: "Rate limit exceeded" }, 429, cors);
      }

      const next = await incrementPour(env, id);

      ctx.waitUntil(
        Promise.all([
          env.POURS.delete(TOTALS_KEY),
          caches.default.delete(new Request(TOTALS_CACHE_URL, { method: "GET" })),
        ])
      );

      return jsonResponse({ count: next }, 200, cors);
    }

    return jsonResponse({ error: "Not found" }, 404, cors);
  },
};
