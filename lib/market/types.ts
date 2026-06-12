import type { WatchlistItem } from "@/lib/types";

export type MarketSource = "live" | "simulated";

export type MarketQuotesResponse = {
  quotes: WatchlistItem[];
  source: MarketSource;
  updatedAt: number;
  market: "NGX";
};
