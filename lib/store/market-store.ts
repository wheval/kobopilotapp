"use client";

import { create } from "zustand";

import type { MarketSource } from "@/lib/market/types";
import { NGX_SEED_STOCKS } from "@/lib/market/ngx-seed";
import type { WatchlistItem } from "@/lib/types";

type MarketState = {
  quotes: WatchlistItem[];
  quotesBySymbol: Record<string, WatchlistItem>;
  source: MarketSource;
  updatedAt: number | null;
  isLoading: boolean;
  pollId: ReturnType<typeof setInterval> | null;
  fetchQuotes: () => Promise<void>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
  getQuote: (symbol: string) => WatchlistItem | undefined;
};

function indexQuotes(quotes: WatchlistItem[]) {
  return Object.fromEntries(quotes.map((q) => [q.symbol, q]));
}

export const useMarketStore = create<MarketState>((set, get) => ({
  quotes: NGX_SEED_STOCKS,
  quotesBySymbol: indexQuotes(NGX_SEED_STOCKS),
  source: "simulated",
  updatedAt: null,
  isLoading: false,
  pollId: null,

  fetchQuotes: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/market/quotes", { cache: "no-store" });
      if (!response.ok) throw new Error("quotes failed");
      const data = (await response.json()) as {
        quotes: WatchlistItem[];
        source: MarketSource;
        updatedAt: number;
      };
      set({
        quotes: data.quotes,
        quotesBySymbol: indexQuotes(data.quotes),
        source: data.source,
        updatedAt: data.updatedAt,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  startPolling: (intervalMs = 30_000) => {
    const existing = get().pollId;
    if (existing) clearInterval(existing);
    void get().fetchQuotes();
    const pollId = setInterval(() => {
      void get().fetchQuotes();
    }, intervalMs);
    set({ pollId });
  },

  stopPolling: () => {
    const pollId = get().pollId;
    if (pollId) clearInterval(pollId);
    set({ pollId: null });
  },

  getQuote: (symbol) => get().quotesBySymbol[symbol],
}));
