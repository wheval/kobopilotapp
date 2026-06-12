import type { WatchlistItem } from "@/lib/types";

import { NGX_SEED_STOCKS } from "./ngx-seed";

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Deterministic micro-moves so demo prices feel alive without an API key */
export function simulateNgxQuotes(
  previous: WatchlistItem[] = NGX_SEED_STOCKS,
  at = Date.now()
): WatchlistItem[] {
  const bucket = Math.floor(at / 30_000);

  return NGX_SEED_STOCKS.map((seed) => {
    const prev = previous.find((p) => p.symbol === seed.symbol) ?? seed;
    const noise = hashString(`${seed.symbol}:${bucket}`) % 1000;
    const driftPct = (noise - 500) / 50_000;
    const nextPrice = Math.max(
      seed.price * 0.75,
      Math.min(seed.price * 1.25, prev.price * (1 + driftPct))
    );
    const rounded = Math.round(nextPrice * 100) / 100;
    const previousClose =
      Math.round((seed.price - seed.change) * 100) / 100;
    const change = Math.round((rounded - previousClose) * 100) / 100;
    const changePercent =
      previousClose === 0
        ? 0
        : Math.round((change / previousClose) * 10000) / 100;
    const sparkline = [...prev.sparkline.slice(-6), rounded];

    return {
      ...seed,
      price: rounded,
      previousClose,
      change,
      changePercent,
      sparkline,
    };
  });
}
