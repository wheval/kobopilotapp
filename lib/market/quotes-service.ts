import type { MarketHistoryResponse, MarketQuotesResponse } from "./types";
import { fetchItickNgxQuotes } from "./fetch-itick";
import { fetchNgxPulseHistory, fetchNgxPulseQuotes } from "./fetch-ngxpulse";
import { fetchTroveNgxQuotes } from "./fetch-trove";
import { NGX_SEED_STOCKS } from "./ngx-seed";
import { simulateNgxQuotes } from "./simulate-prices";

let lastSimulated: typeof NGX_SEED_STOCKS = NGX_SEED_STOCKS;

function success(
  quotes: typeof NGX_SEED_STOCKS,
  provider: MarketQuotesResponse["provider"],
  now: number
): MarketQuotesResponse {
  lastSimulated = quotes;
  return {
    quotes,
    source: "live",
    provider,
    updatedAt: now,
    market: "NGX",
  };
}

export async function getNgxQuotes(): Promise<MarketQuotesResponse> {
  const now = Date.now();
  const ngxpulseKey = process.env.NGXPULSE_API_KEY;
  const troveKey = process.env.TROVE_API_KEY;
  const troveBase = process.env.TROVE_API_BASE || "https://api.trovefinance.com";
  const itickToken = process.env.ITICK_API_TOKEN;

  try {
    const ngxpulse = await fetchNgxPulseQuotes(ngxpulseKey);
    if (ngxpulse.length >= 3) return success(ngxpulse, "ngxpulse", now);
  } catch {
    // try next provider
  }

  if (troveKey) {
    try {
      const trove = await fetchTroveNgxQuotes(troveKey, troveBase);
      if (trove.length >= 3) return success(trove, "trove", now);
    } catch {
      // try next provider
    }
  }

  if (itickToken) {
    try {
      const itick = await fetchItickNgxQuotes(itickToken);
      if (itick.length >= 3) return success(itick, "itick", now);
    } catch {
      // fall through
    }
  }

  lastSimulated = simulateNgxQuotes(lastSimulated, now);
  return {
    quotes: lastSimulated,
    source: "simulated",
    provider: "simulated",
    updatedAt: now,
    market: "NGX",
  };
}

/**
 * Daily bars for one symbol.
 *
 * NGXPulse is the only configured provider that publishes history, and there is no
 * simulated substitute on purpose: inventing a daily series and serving it from the
 * "live" chart would be presenting fabricated history as real. With no key the caller
 * gets an empty set and the UI offers demo mode instead.
 */
export async function getNgxHistory(
  symbol: string,
  days: number
): Promise<MarketHistoryResponse> {
  const now = Date.now();
  const ngxpulseKey = process.env.NGXPULSE_API_KEY;

  if (ngxpulseKey) {
    try {
      const bars = await fetchNgxPulseHistory(symbol, days, ngxpulseKey);
      if (bars.length > 0) {
        return {
          symbol: symbol.toUpperCase(),
          bars,
          source: "live",
          provider: "ngxpulse",
          updatedAt: now,
        };
      }
    } catch {
      // fall through to the empty response
    }
  }

  return {
    symbol: symbol.toUpperCase(),
    bars: [],
    source: "simulated",
    provider: "simulated",
    updatedAt: now,
  };
}
