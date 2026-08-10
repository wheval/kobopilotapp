import { create } from "zustand";
import { persist } from "zustand/middleware";

import { formatNgn } from "@/lib/format-currency";
import { NGX_SEED_STOCKS } from "@/lib/market/ngx-seed";
import { PAPER_STARTING_CASH } from "@/lib/paper-trading";
import { useMarketStore } from "@/lib/store/market-store";
import type { Holding, OrderSide, Trade } from "@/lib/types";

type TradingState = {
  cash: number;
  holdings: Holding[];
  trades: Trade[];
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  getPrice: (symbol: string) => number;
  getStockName: (symbol: string) => string;
  placeOrder: (
    symbol: string,
    side: OrderSide,
    quantity: number
  ) => { success: boolean; message: string };
  getPortfolioValue: () => number;
  getTotalPnL: () => number;
  resetPortfolio: () => void;
};

function createInitialState() {
  return {
    cash: PAPER_STARTING_CASH,
    holdings: [] as Holding[],
    trades: [] as Trade[],
    selectedSymbol: NGX_SEED_STOCKS[0]?.symbol ?? "DANGCEM",
  };
}

function seedName(symbol: string) {
  return NGX_SEED_STOCKS.find((s) => s.symbol === symbol)?.name ?? symbol;
}

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

      getPrice: (symbol) => {
        const live = useMarketStore.getState().getQuote(symbol);
        if (live) return live.price;
        return NGX_SEED_STOCKS.find((s) => s.symbol === symbol)?.price ?? 0;
      },

      getStockName: (symbol) => {
        const live = useMarketStore.getState().getQuote(symbol);
        return live?.name ?? seedName(symbol);
      },

      placeOrder: (symbol, side, quantity) => {
        if (quantity <= 0 || !Number.isInteger(quantity)) {
          return { success: false, message: "Enter a valid whole number of shares." };
        }

        const price = get().getPrice(symbol);
        if (price <= 0) {
          return { success: false, message: "Unknown symbol." };
        }

        const total = price * quantity;
        const { cash, holdings } = get();

        if (side === "buy") {
          if (total > cash) {
            return { success: false, message: "Insufficient cash for this order." };
          }

          const existing = holdings.find((h) => h.symbol === symbol);
          const newHoldings = [...holdings];

          if (existing) {
            const newQty = existing.quantity + quantity;
            const newAvg =
              (existing.avgPrice * existing.quantity + total) / newQty;
            Object.assign(existing, { quantity: newQty, avgPrice: newAvg });
          } else {
            newHoldings.push({
              symbol,
              name: get().getStockName(symbol),
              quantity,
              avgPrice: price,
            });
          }

          const trade: Trade = {
            id: crypto.randomUUID(),
            symbol,
            side,
            quantity,
            price,
            total,
            timestamp: Date.now(),
          };

          set({
            cash: cash - total,
            holdings: newHoldings,
            trades: [trade, ...get().trades],
          });

          return {
            success: true,
            message: `Bought ${quantity} ${symbol} @ ${formatNgn(price)}`,
          };
        }

        const holding = holdings.find((h) => h.symbol === symbol);
        if (!holding || holding.quantity < quantity) {
          return { success: false, message: "Not enough shares to sell." };
        }

        const newHoldings = holdings
          .map((h) =>
            h.symbol === symbol
              ? { ...h, quantity: h.quantity - quantity }
              : h
          )
          .filter((h) => h.quantity > 0);

        const trade: Trade = {
          id: crypto.randomUUID(),
          symbol,
          side,
          quantity,
          price,
          total,
          timestamp: Date.now(),
        };

        set({
          cash: cash + total,
          holdings: newHoldings,
          trades: [trade, ...get().trades],
        });

        return {
          success: true,
          message: `Sold ${quantity} ${symbol} @ ${formatNgn(price)}`,
        };
      },

      getPortfolioValue: () => {
        const { cash, holdings } = get();
        const holdingsValue = holdings.reduce(
          (sum, h) => sum + h.quantity * get().getPrice(h.symbol),
          0
        );
        return cash + holdingsValue;
      },

      getTotalPnL: () => {
        return get().getPortfolioValue() - PAPER_STARTING_CASH;
      },

      resetPortfolio: () => set(createInitialState()),
    }),
    { name: "kobopilot-trading" }
  )
);
