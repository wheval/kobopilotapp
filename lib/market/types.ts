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

/**
 * One session's bar. NGXPulse publishes close and volume but leaves high and low null,
 * so those stay nullable rather than being quietly faked from the close.
 */
export type DailyBar = {
  date: string;
  open: number;
  high: number | null;
  low: number | null;
  close: number;
  volume: number;
};

export type MarketHistoryResponse = {
  symbol: string;
  bars: DailyBar[];
  source: MarketSource;
  provider: MarketProvider;
  updatedAt: number;
};
