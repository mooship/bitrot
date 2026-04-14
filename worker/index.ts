export interface Env {
  POURS: KVNamespace;
  ALLOWED_ORIGIN: string;
}

const VALID_ID = /^[a-z0-9-]{1,64}$/;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX = 10;

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

async function checkRateLimit(env: Env, ip: string): Promise<boolean> {
  const key = `rl:${ip}`;
  const raw = await env.POURS.get(key);
  const count = raw ? parseInt(raw, 10) || 0 : 0;
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

    if (origin !== allowedOrigin) {
      return new Response(null, { status: 403 });
    }

    const cors = corsHeaders(allowedOrigin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/pours" && request.method === "GET") {
      const list = await env.POURS.list({ prefix: "pour:" });
      const counts: Record<string, number> = {};
      await Promise.all(
        list.keys.map(async (key) => {
          const id = key.name.slice("pour:".length);
          const val = await env.POURS.get(key.name);
          counts[id] = val ? parseInt(val, 10) || 0 : 0;
        })
      );
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

      const key = `pour:${id}`;
      const current = await env.POURS.get(key);
      const next = (current ? parseInt(current, 10) || 0 : 0) + 1;
      await env.POURS.put(key, String(next));

      return json({ count: next }, 200, cors);
    }

    return json({ error: "Not found" }, 404, cors);
  },
};
