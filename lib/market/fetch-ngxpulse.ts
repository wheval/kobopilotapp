import type { WatchlistItem } from "@/lib/types";

import { NGX_SEED_STOCKS, NGX_SYMBOLS } from "./ngx-seed";
import type { DailyBar } from "./types";

const NGXPULSE_BASE = "https://ngxpulse.ng";

/** Their equities snapshot refreshes every 20 minutes; polling faster only burns quota. */
const SNAPSHOT_REVALIDATE_SECS = 1200;
/** Daily bars change once per session. */
const HISTORY_REVALIDATE_SECS = 86_400;

type NgxPulseStock = {
  symbol?: string;
  name?: string;
  current_price?: number;
  previous_close?: number;
  change_percent?: number;
  official_change_percent?: number;
  pct_change_7d?: number;
  volume?: number;
  market_cap?: number;
  sector?: string;
  trade_date?: string;
};

type NgxPulseBar = {
  trade_date?: string;
  open_price?: number | null;
  high_price?: number | null;
  low_price?: number | null;
  close_price?: number | null;
  volume?: number | null;
};

function authHeaders(apiKey?: string): Record<string, string> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["X-API-Key"] = apiKey;
  return headers;
}

/**
 * The snapshot has been observed as a wrapper object, but the docs show a bare array.
 * Accept either rather than silently returning nothing and falling back to simulated
 * data forever.
 */
function extractRows<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function toWatchlistItem(stock: NgxPulseStock): WatchlistItem | null {
  const symbol = stock.symbol?.toUpperCase();
  if (!symbol) return null;

  const seed = NGX_SEED_STOCKS.find((s) => s.symbol === symbol);
  const price = stock.current_price;
  if (typeof price !== "number" || Number.isNaN(price)) return null;

  // The feed's previous_close is rounded to whole naira while change_percent is not —
  // GTCO comes back as 128 / 128 / -0.16%, which would render as "₦0.00 (-0.16%)".
  // Derive the close from the percent so the two figures always agree.
  const reportedPercent = stock.change_percent ?? stock.official_change_percent;
  const previousClose =
    typeof reportedPercent === "number" && reportedPercent !== -100
      ? price / (1 + reportedPercent / 100)
      : typeof stock.previous_close === "number"
        ? stock.previous_close
        : price;

  const change = round2(price - previousClose);
  const changePercent =
    reportedPercent ??
    (previousClose === 0 ? 0 : round2((change / previousClose) * 100));

  return {
    symbol,
    name: stock.name || seed?.name || symbol,
    price: round2(price),
    previousClose: round2(previousClose),
    change,
    changePercent: round2(changePercent),
    // Intentionally empty: this endpoint carries no history, and stitching the seed's
    // fabricated points onto a live price would label invented data as real.
    sparkline: [],
    volume: stock.volume,
    marketCap: stock.market_cap,
    sector: stock.sector,
    changePercent7d: stock.pct_change_7d,
    // Arrives as a full ISO timestamp ("2026-08-07T00:00:00"); callers compare dates.
    tradeDate: stock.trade_date?.slice(0, 10),
  };
}

export async function fetchNgxPulseQuotes(
  apiKey?: string,
  symbols: string[] = NGX_SYMBOLS
): Promise<WatchlistItem[]> {
  const response = await fetch(`${NGXPULSE_BASE}/api/ngxdata/stocks`, {
    headers: authHeaders(apiKey),
    next: { revalidate: SNAPSHOT_REVALIDATE_SECS },
  });

  if (!response.ok) return [];

  const rows = extractRows<NgxPulseStock>(await response.json(), [
    "stocks",
    "data",
    "results",
  ]);
  const order = symbols.map((s) => s.toUpperCase());
  const wanted = new Set(order);

  return rows
    .filter((row) => row.symbol && wanted.has(row.symbol.toUpperCase()))
    .map(toWatchlistItem)
    .filter((item): item is WatchlistItem => item !== null)
    // The API returns its own ordering; keep ours so the watchlist doesn't reshuffle
    // under the user between polls.
    .sort((a, b) => order.indexOf(a.symbol) - order.indexOf(b.symbol));
}

function toDailyBar(bar: NgxPulseBar): DailyBar | null {
  const close = bar.close_price;
  if (!bar.trade_date || typeof close !== "number" || Number.isNaN(close)) {
    return null;
  }

  return {
    date: bar.trade_date,
    open: typeof bar.open_price === "number" ? bar.open_price : close,
    // Left null when absent. NGXPulse does not publish intraday range, and deriving a
    // high/low from open and close would draw wicks that never happened.
    high: typeof bar.high_price === "number" ? bar.high_price : null,
    low: typeof bar.low_price === "number" ? bar.low_price : null,
    close,
    volume: typeof bar.volume === "number" ? bar.volume : 0,
  };
}

export async function fetchNgxPulseHistory(
  symbol: string,
  days: number,
  apiKey?: string
): Promise<DailyBar[]> {
  const url = new URL(
    `/api/ngxdata/prices/${encodeURIComponent(symbol.toUpperCase())}`,
    NGXPULSE_BASE
  );
  url.searchParams.set("days", String(Math.max(1, Math.floor(days))));

  const response = await fetch(url.toString(), {
    headers: authHeaders(apiKey),
    next: { revalidate: HISTORY_REVALIDATE_SECS },
  });

  if (!response.ok) return [];

  const rows = extractRows<NgxPulseBar>(await response.json(), [
    "prices",
    "history",
    "data",
  ]);

  return rows
    .map(toDailyBar)
    .filter((bar): bar is DailyBar => bar !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}
