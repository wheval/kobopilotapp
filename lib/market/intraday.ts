import type { LivelinePoint } from "./chart-history";

const DAY_SECS = 86_400;
const WEEK_SECS = 7 * DAY_SECS;

/** Roughly the widest a session strays from its trend, as a fraction of price. */
const DAY_VOLATILITY = 0.05;
/** A week wanders further than a single session. */
const WEEK_VOLATILITY = 0.09;
/** How far the week opens from yesterday's close, at most. */
const WEEK_GAP = 0.05;

/** Deterministic PRNG — same seed always yields the same walk. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Box-Muller, so steps are normally distributed rather than uniform. */
function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

type BridgeArgs = {
  seed: string;
  from: number;
  to: number;
  startSec: number;
  endSec: number;
  points: number;
  /** Standard deviation of the path as a fraction of price. */
  volatility: number;
};

/**
 * A Brownian bridge: a random walk pinned at both ends.
 *
 * A plain random walk drifts wherever it likes, so it would not land on a known price.
 * Subtracting the walk's own endpoint scaled by progress forces the path through both
 * anchors while keeping the wiggle in between. Deterministic for a given seed, so the
 * shape holds still across re-renders and only the live edge moves.
 */
export function buildBridge({
  seed,
  from,
  to,
  startSec,
  endSec,
  points,
  volatility,
}: BridgeArgs): LivelinePoint[] {
  const count = Math.max(2, Math.floor(points));
  const rand = mulberry32(hashSeed(seed));
  const span = Math.max(1, endSec - startSec);

  const walk: number[] = [0];
  for (let i = 1; i < count; i += 1) {
    walk.push(walk[i - 1] + gaussian(rand));
  }

  const drift = walk[count - 1];
  // Divide by sqrt(count): a cumulative walk's spread grows with sqrt(steps), so without
  // this the amplitude would depend on the resolution we happened to draw at.
  const scale = (volatility * Math.max(from, to)) / Math.sqrt(count);
  const series: LivelinePoint[] = [];

  for (let i = 0; i < count; i += 1) {
    const progress = i / (count - 1);
    // Zero at both ends, so the anchors survive.
    const bridge = walk[i] - drift * progress;
    const trend = from + (to - from) * progress;

    series.push({
      time: Math.round(startSec + span * progress),
      value: Math.max(0.01, Math.round((trend + bridge * scale) * 100) / 100),
    });
  }

  series[0] = { time: startSec, value: Math.round(from * 100) / 100 };
  series[count - 1] = { time: endSec, value: Math.round(to * 100) / 100 };

  return series;
}

function valueAt(series: LivelinePoint[], time: number): number {
  if (series.length === 0) return 0;
  if (time <= series[0].time) return series[0].value;

  const last = series[series.length - 1];
  if (time >= last.time) return last.value;

  for (let i = 1; i < series.length; i += 1) {
    const b = series[i];
    if (b.time < time) continue;
    const a = series[i - 1];
    const t = (time - a.time) / Math.max(1, b.time - a.time);
    return a.value + (b.value - a.value) * t;
  }

  return last.value;
}

/** Stable per symbol per day, so the shape doesn't reshuffle on every poll. */
function dayIndexOf(nowSec: number) {
  return Math.floor(nowSec / DAY_SECS);
}

/**
 * The last week of price action as two joined legs: a week of wandering that lands on
 * yesterday's close, then today's session running from that close to the live price.
 */
function buildWeekSeries(
  symbol: string,
  previousClose: number,
  price: number,
  nowSec: number
): { week: LivelinePoint[]; today: LivelinePoint[] } {
  const day = dayIndexOf(nowSec);
  const dayStart = nowSec - DAY_SECS;
  const weekStart = nowSec - WEEK_SECS;

  const gapRand = mulberry32(hashSeed(`${symbol}:${day}:gap`));
  const weekOpen = previousClose * (1 + (gapRand() - 0.5) * WEEK_GAP);

  const earlier = buildBridge({
    seed: `${symbol}:${day}:week`,
    from: weekOpen,
    to: previousClose,
    startSec: weekStart,
    endSec: dayStart,
    points: 110,
    volatility: WEEK_VOLATILITY,
  });

  const today = buildBridge({
    seed: `${symbol}:${day}:today`,
    from: previousClose,
    to: price,
    startSec: dayStart,
    endSec: nowSec,
    points: 110,
    volatility: DAY_VOLATILITY,
  });

  return { week: [...earlier, ...today.slice(1)], today };
}

/** Points to draw for a given range — enough to read, few enough to stay cheap. */
function pointsForWindow(windowSecs: number): number {
  if (windowSecs <= 60) return 40;
  if (windowSecs <= 300) return 70;
  if (windowSecs <= DAY_SECS) return 110;
  return 160;
}

/**
 * A synthetic series for the visible window.
 *
 * Short windows are a *slice* of the same underlying week, not a rescaling of it — the
 * left edge is whatever the walk was worth `windowSecs` ago, so a one-minute chart shows
 * a minute's worth of movement rather than a whole day's. Volatility scales with the
 * square root of elapsed time, the way price dispersion actually grows.
 */
export function buildPriceHistory(
  symbol: string,
  previousClose: number,
  price: number,
  windowSecs: number,
  nowSec: number
): LivelinePoint[] {
  const safePrice = price > 0 ? price : previousClose;
  const { week, today } = buildWeekSeries(
    symbol,
    previousClose,
    safePrice,
    nowSec
  );

  if (windowSecs >= WEEK_SECS) return week;
  if (windowSecs >= DAY_SECS) return today;

  const startSec = nowSec - windowSecs;

  return buildBridge({
    seed: `${symbol}:${dayIndexOf(nowSec)}:${windowSecs}`,
    from: valueAt(week, startSec),
    to: safePrice,
    startSec,
    endSec: nowSec,
    points: pointsForWindow(windowSecs),
    volatility: DAY_VOLATILITY * Math.sqrt(windowSecs / DAY_SECS),
  });
}
