"use client";

import { create } from "zustand";

import {
  getMarketSession,
  isQuoteStale,
  type MarketSession,
} from "@/lib/market/market-hours";
import { NGX_SEED_STOCKS } from "@/lib/market/ngx-seed";
import type {
  DailyBar,
  MarketProvider,
  MarketSource,
} from "@/lib/market/types";
import type { WatchlistItem } from "@/lib/types";

type HistoryEntry = {
  bars: DailyBar[];
  source: MarketSource;
  fetchedAt: number;
};

type MarketState = {
  quotes: WatchlistItem[];
  quotesBySymbol: Record<string, WatchlistItem>;
  source: MarketSource;
  provider: MarketProvider;
  updatedAt: number | null;
  isLoading: boolean;
  pollId: ReturnType<typeof setInterval> | null;
  session: MarketSession;
  /** True when the feed's last trade date has fallen behind — typically a holiday. */
  staleFeed: boolean;
  history: Record<string, HistoryEntry>;
  historyLoading: Record<string, boolean>;
  fetchQuotes: () => Promise<void>;
  fetchHistory: (symbol: string) => Promise<void>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
  getQuote: (symbol: string) => WatchlistItem | undefined;
  getHistory: (symbol: string) => HistoryEntry | undefined;
};

function indexQuotes(quotes: WatchlistItem[]) {
  return Object.fromEntries(quotes.map((q) => [q.symbol, q]));
}

/** Re-fetch a symbol's daily bars at most once an hour; they change once a session. */
const HISTORY_TTL_MS = 60 * 60 * 1000;
const DEFAULT_POLL_MS = 60_000;

export const useMarketStore = create<MarketState>((set, get) => ({
  quotes: NGX_SEED_STOCKS,
  quotesBySymbol: indexQuotes(NGX_SEED_STOCKS),
  source: "simulated",
  provider: "simulated",
  // Null until the first fetch, not Date.now(). The seed quotes have no real update
  // time, and evaluating Date.now() here runs once on the server and again on the
  // client, so anything rendering this timestamp fails hydration by a second.
  updatedAt: null,
  isLoading: false,
  pollId: null,
  session: getMarketSession(),
  staleFeed: false,
  history: {},
  historyLoading: {},

  fetchQuotes: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/market/quotes", { cache: "no-store" });
      if (!response.ok) throw new Error("quotes failed");
      const data = (await response.json()) as {
        quotes: WatchlistItem[];
        source: MarketSource;
        provider: MarketProvider;
        updatedAt: number;
      };
      set({
        quotes: data.quotes,
        quotesBySymbol: indexQuotes(data.quotes),
        source: data.source,
        provider: data.provider,
        updatedAt: data.updatedAt,
        session: getMarketSession(),
        staleFeed:
          data.source === "live" && isQuoteStale(data.quotes[0]?.tradeDate),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchHistory: async (symbol) => {
    const key = symbol.toUpperCase();
    const existing = get().history[key];
    if (existing && Date.now() - existing.fetchedAt < HISTORY_TTL_MS) return;
    if (get().historyLoading[key]) return;

    set((state) => ({ historyLoading: { ...state.historyLoading, [key]: true } }));

    try {
      const response = await fetch(`/api/market/history/${key}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("history failed");
      const data = (await response.json()) as {
        bars: DailyBar[];
        source: MarketSource;
      };

      set((state) => ({
        history: {
          ...state.history,
          [key]: {
            bars: data.bars,
            source: data.source,
            fetchedAt: Date.now(),
          },
        },
        historyLoading: { ...state.historyLoading, [key]: false },
      }));
    } catch {
      set((state) => ({
        historyLoading: { ...state.historyLoading, [key]: false },
      }));
    }
  },

  startPolling: (intervalMs = DEFAULT_POLL_MS) => {
    const existing = get().pollId;
    if (existing) clearInterval(existing);

    // Always fetch once on mount, even out of hours — we still want the last close.
    void get().fetchQuotes();

    const pollId = setInterval(() => {
      const session = getMarketSession();
      set({ session });
      // Nothing changes upstream while the NGX is shut, so don't spend a request on it.
      if (!session.isOpen) return;
      void get().fetchQuotes();
    }, intervalMs);

    set({ pollId, session: getMarketSession() });
  },

  stopPolling: () => {
    const pollId = get().pollId;
    if (pollId) clearInterval(pollId);
    set({ pollId: null });
  },

  getQuote: (symbol) => get().quotesBySymbol[symbol],
  getHistory: (symbol) => get().history[symbol.toUpperCase()],
}));
