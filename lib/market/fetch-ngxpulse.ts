import type { WatchlistItem } from "@/lib/types";

import { NGX_SEED_STOCKS, NGX_SYMBOLS } from "./ngx-seed";

type NgxPulseStock = {
  symbol: string;
  name: string;
  current_price: number;
  previous_close?: number;
  change_percent?: number;
};

type NgxPulseResponse = {
  stocks?: NgxPulseStock[];
};

const NGXPULSE_BASE = "https://www.ngxpulse.ng";

function toWatchlistItem(stock: NgxPulseStock): WatchlistItem | null {
  const seed = NGX_SEED_STOCKS.find((s) => s.symbol === stock.symbol);
  if (!seed) return null;

  const price = stock.current_price;
  if (typeof price !== "number" || Number.isNaN(price)) return null;

  const previous = stock.previous_close ?? seed.price;
  const change = Math.round((price - previous) * 100) / 100;
  const changePercent =
    stock.change_percent ??
    (previous === 0 ? 0 : Math.round((change / previous) * 10000) / 100);

  return {
    symbol: stock.symbol,
    name: stock.name || seed.name,
    price: Math.round(price * 100) / 100,
    previousClose: Math.round(previous * 100) / 100,
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    sparkline: [...seed.sparkline.slice(-6), price],
  };
}

export async function fetchNgxPulseQuotes(
  apiKey?: string,
  symbols: string[] = NGX_SYMBOLS
): Promise<WatchlistItem[]> {
  const headers: Record<string, string> = {
    accept: "application/json",
    "Content-Type": "application/json",
  };
  if (apiKey) headers["X-API-Key"] = apiKey;

  const response = await fetch(`${NGXPULSE_BASE}/api/ngxdata/stocks`, {
    headers,
    next: { revalidate: 30 },
  });

  if (!response.ok) return [];

  const payload = (await response.json()) as NgxPulseResponse | NgxPulseStock[];
  const stocks = Array.isArray(payload) ? payload : payload.stocks ?? [];
  const symbolSet = new Set(symbols.map((s) => s.toUpperCase()));

  return stocks
    .filter((s) => symbolSet.has(s.symbol.toUpperCase()))
    .map(toWatchlistItem)
    .filter((item): item is WatchlistItem => item !== null);
}
