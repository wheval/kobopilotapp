import type { WatchlistItem } from "@/lib/types";

export type MarketSource = "live" | "simulated";

export type MarketProvider = "ngxpulse" | "trove" | "itick" | "simulated";

export type MarketQuotesResponse = {
  quotes: WatchlistItem[];
  source: MarketSource;
  provider: MarketProvider;
  updatedAt: number;
  market: "NGX";
};
