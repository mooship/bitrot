export interface Env {
  POURS: KVNamespace;
  ALLOWED_ORIGIN: string;
}

type PourCounts = Record<string, number>;

const VALID_ID = /^[a-z0-9-]{1,64}$/;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX = 10;
const TOTALS_KEY = "meta:totals";
const POUR_PREFIX = "pour:";
const RATE_LIMIT_PREFIX = "rl:";

function parseCount(raw: string | null): number {
  if (raw === null) {
    return 0;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return Math.floor(n);
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
  const list = await env.POURS.list({ prefix: POUR_PREFIX });
  const counts: PourCounts = {};
  await Promise.all(
    list.keys.map(async (key) => {
      const id = key.name.slice(POUR_PREFIX.length);
      counts[id] = parseCount(await env.POURS.get(key.name));
    })
  );
  await env.POURS.put(TOTALS_KEY, JSON.stringify(counts));
  return counts;
}

async function readTotals(env: Env): Promise<PourCounts> {
  const raw = await env.POURS.get(TOTALS_KEY);
  if (raw !== null) {
    const validated = parseTotals(raw);
    if (validated !== null) {
      return validated;
    }
    console.warn("meta:totals failed validation; rebuilding from pour:* keys");
  }
  return rebuildTotals(env);
}

function corsHeaders(allowedOrigin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function originsMatch(requestOrigin: string, allowed: string): boolean {
  if (!requestOrigin || !allowed) {
    return false;
  }
  try {
    const a = new URL(requestOrigin);
    const b = new URL(allowed);
    return a.protocol === b.protocol && a.host === b.host;
  } catch {
    return false;
  }
}

async function checkRateLimit(env: Env, ip: string): Promise<boolean> {
  const key = `${RATE_LIMIT_PREFIX}${ip}`;
  const count = parseCount(await env.POURS.get(key));
  if (count >= RATE_LIMIT_MAX) {
    return false;
  }
  await env.POURS.put(key, String(count + 1), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });
  return true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") ?? "";
    const allowedOrigin = env.ALLOWED_ORIGIN;

    if (!originsMatch(origin, allowedOrigin)) {
      return new Response(null, { status: 403 });
    }

    const cors = corsHeaders(allowedOrigin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/pours" && request.method === "GET") {
      const counts = await readTotals(env);
      return json(counts, 200, cors);
    }

    const pourMatch = /^\/pours\/([a-z0-9-]+)$/.exec(url.pathname);
    if (pourMatch) {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405, cors);
      }

      const id = pourMatch[1];

      if (!VALID_ID.test(id)) {
        return json({ error: "Invalid entry ID" }, 400, cors);
      }

      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";

      const allowed = await checkRateLimit(env, ip);
      if (!allowed) {
        return json({ error: "Rate limit exceeded" }, 429, cors);
      }

      const key = `${POUR_PREFIX}${id}`;
      const current = parseCount(await env.POURS.get(key));
      const next = current + 1;
      await env.POURS.put(key, String(next));
      // Invalidate the totals cache rather than read-modify-writing it. Per-id
      // `pour:<id>` keys are the source of truth; the next GET /pours rebuilds
      // from them via list(). Avoids the lost-update race on meta:totals.
      await env.POURS.delete(TOTALS_KEY);

      return json({ count: next }, 200, cors);
    }

    return json({ error: "Not found" }, 404, cors);
  },
};
