import type { WatchlistItem } from "@/lib/types";

import { getPreviousClose } from "./quote-utils";

export type LivelinePoint = { time: number; value: number };

const POLL_INTERVAL_SEC = 30;
const MAX_POINTS = 120;

export const CHART_WINDOWS = [
  { label: "1m", secs: 60 },
  { label: "5m", secs: 300 },
  { label: "1d", secs: 86_400 },
  { label: "1w", secs: 604_800 },
] as const;

export const DEFAULT_CHART_WINDOW_SEC = 300;

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

/** Synthetic history for 1d / 1w views when live ticks only cover minutes. */
export function buildExtendedHistory(
  quote: WatchlistItem,
  updatedAtMs: number,
  rangeSecs: number
): LivelinePoint[] {
  const nowSec = Math.floor(updatedAtMs / 1000);
  const startSec = nowSec - rangeSecs;
  const previousClose = getPreviousClose(quote);
  const endPrice = quote.price;
  const sparkline = quote.sparkline.length > 0 ? quote.sparkline : [previousClose, endPrice];
  const pointCount = rangeSecs >= 604_800 ? 72 : 48;

  const points: LivelinePoint[] = [];
  for (let i = 0; i < pointCount; i += 1) {
    const progress = i / (pointCount - 1);
    const time = Math.round(startSec + rangeSecs * progress);
    const trend = previousClose + (endPrice - previousClose) * progress;
    const spark = sparkline[Math.floor(progress * (sparkline.length - 1))] ?? endPrice;
    const wiggle = (spark - endPrice) * (1 - progress) * 0.35;
    const value = Math.round((trend + wiggle) * 100) / 100;

    points.push({ time, value });
  }

  points[points.length - 1] = { time: nowSec, value: endPrice };
  return points;
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

export function historyForWindow(
  liveHistory: LivelinePoint[],
  quote: WatchlistItem | undefined,
  updatedAtMs: number | null,
  windowSecs: number,
  price: number
): LivelinePoint[] {
  const nowSec = Math.floor(Date.now() / 1000);

  if (!quote) {
    return prepareChartHistory(liveHistory, price, windowSecs, nowSec);
  }

  let base: LivelinePoint[];
  if (windowSecs >= 86_400) {
    base = buildExtendedHistory(quote, updatedAtMs ?? Date.now(), windowSecs);
  } else if (liveHistory.length > 1) {
    base = liveHistory;
  } else {
    base = buildLivelineHistory(
      quote.sparkline,
      quote.price,
      updatedAtMs ?? Date.now()
    );
  }

  return prepareChartHistory(base, price, windowSecs, nowSec);
}
