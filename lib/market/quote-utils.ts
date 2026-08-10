import { formatNgn } from "@/lib/format-currency";
import type { WatchlistItem } from "@/lib/types";

export function getPreviousClose(quote: WatchlistItem): number {
  if (quote.previousClose != null) return quote.previousClose;
  return Math.round((quote.price - quote.change) * 100) / 100;
}

export function explainDailyMove(quote: WatchlistItem): string {
  const previousClose = getPreviousClose(quote);
  const { symbol, name, price, change, changePercent } = quote;

  if (Math.abs(change) < 0.01) {
    return `${symbol} is flat vs yesterday's close of ${formatNgn(previousClose)}. It's still ${formatNgn(price)} today — no daily move on the chart yet.`;
  }

  const direction = change > 0 ? "up" : "down";
  const moveLine =
    change < 0
      ? `That's ${formatNgn(Math.abs(change))} below yesterday's close — the chart shows sellers pushing ${name} lower than where it finished last session.`
      : `That's ${formatNgn(change)} above yesterday's close — buyers are paying more than last session's finish.`;

  return `${symbol} is ${direction} ${Math.abs(changePercent).toFixed(2)}% today. Yesterday's close: ${formatNgn(previousClose)} → now: ${formatNgn(price)}. ${moveLine} Remember: one day's move doesn't tell the whole story — check volume and news too.`;
}

