import type { MarketQuotesResponse } from "./types";
import { fetchItickNgxQuotes } from "./fetch-itick";
import { NGX_SEED_STOCKS } from "./ngx-seed";
import { simulateNgxQuotes } from "./simulate-prices";

let lastSimulated: typeof NGX_SEED_STOCKS = NGX_SEED_STOCKS;

export async function getNgxQuotes(): Promise<MarketQuotesResponse> {
  const token = process.env.ITICK_API_TOKEN;
  const now = Date.now();

  if (token) {
    try {
      const live = await fetchItickNgxQuotes(token);
      if (live.length >= 3) {
        lastSimulated = live;
        return {
          quotes: live,
          source: "live",
          updatedAt: now,
          market: "NGX",
        };
      }
    } catch {
      // fall through to simulated NGX demo data
    }
  }

  lastSimulated = simulateNgxQuotes(lastSimulated, now);
  return {
    quotes: lastSimulated,
    source: "simulated",
    updatedAt: now,
    market: "NGX",
  };
}
