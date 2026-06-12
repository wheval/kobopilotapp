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
  const provider = useMarketStore((s) => s.provider);

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

    return historyForWindow(live, quote, updatedAt, windowSecs);
  }, [history, price, updatedAt, quote, windowSecs]);

  const momentum =
    quote && quote.change > 0
      ? "up"
      : quote && quote.change < 0
        ? "down"
        : "flat";

  const positive = (quote?.change ?? 0) >= 0;
  const providerLabel =
    provider === "simulated"
      ? "demo feed · refreshes every 30s"
      : `${provider} · live`;

  return (
    <div className="micro-card overflow-hidden rounded-2xl border-2 border-b-4 border-hairline-strong bg-paper p-4 shadow-soft-lift">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase text-ink-soft">live chart</p>
          <p className="text-lg font-extrabold uppercase text-ink">{selectedSymbol}</p>
          <p className="text-sm lowercase text-ink-soft">{getStockName(selectedSymbol)}</p>
          {quote && (
            <div
              className={cn(
                "mt-2 flex flex-wrap items-center gap-1.5 text-xs font-bold lowercase",
                positive ? "text-success" : "text-destructive"
              )}
            >
              {positive ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              <span>{formatDailyComparison(quote)}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="max-w-[9rem] text-right text-[10px] font-bold uppercase leading-tight text-ink-soft">
            {providerLabel}
          </p>
          <AskChartButton symbol={selectedSymbol} />
        </div>
      </div>
      <div className="h-[220px] w-full min-w-0">
        {displayHistory.length > 1 ? (
          <Liveline
            data={displayHistory}
            value={price}
            theme="light"
            color="#004a3d"
            momentum={momentum}
            showValue
            valueMomentumColor
            exaggerate
            scrub
            window={windowSecs}
            onWindowChange={handleWindowChange}
            windows={[...CHART_WINDOWS]}
            windowStyle="rounded"
            formatValue={(v) => formatNgn(v)}
            badgeVariant="minimal"
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm lowercase text-ink-soft">
            loading chart…
          </div>
        )}
      </div>
    </div>
  );
}
