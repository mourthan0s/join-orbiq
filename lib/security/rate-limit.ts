/**
 * Rate limiting for the registration endpoint.
 *
 * Default implementation is an in-memory sliding window, which is correct for
 * a single Node process (Hostinger `next start`). The RateLimiter interface
 * is the integration point for a shared store (Upstash Redis, Postgres) when
 * the app scales to multiple instances.
 */

export interface RateLimiter {
  /** Returns true when the request is allowed. */
  check(key: string): Promise<boolean>;
}

type WindowEntry = { count: number; windowStart: number };

export function createMemoryRateLimiter(opts: {
  windowMs: number;
  max: number;
}): RateLimiter {
  const entries = new Map<string, WindowEntry>();

  // Prevent unbounded growth: drop stale windows occasionally.
  function sweep(now: number) {
    if (entries.size < 10_000) return;
    for (const [key, entry] of entries) {
      if (now - entry.windowStart > opts.windowMs) entries.delete(key);
    }
  }

  return {
    async check(key: string) {
      const now = Date.now();
      sweep(now);
      const entry = entries.get(key);
      if (!entry || now - entry.windowStart > opts.windowMs) {
        entries.set(key, { count: 1, windowStart: now });
        return true;
      }
      entry.count += 1;
      return entry.count <= opts.max;
    },
  };
}

// 10 submissions per 10 minutes per client key — generous for a table of
// friends sharing one connection, tight enough to blunt scripted abuse.
export const registrationRateLimiter = createMemoryRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
});

/** Derives a privacy-safe limiter key from a request (IP is hashed, not stored). */
export async function rateLimitKey(request: Request): Promise<string> {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  const data = new TextEncoder().encode(`orbiq-rl:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(digest).toString("hex").slice(0, 32);
}
