import type { WatchlistItem } from "@/lib/types";

import { NGX_SEED_STOCKS, NGX_SYMBOLS } from "./ngx-seed";

type TroveStock = {
  symbol?: string;
  ticker?: string;
  code?: string;
  name?: string;
  company_name?: string;
  price?: number;
  last_price?: number;
  current_price?: number;
  change?: number;
  change_percent?: number;
  changePercent?: number;
};

function parseTroveStock(raw: TroveStock): WatchlistItem | null {
  const symbol = (raw.symbol ?? raw.ticker ?? raw.code ?? "").toUpperCase();
  const seed = NGX_SEED_STOCKS.find((s) => s.symbol === symbol);
  if (!seed) return null;

  const price = raw.price ?? raw.last_price ?? raw.current_price;
  if (typeof price !== "number" || Number.isNaN(price)) return null;

  const change =
    raw.change ?? Math.round((price - seed.price) * 100) / 100;
  const changePercent =
    raw.change_percent ??
    raw.changePercent ??
    (seed.price === 0 ? 0 : Math.round((change / seed.price) * 10000) / 100);

  return {
    symbol: seed.symbol,
    name: raw.name ?? raw.company_name ?? seed.name,
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    sparkline: [...seed.sparkline.slice(-6), price],
  };
}

function extractStocks(payload: unknown): TroveStock[] {
  if (Array.isArray(payload)) return payload as TroveStock[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["data", "stocks", "results", "items", "quotes"]) {
      if (Array.isArray(obj[key])) return obj[key] as TroveStock[];
    }
  }
  return [];
}

export async function fetchTroveNgxQuotes(
  apiKey: string,
  baseUrl = "https://api.trovefinance.com",
  path = process.env.TROVE_NGX_STOCKS_PATH || "/api/v1/market/stocks",
  symbols: string[] = NGX_SYMBOLS
): Promise<WatchlistItem[]> {
  const url = new URL(path, baseUrl.replace(/\/$/, ""));
  url.searchParams.set("market", "NG");
  url.searchParams.set("country", "NG");
  url.searchParams.set("symbols", symbols.join(","));

  const response = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-API-Key": apiKey,
    },
    next: { revalidate: 30 },
  });

  if (!response.ok) return [];

  const payload = await response.json();
  return extractStocks(payload)
    .map(parseTroveStock)
    .filter((item): item is WatchlistItem => item !== null);
}
