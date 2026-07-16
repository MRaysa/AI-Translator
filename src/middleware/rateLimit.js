import { getConfig } from "../config.js";

/**
 * Best-effort per-IP fixed-window rate limiter.
 *
 * NOTE: state is in-memory per Worker isolate, so it's a lightweight abuse
 * guard rather than a strict global limit. For strict, globally-consistent
 * limits use Cloudflare's Rate Limiting binding, KV, or a Durable Object.
 */
const hits = new Map(); // ip -> { count, resetAt }

export async function rateLimit(c, next) {
  const { rateLimit: limit, rateWindowSec } = getConfig(c.env);
  const windowMs = rateWindowSec * 1000;
  const ip = c.req.header("CF-Connecting-IP") || c.req.header("x-forwarded-for") || "unknown";
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow unbounded.
  if (hits.size > 10000) {
    for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
  }

  let rec = hits.get(ip);
  if (!rec || now > rec.resetAt) {
    rec = { count: 0, resetAt: now + windowMs };
    hits.set(ip, rec);
  }
  rec.count++;

  const remaining = Math.max(0, limit - rec.count);
  c.header("X-RateLimit-Limit", String(limit));
  c.header("X-RateLimit-Remaining", String(remaining));

  if (rec.count > limit) {
    const retry = Math.ceil((rec.resetAt - now) / 1000);
    c.header("Retry-After", String(retry));
    return c.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests. Please slow down." } },
      429
    );
  }

  await next();
}
