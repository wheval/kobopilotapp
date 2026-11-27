import { explainDailyMove } from "@/lib/market/quote-utils";
import type { WatchlistItem } from "@/lib/types";

/**
 * Offline coach replies. Used when AI_GATEWAY_API_KEY is unset and as the client-side
 * fallback when /api/chat fails, so the chat never dead-ends.
 */
export function mockReply(
  input: string,
  quote: WatchlistItem | undefined,
  chartMode: boolean
): string {
  const q = input.toLowerCase();

  if (
    quote &&
    (chartMode ||
      q.includes("chart") ||
      q.includes("yesterday") ||
      q.includes("today") ||
      q.includes("drop") ||
      q.includes("down") ||
      q.includes("fall") ||
      q.includes("why") ||
      q.includes("moving") ||
      q.includes("dangote") ||
      q.includes("dangcem"))
  ) {
    return explainDailyMove(quote);
  }

  if (q.includes("ngx"))
    return "NGX is Nigeria's main stock exchange. On Kobopilot you paper-trade real tickers like DANGCEM, GTCO, and MTNN with ₦ play money.";
  if (q.includes("bid") || q.includes("ask"))
    return "The bid is what buyers will pay; the ask is what sellers want. The gap between them is the spread. Trades happen when they meet in the middle.";
  if (q.includes("dividend"))
    return "Some NGX companies share profits with shareholders as dividends — cash paid per share. Check the glossary for examples in naira.";
  if (q.includes("diversif"))
    return "Don't put all your play cash in one stock. Spread across sectors — banks, cement, telcos — so one bad day doesn't wipe your paper portfolio.";
  if (q.includes("chart") || q.includes("liveline"))
    return "The practice chart uses Liveline — it smooths price updates so you can watch momentum arrows and time windows like a live trading feed.";
  if (q.includes("buy") && quote)
    return `I'm a coach, not financial advice! ${quote.symbol} is at ₦${quote.price.toLocaleString()} today. Paper-trade a small size first and see how your portfolio feels.`;

  return "Great question! Try a lesson on the learn path, then practice with a small paper trade. Ask me about NGX, orders, dividends, or risk anytime.";
}

export function chartWelcomeMessage(
  symbol: string,
  quote: WatchlistItem | undefined,
  /** true when prices come from the built-in simulator, not a live NGX feed */
  simulated = false
): string {
  if (!quote) {
    return `looking at ${symbol} on your chart — ask me why the price is moving, or how to read the liveline!`;
  }
  if (simulated) {
    return `looking at ${symbol} on your chart. heads up: these are simulated practice prices, not live ngx data, so treat the moves as practice. ask me how to read the chart!`;
  }
  return `looking at ${symbol} on your chart. ${explainDailyMove(quote)} ask me anything about the move!`;
}
