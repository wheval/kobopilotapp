import type { WatchlistItem } from "@/lib/types";

import { buildPriceHistory } from "./intraday";
import { getPreviousClose } from "./quote-utils";
import type { DailyBar } from "./types";

export type LivelinePoint = { time: number; value: number };

export type CandlePoint = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

const POLL_INTERVAL_SEC = 30;
const MAX_POINTS = 120;

/** Intraday ranges, only meaningful for the simulated demo feed. */
export const CHART_WINDOWS = [
  { label: "1m", secs: 60 },
  { label: "5m", secs: 300 },
  { label: "1d", secs: 86_400 },
  { label: "1w", secs: 604_800 },
] as const;

export const DEFAULT_CHART_WINDOW_SEC = 300;

/** Ranges the real feed can actually fill — NGXPulse publishes daily bars only. */
export const LIVE_CHART_WINDOWS = [
  { label: "1w", secs: 7 * 86_400 },
  { label: "1m", secs: 30 * 86_400 },
  { label: "3m", secs: 90 * 86_400 },
  { label: "1y", secs: 365 * 86_400 },
] as const;

export const DEFAULT_LIVE_WINDOW_SEC = 30 * 86_400;

/** Liveline expects `time` in Unix seconds, not milliseconds. */
export function buildLivelineHistory(
  sparkline: number[],
  price: number,
  updatedAtMs: number | null
): LivelinePoint[] {
  const nowSec = Math.floor((updatedAtMs ?? Date.now()) / 1000);

  if (sparkline.length === 0) {
    if (price <= 0) return [];
    return [
      { time: nowSec - POLL_INTERVAL_SEC, value: price },
      { time: nowSec, value: price },
    ];
  }

  const points: LivelinePoint[] = sparkline.map((value, index) => ({
    time: nowSec - (sparkline.length - 1 - index) * POLL_INTERVAL_SEC,
    value,
  }));

  const last = points[points.length - 1];
  if (price > 0 && Math.abs(last.value - price) >= 0.001) {
    points.push({ time: nowSec, value: price });
  }

  return points;
}

export function appendLiveQuotePoint(
  history: LivelinePoint[],
  quote: WatchlistItem,
  updatedAtMs: number
): LivelinePoint[] {
  const nowSec = Math.floor(updatedAtMs / 1000);
  const price = quote.price;

  if (price <= 0) return history;

  if (history.length === 0) {
    return buildLivelineHistory(quote.sparkline, price, updatedAtMs);
  }

  const last = history[history.length - 1];

  if (last.time === nowSec) {
    if (Math.abs(last.value - price) < 0.001) return history;
    return [...history.slice(0, -1), { time: nowSec, value: price }];
  }

  if (nowSec > last.time) {
    return [...history.slice(-(MAX_POINTS - 1)), { time: nowSec, value: price }];
  }

  return history;
}

export function seedHistoryForSymbol(
  quote: WatchlistItem | undefined,
  updatedAtMs: number | null
): LivelinePoint[] {
  if (!quote) return [];
  return buildLivelineHistory(quote.sparkline, quote.price, updatedAtMs);
}

/** Textured series for the visible window. Simulated quotes only — see `historyForWindow`. */
export function buildSyntheticHistory(
  quote: WatchlistItem,
  price: number,
  windowSecs: number,
  nowSec: number
): LivelinePoint[] {
  return buildPriceHistory(
    quote.symbol,
    getPreviousClose(quote),
    price > 0 ? price : quote.price,
    windowSecs,
    nowSec
  );
}

function dateToSec(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000);
}

/** Daily bars as a line series, trimmed to the visible range. */
export function barsToPoints(
  bars: DailyBar[],
  windowSecs: number,
  nowSec: number = Math.floor(Date.now() / 1000)
): LivelinePoint[] {
  const cutoff = nowSec - windowSecs;
  return bars
    .map((bar) => ({ time: dateToSec(bar.date), value: bar.close }))
    .filter((point) => point.time >= cutoff);
}

/**
 * Daily bars as candles.
 *
 * NGXPulse reports `open_price` equal to `close_price` and leaves high/low null, so
 * taking its open verbatim would draw a row of flat dojis. Each bar opens at the
 * previous session's close instead — a close-to-close bar, which is a real convention
 * and shows the day-over-day move honestly. Wicks only appear where the feed actually
 * published a high and low, which today it never does.
 */
export function barsToCandles(
  bars: DailyBar[],
  windowSecs: number,
  nowSec: number = Math.floor(Date.now() / 1000)
): CandlePoint[] {
  const cutoff = nowSec - windowSecs;
  const candles: CandlePoint[] = [];

  bars.forEach((bar, index) => {
    const time = dateToSec(bar.date);
    if (time < cutoff) return;

    const open = index > 0 ? bars[index - 1].close : bar.open;
    const close = bar.close;

    candles.push({
      time,
      open,
      close,
      high: bar.high ?? Math.max(open, close),
      low: bar.low ?? Math.min(open, close),
    });
  });

  return candles;
}

/** True when the feed publishes intraday range, so candles can show real wicks. */
export function barsHaveIntradayRange(bars: DailyBar[]): boolean {
  return bars.some((bar) => bar.high !== null && bar.low !== null);
}

/** Open, high, and low of whatever range is on screen. */
export function seriesStats(points: LivelinePoint[]): {
  open: number;
  high: number;
  low: number;
} | null {
  if (points.length === 0) return null;

  let high = points[0].value;
  let low = points[0].value;
  for (const point of points) {
    if (point.value > high) high = point.value;
    if (point.value < low) low = point.value;
  }

  return { open: points[0].value, high, low };
}

/** Anchor data to the visible time window so the line spans edge-to-edge. */
export function prepareChartHistory(
  points: LivelinePoint[],
  price: number,
  windowSecs: number,
  nowSec: number = Math.floor(Date.now() / 1000)
): LivelinePoint[] {
  if (points.length === 0 || price <= 0) return points;

  const leftEdge = nowSec - windowSecs;
  const inWindow = points.filter(
    (p) => p.time >= leftEdge - 1 && p.time <= nowSec + 1
  );
  let filtered =
    inWindow.length >= 2 ? inWindow : points.slice(-Math.max(2, inWindow.length));

  if (filtered.length === 0) {
    filtered = [{ time: leftEdge, value: price }, { time: nowSec, value: price }];
  } else if (filtered[0].time > leftEdge + 2) {
    filtered = [{ time: leftEdge, value: filtered[0].value }, ...filtered];
  }

  const last = filtered[filtered.length - 1];
  if (last.time >= nowSec - 1 && Math.abs(last.value - price) < 0.001) {
    return [...filtered.slice(0, -1), { time: nowSec, value: price }];
  }

  return [...filtered, { time: nowSec, value: price }];
}

/**
 * @param synthetic Whether the quote feed is simulated. When a real provider is
 * connected we only ever draw ticks we actually observed — inventing intraday shape for
 * genuine NGX prices would be fabricating market data in a teaching app.
 */
export function historyForWindow(
  liveHistory: LivelinePoint[],
  quote: WatchlistItem | undefined,
  updatedAtMs: number | null,
  windowSecs: number,
  price: number,
  synthetic: boolean
): LivelinePoint[] {
  const nowSec = Math.floor(Date.now() / 1000);

  if (!quote) {
    return prepareChartHistory(liveHistory, price, windowSecs, nowSec);
  }

  if (synthetic) {
    // Already spans the window edge-to-edge and ends on the live price.
    return buildSyntheticHistory(quote, price, windowSecs, nowSec);
  }

  const base =
    liveHistory.length > 1
      ? liveHistory
      : buildLivelineHistory(
          quote.sparkline,
          quote.price,
          updatedAtMs ?? Date.now()
        );

  return prepareChartHistory(base, price, windowSecs, nowSec);
}

/** Seconds per OHLC bar for the selected chart window. */
export function candleWidthForWindow(windowSecs: number): number {
  if (windowSecs <= 60) return POLL_INTERVAL_SEC;
  if (windowSecs <= 300) return 60;
  if (windowSecs <= 86_400) return 3_600;
  return 86_400;
}

/** Bucket tick history into committed candles plus the live in-progress bar. */
export function buildCandlesFromTicks(
  ticks: LivelinePoint[],
  candleWidthSecs: number,
  nowSec: number = Math.floor(Date.now() / 1000)
): { candles: CandlePoint[]; liveCandle: CandlePoint | undefined } {
  if (ticks.length === 0 || candleWidthSecs <= 0) {
    return { candles: [], liveCandle: undefined };
  }

  const bucketStart = (time: number) =>
    Math.floor(time / candleWidthSecs) * candleWidthSecs;

  const buckets = new Map<number, CandlePoint>();

  for (const tick of ticks) {
    const start = bucketStart(tick.time);
    const existing = buckets.get(start);

    if (!existing) {
      buckets.set(start, {
        time: start,
        open: tick.value,
        high: tick.value,
        low: tick.value,
        close: tick.value,
      });
      continue;
    }

    existing.high = Math.max(existing.high, tick.value);
    existing.low = Math.min(existing.low, tick.value);
    existing.close = tick.value;
  }

  const currentBucket = bucketStart(nowSec);
  let liveCandle = buckets.get(currentBucket);

  if (!liveCandle) {
    const last = ticks[ticks.length - 1];
    liveCandle = {
      time: currentBucket,
      open: last.value,
      high: last.value,
      low: last.value,
      close: last.value,
    };
  }

  const candles = [...buckets.values()]
    .filter((candle) => candle.time < currentBucket)
    .sort((a, b) => a.time - b.time);

  return { candles, liveCandle };
}
