/**
 * NGX trading hours, computed locally so we never spend an API request finding out
 * whether it's worth spending an API request.
 *
 * West Africa Time is UTC+1 year round — Nigeria observes no daylight saving — so the
 * offset is a constant rather than something we need a timezone database for.
 */

const WAT_OFFSET_MINUTES = 60;
const OPEN_MINUTES = 9 * 60; // 09:00 WAT
const CLOSE_MINUTES = 16 * 60; // 16:00 WAT

export type MarketSessionReason =
  | "open"
  | "weekend"
  | "before-open"
  | "after-close";

export type MarketSession = {
  isOpen: boolean;
  reason: MarketSessionReason;
  /** Milliseconds until the next open, or 0 when already open. */
  msUntilOpen: number;
};

type WatClock = {
  /** 0 = Sunday … 6 = Saturday, in WAT. */
  weekday: number;
  minutesIntoDay: number;
};

function watClock(at: Date): WatClock {
  const shifted = new Date(at.getTime() + WAT_OFFSET_MINUTES * 60_000);
  return {
    weekday: shifted.getUTCDay(),
    minutesIntoDay: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

function daysUntilNextWeekday(weekday: number): number {
  if (weekday === 6) return 2; // Saturday → Monday
  if (weekday === 0) return 1; // Sunday → Monday
  return weekday === 5 ? 3 : 1; // Friday → Monday, else tomorrow
}

/**
 * Public holidays are not modelled — the NGX calendar shifts yearly and hardcoding it
 * would rot. `isQuoteStale` covers them instead: on a holiday the feed's trade_date
 * simply stops advancing, which we can detect for free from data we already fetched.
 */
export function getMarketSession(at: Date = new Date()): MarketSession {
  const { weekday, minutesIntoDay } = watClock(at);
  const isWeekday = weekday >= 1 && weekday <= 5;

  if (isWeekday && minutesIntoDay >= OPEN_MINUTES && minutesIntoDay < CLOSE_MINUTES) {
    return { isOpen: true, reason: "open", msUntilOpen: 0 };
  }

  let reason: MarketSessionReason;
  let minutesUntilOpen: number;

  if (!isWeekday) {
    reason = "weekend";
    minutesUntilOpen =
      daysUntilNextWeekday(weekday) * 1440 - minutesIntoDay + OPEN_MINUTES;
  } else if (minutesIntoDay < OPEN_MINUTES) {
    reason = "before-open";
    minutesUntilOpen = OPEN_MINUTES - minutesIntoDay;
  } else {
    reason = "after-close";
    minutesUntilOpen =
      daysUntilNextWeekday(weekday) * 1440 - minutesIntoDay + OPEN_MINUTES;
  }

  return {
    isOpen: false,
    reason,
    msUntilOpen: Math.max(0, minutesUntilOpen) * 60_000,
  };
}

export function describeMarketSession(session: MarketSession): string {
  switch (session.reason) {
    case "open":
      return "ngx is open";
    case "weekend":
      return "ngx is closed for the weekend";
    case "before-open":
      return "ngx opens at 9:00 wat";
    case "after-close":
      return "ngx closed at 4:00 wat";
  }
}

/**
 * True when the feed's last trade date is older than the most recent session that
 * should have produced one — i.e. a public holiday, or a stalled upstream.
 */
export function isQuoteStale(
  tradeDate: string | undefined,
  at: Date = new Date()
): boolean {
  if (!tradeDate) return false;

  const traded = Date.parse(`${tradeDate}T00:00:00Z`);
  if (Number.isNaN(traded)) return false;

  const { weekday } = watClock(at);
  // Allow for the weekend gap: Monday may legitimately still show Friday's date.
  const graceDays = weekday === 1 ? 4 : weekday === 0 ? 3 : weekday === 6 ? 2 : 2;
  const shifted = new Date(at.getTime() + WAT_OFFSET_MINUTES * 60_000);
  const today = Date.parse(
    `${shifted.toISOString().slice(0, 10)}T00:00:00Z`
  );

  return today - traded > graceDays * 86_400_000;
}
