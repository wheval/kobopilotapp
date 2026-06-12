import type { WatchlistItem } from "@/lib/types";

import { NGX_SEED_STOCKS, NGX_SYMBOLS } from "./ngx-seed";

type ItickQuote = {
  c?: number;
  lp?: number;
  last?: number;
  price?: number;
  ch?: number;
  change?: number;
  chp?: number;
  changePercent?: number;
};

function parseItickQuote(symbol: string, payload: ItickQuote): WatchlistItem | null {
  const seed = NGX_SEED_STOCKS.find((s) => s.symbol === symbol);
  if (!seed) return null;

  const price = payload.lp ?? payload.c ?? payload.last ?? payload.price;
  if (typeof price !== "number" || Number.isNaN(price)) return null;

  const change =
    payload.ch ?? payload.change ?? Math.round((price - seed.price) * 100) / 100;
  const changePercent =
    payload.chp ??
    payload.changePercent ??
    (seed.price === 0 ? 0 : Math.round((change / seed.price) * 10000) / 100);

  return {
    symbol: seed.symbol,
    name: seed.name,
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    sparkline: [...seed.sparkline.slice(-6), price],
  };
}

export async function fetchItickNgxQuotes(
  token: string,
  symbols: string[] = NGX_SYMBOLS
): Promise<WatchlistItem[]> {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const url = new URL("https://api.itick.org/stock/quote");
      url.searchParams.set("region", "NG");
      url.searchParams.set("code", symbol);

      const response = await fetch(url.toString(), {
        headers: {
          accept: "application/json",
          token,
        },
        next: { revalidate: 30 },
      });

      if (!response.ok) return null;

      const data = (await response.json()) as ItickQuote | { data?: ItickQuote };
      const payload = "data" in data && data.data ? data.data : data;
      return parseItickQuote(symbol, payload as ItickQuote);
    })
  );

  return results.filter((item): item is WatchlistItem => item !== null);
}
