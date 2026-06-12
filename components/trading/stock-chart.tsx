"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Liveline } from "liveline";
import { TrendingDown, TrendingUp } from "lucide-react";

import { AskChartButton } from "@/components/app/ai-chat";
import { formatNgn } from "@/lib/format-currency";
import {
  appendLiveQuotePoint,
  buildLivelineHistory,
  CHART_WINDOWS,
  DEFAULT_CHART_WINDOW_SEC,
  historyForWindow,
  seedHistoryForSymbol,
  type LivelinePoint,
} from "@/lib/market/chart-history";
import { formatDailyComparison } from "@/lib/market/quote-utils";
import { useMarketStore } from "@/lib/store/market-store";
import { useTradingStore } from "@/lib/store/trading-store";
import { cn } from "@/lib/utils";

export function StockChart() {
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);
  const getStockName = useTradingStore((s) => s.getStockName);
  const getPrice = useTradingStore((s) => s.getPrice);
  const quote = useMarketStore((s) => s.getQuote(selectedSymbol));
  const updatedAt = useMarketStore((s) => s.updatedAt);

  const price = getPrice(selectedSymbol);
  const historyRef = useRef<{ symbol: string; points: LivelinePoint[] }>({
    symbol: "",
    points: [],
  });
  const [history, setHistory] = useState<LivelinePoint[]>([]);
  const [windowBySymbol, setWindowBySymbol] = useState<Record<string, number>>({});
  const windowSecs = windowBySymbol[selectedSymbol] ?? DEFAULT_CHART_WINDOW_SEC;

  const handleWindowChange = (secs: number) => {
    setWindowBySymbol((prev) => ({ ...prev, [selectedSymbol]: secs }));
  };

  useEffect(() => {
    if (historyRef.current.symbol !== selectedSymbol) {
      historyRef.current = {
        symbol: selectedSymbol,
        points: seedHistoryForSymbol(quote, updatedAt),
      };
      setHistory(historyRef.current.points);
      return;
    }

    if (!quote || !updatedAt) {
      if (historyRef.current.points.length === 0 && quote) {
        historyRef.current.points = seedHistoryForSymbol(quote, updatedAt);
        setHistory(historyRef.current.points);
      }
      return;
    }

    const next = appendLiveQuotePoint(
      historyRef.current.points,
      quote,
      updatedAt
    );

    if (next !== historyRef.current.points) {
      historyRef.current.points = next;
      setHistory(next);
    }
  }, [selectedSymbol, quote, updatedAt]);

  const displayHistory = useMemo(() => {
    const live =
      history.length > 1
        ? history
        : price <= 0 || !updatedAt
          ? history
          : buildLivelineHistory(quote?.sparkline ?? [], price, updatedAt);

    return historyForWindow(live, quote, updatedAt, windowSecs, price);
  }, [history, price, updatedAt, quote, windowSecs]);

  const momentum =
    quote && quote.change > 0
      ? "up"
      : quote && quote.change < 0
        ? "down"
        : "flat";

  const positive = (quote?.change ?? 0) >= 0;

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-lg lg:rounded-2xl border-2 border-b-4 border-hairline-strong bg-paper p-3 shadow-soft-lift sm:p-4">
      <div className="mb-3 space-y-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-ink-soft">live chart</p>
          <p className="truncate text-lg font-extrabold uppercase text-ink">
            {selectedSymbol}
          </p>
          <p className="truncate text-sm lowercase text-ink-soft">
            {getStockName(selectedSymbol)}
          </p>
        </div>
        {quote && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-1.5 text-xs font-bold lowercase leading-snug",
              positive ? "text-success" : "text-destructive"
            )}
          >
            {positive ? (
              <TrendingUp className="size-3.5 shrink-0" />
            ) : (
              <TrendingDown className="size-3.5 shrink-0" />
            )}
            <span className="min-w-0 break-words">{formatDailyComparison(quote)}</span>
          </div>
        )}
      </div>
      <div className="chart-surface w-full min-w-0 overflow-hidden">
        {displayHistory.length > 1 ? (
          <Liveline
            data={displayHistory}
            value={price}
            theme="light"
            color="#004a3d"
            momentum={momentum}
            showValue
            valueMomentumColor
            scrub
            cursor="default"
            window={windowSecs}
            onWindowChange={handleWindowChange}
            windows={[...CHART_WINDOWS]}
            windowStyle="rounded"
            formatValue={(v) => formatNgn(v)}
            badgeVariant="minimal"
            padding={{ top: 8, bottom: 28, left: 4, right: 56 }}
            className="h-[min(220px,42vw)] w-full max-w-full sm:h-[240px]"
          />
        ) : (
          <div className="flex h-[min(220px,42vw)] items-center justify-center text-sm lowercase text-ink-soft sm:h-[240px]">
            loading chart…
          </div>
        )}
      </div>
      <AskChartButton symbol={selectedSymbol} className="mt-3 w-full" />
    </div>
  );
}
