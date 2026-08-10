const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 20;
/** Sweep expired keys once the map gets big, so it can't grow without bound. */
const SWEEP_THRESHOLD = 500;

const hits = new Map<string, number[]>();

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

function sweep(now: number) {
  for (const [key, timestamps] of hits) {
    const live = timestamps.filter((t) => now - t < WINDOW_MS);
    if (live.length === 0) hits.delete(key);
    else hits.set(key, live);
  }
}

/**
 * Sliding-window limiter held in module memory.
 *
 * This is per-instance and resets on cold start, so on serverless it throttles a casual
 * script rather than a determined one. It exists to cap OpenAI spend on an endpoint that
 * has no auth in front of it. Swap in a Redis-backed limiter before a public launch.
 */
export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  if (hits.size > SWEEP_THRESHOLD) sweep(now);

  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    const oldest = timestamps[0];
    hits.set(key, timestamps);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000)),
    };
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return { allowed: true, remaining: MAX_REQUESTS - timestamps.length };
}

export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "anon";
}

/** Test seam — the window is module state that would otherwise leak between cases. */
export function resetRateLimits() {
  hits.clear();
}
