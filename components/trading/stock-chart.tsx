"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Liveline } from "liveline";
import { CandlestickChart, TrendingDown, TrendingUp } from "lucide-react";

import { AskChartButton } from "@/components/app/ai-chat";
import { formatNgn } from "@/lib/format-currency";
import {
  appendLiveQuotePoint,
  barsHaveIntradayRange,
  barsToCandles,
  barsToPoints,
  buildCandlesFromTicks,
  candleWidthForWindow,
  CHART_WINDOWS,
  DEFAULT_CHART_WINDOW_SEC,
  DEFAULT_LIVE_WINDOW_SEC,
  historyForWindow,
  LIVE_CHART_WINDOWS,
  seedHistoryForSymbol,
  seriesStats,
  type LivelinePoint,
} from "@/lib/market/chart-history";
import { describeMarketSession } from "@/lib/market/market-hours";
import { getPreviousClose } from "@/lib/market/quote-utils";
import { useChartFeedStore, type ChartFeed } from "@/lib/store/chart-feed-store";
import { useMarketStore } from "@/lib/store/market-store";
import { useTradingStore } from "@/lib/store/trading-store";
import { cn } from "@/lib/utils";

const UP_COLOR = "#00a239";
const DOWN_COLOR = "#b5162a";
const FLAT_COLOR = "#004a3d";
const DAY_SECS = 86_400;

export function StockChart() {
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);
  const getStockName = useTradingStore((s) => s.getStockName);
  const getPrice = useTradingStore((s) => s.getPrice);
  const quote = useMarketStore((s) => s.getQuote(selectedSymbol));
  const updatedAt = useMarketStore((s) => s.updatedAt);
  const session = useMarketStore((s) => s.session);
  const staleFeed = useMarketStore((s) => s.staleFeed);
  const historyEntry = useMarketStore((s) => s.history[selectedSymbol]);
  const historyLoading = useMarketStore((s) => s.historyLoading[selectedSymbol]);
  const fetchHistory = useMarketStore((s) => s.fetchHistory);

  const feed = useChartFeedStore((s) => s.feed);
  const setFeed = useChartFeedStore((s) => s.setFeed);
  const liveFeed = feed === "live";

  const price = getPrice(selectedSymbol);
  const historyRef = useRef<{ symbol: string; points: LivelinePoint[] }>({
    symbol: "",
    points: [],
  });
  const [tickHistory, setTickHistory] = useState<LivelinePoint[]>([]);
  const [windowBySymbol, setWindowBySymbol] = useState<Record<string, number>>({});
  const [chartMode, setChartMode] = useState<"line" | "candle">("line");

  const windows = liveFeed ? LIVE_CHART_WINDOWS : CHART_WINDOWS;
  const defaultWindow = liveFeed ? DEFAULT_LIVE_WINDOW_SEC : DEFAULT_CHART_WINDOW_SEC;
  const windowKey = `${feed}:${selectedSymbol}`;
  const windowSecs = windowBySymbol[windowKey] ?? defaultWindow;
  const showLine = chartMode === "line";

  const handleWindowChange = (secs: number) => {
    setWindowBySymbol((prev) => ({ ...prev, [windowKey]: secs }));
  };

  useEffect(() => {
    if (liveFeed) void fetchHistory(selectedSymbol);
  }, [liveFeed, selectedSymbol, fetchHistory]);

  useEffect(() => {
    if (historyRef.current.symbol !== selectedSymbol) {
      historyRef.current = {
        symbol: selectedSymbol,
        points: seedHistoryForSymbol(quote, updatedAt),
      };
      setTickHistory(historyRef.current.points);
      return;
    }

    if (!quote || !updatedAt) {
      if (historyRef.current.points.length === 0 && quote) {
        historyRef.current.points = seedHistoryForSymbol(quote, updatedAt);
        setTickHistory(historyRef.current.points);
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
      setTickHistory(next);
    }
  }, [selectedSymbol, quote, updatedAt]);

  const bars = useMemo(() => historyEntry?.bars ?? [], [historyEntry]);

  const displayHistory = useMemo(() => {
    if (liveFeed) return barsToPoints(bars, windowSecs);
    // Always synthesise in demo mode, even when the quote feed is live. Demo mode is
    // opt-in and permanently labelled, and it exists precisely because real NGX prices
    // sit still — keying this off the feed source made the demo chart a flat line.
    return historyForWindow(tickHistory, quote, updatedAt, windowSecs, price, true);
  }, [liveFeed, bars, tickHistory, quote, updatedAt, windowSecs, price]);

  const candleWidth = liveFeed ? DAY_SECS : candleWidthForWindow(windowSecs);

  const { candles, liveCandle } = useMemo(() => {
    if (liveFeed) {
      return { candles: barsToCandles(bars, windowSecs), liveCandle: undefined };
    }
    return buildCandlesFromTicks(displayHistory, candleWidth);
  }, [liveFeed, bars, windowSecs, displayHistory, candleWidth]);

  const stats = useMemo(() => seriesStats(displayHistory), [displayHistory]);

  const momentum =
    quote && quote.change > 0
      ? "up"
      : quote && quote.change < 0
        ? "down"
        : "flat";

  const positive = (quote?.change ?? 0) >= 0;
  const seriesColor =
    momentum === "up" ? UP_COLOR : momentum === "down" ? DOWN_COLOR : FLAT_COLOR;
  const previousClose = quote ? getPreviousClose(quote) : undefined;

  const liveUnavailable = liveFeed && bars.length === 0 && !historyLoading;
  const hasChart = displayHistory.length > 1;

  // Daily bars all sit at midnight, so the default clock axis renders "00:00:00" over
  // and over. Label them by date instead, dropping to month/year across a full year.
  const formatTime = useMemo(() => {
    if (!liveFeed) return undefined;
    const options: Intl.DateTimeFormatOptions =
      windowSecs >= 300 * DAY_SECS
        ? { month: "short", year: "2-digit" }
        : { day: "numeric", month: "short" };
    const formatter = new Intl.DateTimeFormat("en-NG", options);
    return (seconds: number) => formatter.format(new Date(seconds * 1000));
  }, [liveFeed, windowSecs]);

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-lg border-2 border-b-4 border-hairline-strong bg-paper p-3 shadow-soft-lift sm:p-4 lg:rounded-2xl">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-ink-soft">
            {liveFeed ? "ngx daily" : "demo chart"}
          </p>
          <p className="truncate text-lg font-extrabold uppercase text-ink">
            {selectedSymbol}
          </p>
          <p className="truncate text-sm lowercase text-ink-soft">
            {getStockName(selectedSymbol)}
          </p>
        </div>
        {quote && (
          <div className="text-right">
            <p className="text-2xl font-extrabold tabular-nums text-ink sm:text-3xl">
              {formatNgn(price)}
            </p>
            <div
              className={cn(
                "flex items-center justify-end gap-1 text-sm font-extrabold tabular-nums",
                positive ? "text-success" : "text-destructive"
              )}
            >
              {positive ? (
                <TrendingUp className="size-4 shrink-0" />
              ) : (
                <TrendingDown className="size-4 shrink-0" />
              )}
              {positive ? "+" : ""}
              {formatNgn(quote.change)} ({positive ? "+" : ""}
              {quote.changePercent.toFixed(2)}%)
            </div>
          </div>
        )}
      </div>

      <FeedSwitch feed={feed} onChange={setFeed} />

      {liveFeed && (
        <p className="mb-3 text-xs lowercase text-ink-soft">
          {staleFeed
            ? "ngx is closed today · showing the last session"
            : describeMarketSession(session)}
          {quote?.tradeDate ? ` · last close ${quote.tradeDate}` : ""}
        </p>
      )}

      {stats && previousClose !== undefined && (
        <dl className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-xl border-2 border-hairline bg-canvas px-3 py-2 sm:grid-cols-4">
          <Stat label="open" value={formatNgn(stats.open)} />
          <Stat label="high" value={formatNgn(stats.high)} />
          <Stat label="low" value={formatNgn(stats.low)} />
          <Stat label="prev close" value={formatNgn(previousClose)} />
        </dl>
      )}

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div
          className="flex gap-1 rounded-xl border-2 border-hairline bg-canvas p-1"
          role="group"
          aria-label="Chart time range"
        >
          {windows.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleWindowChange(option.secs)}
              aria-pressed={windowSecs === option.secs}
              className={cn(
                "min-w-11 rounded-lg px-2.5 py-1.5 text-xs font-extrabold lowercase transition-colors touch-manipulation",
                windowSecs === option.secs
                  ? "bg-primary text-on-primary"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div
          className="flex gap-1 rounded-xl border-2 border-hairline bg-canvas p-1"
          role="group"
          aria-label="Chart style"
        >
          {(
            [
              { mode: "line" as const, label: "line", Icon: TrendingUp },
              { mode: "candle" as const, label: liveFeed ? "bars" : "candles", Icon: CandlestickChart },
            ]
          ).map(({ mode, label, Icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setChartMode(mode)}
              aria-pressed={chartMode === mode}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-extrabold lowercase transition-colors touch-manipulation",
                chartMode === mode
                  ? "bg-primary text-on-primary"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Height lives here, not on <Liveline>: it sets an inline height:100% on its own
          root, which beats a Tailwind class. Without a sized parent that 100% resolved
          against auto and collapsed to the canvas default of 150px at every breakpoint. */}
      <div className="chart-surface h-[min(240px,46vw)] w-full min-w-0 overflow-hidden sm:h-[280px]">
        {hasChart ? (
          <Liveline
            mode="candle"
            data={displayHistory}
            value={price}
            candles={candles}
            liveCandle={liveCandle}
            candleWidth={candleWidth}
            lineMode={showLine}
            lineData={displayHistory}
            lineValue={price}
            theme="light"
            color={seriesColor}
            momentum={momentum}
            grid
            fill
            lineWidth={2.5}
            showValue
            valueMomentumColor
            scrub
            cursor="default"
            window={windowSecs}
            referenceLine={
              previousClose !== undefined
                ? { value: previousClose, label: "yesterday's close" }
                : undefined
            }
            formatValue={(v) => formatNgn(v)}
            formatTime={formatTime}
            badgeVariant="minimal"
            padding={{ top: 8, bottom: 28, left: 4, right: 56 }}
            className="h-full w-full max-w-full"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm lowercase text-ink-soft">
            {liveUnavailable ? (
              <>
                <p>no ngx history available for {selectedSymbol}.</p>
                <p className="text-xs">
                  daily bars need an ngxpulse api key — or switch to demo mode.
                </p>
              </>
            ) : (
              <p>loading chart…</p>
            )}
          </div>
        )}
      </div>

      {stats && stats.high > stats.low && (
        <div className="mt-3">
          <div className="relative h-1.5 rounded-full bg-cloud">
            <div
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper"
              style={{
                left: `${Math.min(100, Math.max(0, ((price - stats.low) / (stats.high - stats.low)) * 100))}%`,
                backgroundColor: seriesColor,
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-bold lowercase text-ink-soft">
            <span>low {formatNgn(stats.low)}</span>
            <span>high {formatNgn(stats.high)}</span>
          </div>
        </div>
      )}

      <p className="mt-2 text-center text-[10px] font-bold lowercase text-ink-soft">
        {liveFeed
          ? `real ngx daily closes${
              chartMode === "candle" && !barsHaveIntradayRange(bars)
                ? " · bars open at the prior close; ngx intraday range not published"
                : ""
            }`
          : "simulated demo prices · not live ngx data"}
      </p>

      <AskChartButton symbol={selectedSymbol} className="mt-3 w-full" />
    </div>
  );
}

function FeedSwitch({
  feed,
  onChange,
}: {
  feed: ChartFeed;
  onChange: (feed: ChartFeed) => void;
}) {
  return (
    <div
      className="mb-3 flex gap-1 rounded-xl border-2 border-hairline bg-canvas p-1"
      role="group"
      aria-label="Chart data source"
    >
      {(
        [
          { value: "live" as const, label: "ngx live" },
          { value: "demo" as const, label: "demo mode" },
        ]
      ).map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={feed === option.value}
          className={cn(
            "flex-1 rounded-lg px-3 py-1.5 text-xs font-extrabold lowercase transition-colors touch-manipulation",
            feed === option.value
              ? "bg-primary text-on-primary"
              : "text-ink-soft hover:text-ink"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 sm:flex-col sm:items-start sm:justify-start sm:gap-0">
      <dt className="text-[10px] font-bold uppercase text-ink-soft">{label}</dt>
      <dd className="text-sm font-extrabold tabular-nums text-ink">{value}</dd>
    </div>
  );
}
