import { tool } from "ai";
import { z } from "zod";

import type { ChatContext } from "@/lib/ai/schema";
import { formatNgn } from "@/lib/format-currency";
import { getGlossaryEntry, glossary } from "@/lib/glossary";
import { isLessonUnlocked, lessons } from "@/lib/lessons";
import {
  describeMarketSession,
  getMarketSession,
} from "@/lib/market/market-hours";
import { NGX_SYMBOLS } from "@/lib/market/ngx-seed";
import { getPreviousClose } from "@/lib/market/quote-utils";
import { getNgxHistory, getNgxQuotes } from "@/lib/market/quotes-service";
import type { MarketQuotesResponse } from "@/lib/market/types";
import { PAPER_STARTING_CASH } from "@/lib/paper-trading";
import type { WatchlistItem } from "@/lib/types";

/** One upstream quote fetch per chat request, however many tools ask for prices. */
function createQuoteLoader() {
  let pending: Promise<MarketQuotesResponse> | null = null;
  return () => (pending ??= getNgxQuotes());
}

function describeQuote(quote: WatchlistItem, market: MarketQuotesResponse) {
  const previousClose = getPreviousClose(quote);
  const session = getMarketSession();

  return {
    symbol: quote.symbol,
    name: quote.name,
    price: quote.price,
    priceLabel: formatNgn(quote.price),
    previousClose,
    previousCloseLabel: formatNgn(previousClose),
    change: quote.change,
    changeLabel: formatNgn(quote.change),
    changePercent: quote.changePercent,
    changePercent7d: quote.changePercent7d,
    direction: quote.change > 0 ? "up" : quote.change < 0 ? "down" : "flat",
    volume: quote.volume,
    marketCapLabel:
      quote.marketCap != null ? formatNgn(quote.marketCap, true) : undefined,
    sector: quote.sector,
    // The session this price is from. NGX equities refresh about every 20 minutes, and
    // outside trading hours this is simply the last close — not a live tick.
    tradeDate: quote.tradeDate,
    marketOpen: session.isOpen,
    marketStatus: describeMarketSession(session),
    simulated: market.source !== "live",
    provider: market.provider,
    updatedAt: new Date(market.updatedAt).toISOString(),
  };
}

export function buildTools(ctx: ChatContext) {
  const loadQuotes = createQuoteLoader();
  const completed = new Set(ctx.client.progress.completedLessonIds);

  return {
    get_quote: tool({
      description:
        "Get the current NGX price for one ticker, with yesterday's close and today's change. Call this before stating any price — never quote a number from memory.",
      inputSchema: z.object({
        symbol: z
          .string()
          .describe(`NGX ticker symbol. One of: ${NGX_SYMBOLS.join(", ")}`),
      }),
      execute: async ({ symbol }) => {
        const market = await loadQuotes();
        const wanted = symbol.trim().toUpperCase();
        const quote = market.quotes.find((q) => q.symbol === wanted);

        if (!quote) {
          return {
            error: `No NGX quote for "${wanted}" on Kobopilot.`,
            availableSymbols: NGX_SYMBOLS,
          };
        }

        return describeQuote(quote, market);
      },
    }),

    get_watchlist: tool({
      description:
        "Get current prices for every NGX stock available in Kobopilot. Use for comparisons or 'what's moving today' questions.",
      inputSchema: z.object({}),
      execute: async () => {
        const market = await loadQuotes();
        return {
          simulated: market.source !== "live",
          provider: market.provider,
          updatedAt: new Date(market.updatedAt).toISOString(),
          stocks: market.quotes.map((quote) => ({
            symbol: quote.symbol,
            name: quote.name,
            price: quote.price,
            priceLabel: formatNgn(quote.price),
            changePercent: quote.changePercent,
          })),
        };
      },
    }),

    get_price_history: tool({
      description:
        "Real NGX daily closing prices for one ticker over a recent period. Use for questions about trends, whether a stock is up or down over weeks or months, or how volatile it has been. Returns a summary plus the most recent closes, not every bar.",
      inputSchema: z.object({
        symbol: z
          .string()
          .describe(`NGX ticker symbol. One of: ${NGX_SYMBOLS.join(", ")}`),
        days: z
          .number()
          .int()
          .min(5)
          .max(365)
          .describe("Calendar days of history to look back over, e.g. 30 for a month"),
      }),
      execute: async ({ symbol, days }) => {
        const wanted = symbol.trim().toUpperCase();
        const history = await getNgxHistory(wanted, days);

        if (history.bars.length === 0) {
          return {
            error: `No NGX daily history available for "${wanted}".`,
            reason:
              history.source === "simulated"
                ? "No market data provider is configured."
                : "The provider returned no bars for this period.",
          };
        }

        const bars = history.bars;
        const closes = bars.map((bar) => bar.close);
        const first = closes[0];
        const last = closes[closes.length - 1];
        const high = Math.max(...closes);
        const low = Math.min(...closes);
        const totalVolume = bars.reduce((sum, bar) => sum + bar.volume, 0);

        return {
          symbol: wanted,
          from: bars[0].date,
          to: bars[bars.length - 1].date,
          sessions: bars.length,
          firstCloseLabel: formatNgn(first),
          lastCloseLabel: formatNgn(last),
          changePercent:
            first === 0 ? 0 : Math.round(((last - first) / first) * 10000) / 100,
          highLabel: formatNgn(high),
          lowLabel: formatNgn(low),
          averageDailyVolume: Math.round(totalVolume / bars.length),
          // A window, not the whole series — the full set would swamp the reply budget.
          recentCloses: bars.slice(-10).map((bar) => ({
            date: bar.date,
            close: bar.close,
          })),
          // NGXPulse publishes close and volume only; there is no intraday range.
          intradayHighLowAvailable: bars.some(
            (bar) => bar.high !== null && bar.low !== null
          ),
        };
      },
    }),

    get_portfolio: tool({
      description:
        "Get the user's paper-trading portfolio: cash, holdings priced at current market, and profit or loss. Call this before commenting on how they're doing.",
      inputSchema: z.object({}),
      execute: async () => {
        const market = await loadQuotes();
        const { portfolio } = ctx.client;

        let holdingsValue = 0;

        const holdings = portfolio.holdings.map((holding) => {
          const quote = market.quotes.find((q) => q.symbol === holding.symbol);
          const currentPrice = quote?.price ?? holding.avgPrice;
          const value = currentPrice * holding.quantity;
          const cost = holding.avgPrice * holding.quantity;
          const pnl = Math.round((value - cost) * 100) / 100;

          holdingsValue += value;

          return {
            symbol: holding.symbol,
            name: holding.name,
            quantity: holding.quantity,
            avgPriceLabel: formatNgn(holding.avgPrice),
            currentPriceLabel: formatNgn(currentPrice),
            valueLabel: formatNgn(value),
            pnl,
            pnlLabel: formatNgn(pnl),
            pnlPercent: cost === 0 ? 0 : Math.round((pnl / cost) * 10000) / 100,
          };
        });

        // Derived here, from the same quotes the holdings were priced with, so the
        // total can never disagree with the rows it is the sum of.
        const portfolioValue = portfolio.cash + holdingsValue;
        const totalPnL =
          Math.round((portfolioValue - PAPER_STARTING_CASH) * 100) / 100;

        return {
          cashLabel: formatNgn(portfolio.cash),
          portfolioValueLabel: formatNgn(portfolioValue),
          totalPnL,
          totalPnLLabel: formatNgn(totalPnL),
          startingCashLabel: formatNgn(PAPER_STARTING_CASH),
          tradeCount: portfolio.tradeCount,
          holdingCount: holdings.length,
          holdings,
          simulated: market.source !== "live",
        };
      },
    }),

    get_progress: tool({
      description:
        "Get how far the user has gotten through the lesson path: xp, streak, lessons completed, quiz average, and what's next.",
      inputSchema: z.object({}),
      execute: async () => {
        const { progress } = ctx.client;
        const nextLesson = lessons.find((lesson) => !completed.has(lesson.id));

        return {
          xp: progress.xp,
          streakDays: progress.streak,
          completedLessonCount: completed.size,
          totalLessonCount: lessons.length,
          progressPercent: progress.progressPercent,
          quizAveragePercent: progress.quizAveragePercent,
          completedLessons: lessons
            .filter((lesson) => completed.has(lesson.id))
            .map((lesson) => ({ id: lesson.id, title: lesson.title })),
          nextLesson: nextLesson
            ? {
                id: nextLesson.id,
                title: nextLesson.title,
                summary: nextLesson.summary,
              }
            : null,
        };
      },
    }),

    list_lessons: tool({
      description:
        "List every lesson on the Kobopilot path with its unlock and completion state. Use when recommending what to study next.",
      inputSchema: z.object({}),
      execute: async () =>
        lessons.map((lesson) => ({
          id: lesson.id,
          order: lesson.order,
          title: lesson.title,
          summary: lesson.summary,
          completed: completed.has(lesson.id),
          unlocked: isLessonUnlocked(lesson.order, [...completed]),
        })),
    }),

    get_lesson: tool({
      description:
        "Get the teaching content of one lesson — its sections and key takeaways. Use to explain a topic in the same words the app uses.",
      inputSchema: z.object({
        lessonId: z
          .string()
          .describe(`Lesson id. One of: ${lessons.map((l) => l.id).join(", ")}`),
      }),
      execute: async ({ lessonId }) => {
        const lesson = lessons.find((l) => l.id === lessonId.trim());

        if (!lesson) {
          return {
            error: `No lesson with id "${lessonId}".`,
            availableLessonIds: lessons.map((l) => l.id),
          };
        }

        // Fields are listed explicitly rather than spread: `lesson.quiz` carries
        // correctIndex and explanation for every question, and must never reach the
        // model. A spread would silently re-expose it if Lesson gains a field.
        return {
          id: lesson.id,
          order: lesson.order,
          title: lesson.title,
          summary: lesson.summary,
          sections: lesson.sections,
          takeaways: lesson.takeaways,
          quizQuestionCount: lesson.quiz.length,
          completed: completed.has(lesson.id),
        };
      },
    }),

    lookup_glossary: tool({
      description:
        "Look up a trading term in Kobopilot's glossary so your definition matches the one in the app.",
      inputSchema: z.object({
        term: z.string().describe("The term to define, e.g. 'spread' or 'dividend'"),
      }),
      execute: async ({ term }) => {
        const needle = term.trim().toLowerCase();
        if (!needle) {
          return { match: "none", availableTerms: glossary.map((e) => e.term) };
        }

        const exact = getGlossaryEntry(needle);
        if (exact) return { match: "exact", entry: exact };

        const partial = glossary.filter(
          (entry) =>
            entry.term.toLowerCase().includes(needle) ||
            needle.includes(entry.term.toLowerCase())
        );

        if (partial.length > 0) {
          return { match: "partial", entries: partial.slice(0, 5) };
        }

        return { match: "none", availableTerms: glossary.map((e) => e.term) };
      },
    }),
  };
}
