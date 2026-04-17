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

function totalsCacheKey(): Request {
  return new Request(TOTALS_CACHE_URL);
}

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
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
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

let corsState: { cors: Record<string, string>; parsed: URL | null } | null = null;

function getCorsState(allowedOrigin: string) {
  if (corsState !== null) {
    return corsState;
  }
  let parsed: URL | null;
  try {
    parsed = new URL(allowedOrigin);
  } catch {
    parsed = null;
  }
  corsState = {
    parsed,
    cors: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, If-None-Match",
      "Access-Control-Expose-Headers": "ETag",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  };
  return corsState;
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
      this.count =
        typeof stored === "number"
          ? parseCount(stored)
          : parseCount(await this.env.POURS.get(`${POUR_PREFIX}${id}`));
    }

    const next = this.count + 1;
    this.count = next;

    await Promise.all([
      this.state.storage.put("count", next),
      this.env.POURS.put(`${POUR_PREFIX}${id}`, String(next), {
        metadata: { count: next },
      }),
    ]);

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

async function buildTotalsResponse(env: Env, cors: Record<string, string>): Promise<Response> {
  const counts = await readTotals(env);
  const body = JSON.stringify(counts);
  const etag = `"${await sha256Hex(body)}"`;
  return new Response(body, {
    status: 200,
    headers: {
      ...cors,
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${TOTALS_SMAXAGE}, s-maxage=${TOTALS_SMAXAGE}`,
      ETag: etag,
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") ?? "";
    const { cors, parsed } = getCorsState(env.ALLOWED_ORIGIN);

    if (!originsMatch(origin, parsed)) {
      return new Response(null, { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/pours" && request.method === "GET") {
      const cache = caches.default;
      const cacheKey = totalsCacheKey();
      const ifNoneMatch = request.headers.get("If-None-Match");

      let response = await cache.match(cacheKey);
      if (!response) {
        response = await buildTotalsResponse(env, cors);
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }

      if (ifNoneMatch && response.headers.get("ETag") === ifNoneMatch) {
        return new Response(null, { status: 304, headers: response.headers });
      }
      return response;
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
        Promise.all([env.POURS.delete(TOTALS_KEY), caches.default.delete(totalsCacheKey())])
      );

      return jsonResponse({ count: next }, 200, cors);
    }

    return jsonResponse({ error: "Not found" }, 404, cors);
  },
};
