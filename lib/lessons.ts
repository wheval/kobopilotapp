import type { Lesson } from "./types";
import { NGX_SEED_STOCKS } from "./market/ngx-seed";

export type { WatchlistItem } from "./types";
export const watchlist = NGX_SEED_STOCKS;

export const lessons: Lesson[] = [
  {
    id: "what-is-a-stock",
    order: 1,
    title: "What is a stock?",
    summary: "Understand ownership, markets, and how prices move.",
    sections: [
      {
        heading: "Owning a piece of a company",
        body: "A stock represents a share of ownership in a company listed on the Nigerian Exchange (NGX). When you buy DANGCEM or GTCO shares, you become a partial owner and may benefit if the company grows in value or pays dividends.",
      },
      {
        heading: "Bid and ask prices",
        body: "Every stock has a bid (what buyers will pay) and an ask (what sellers want). The difference is the spread. Trades happen when a buyer and seller agree on a price.",
      },
      {
        heading: "Why prices change",
        body: "Stock prices move based on company performance, news, investor sentiment, and broader economic conditions. Short-term moves can be noisy; long-term trends often reflect business fundamentals.",
      },
    ],
    takeaways: [
      "A stock is a share of company ownership.",
      "Bid/ask prices show what buyers and sellers are willing to trade at.",
      "Prices reflect expectations about future value.",
    ],
    quiz: [
      {
        id: "q1-1",
        question: "What does owning a stock mean?",
        options: [
          "You lent money to the company",
          "You own a share of the company",
          "You guaranteed a fixed return",
          "You work for the company",
        ],
        correctIndex: 1,
        explanation: "Stocks represent equity — partial ownership in a company.",
      },
      {
        id: "q1-2",
        question: "The ask price is…",
        options: [
          "What buyers are willing to pay",
          "What sellers want to receive",
          "The daily high price",
          "The company's book value",
        ],
        correctIndex: 1,
        explanation: "The ask is the lowest price a seller is currently willing to accept.",
      },
      {
        id: "q1-3",
        question: "Stock prices mainly reflect…",
        options: [
          "Only yesterday's revenue",
          "Expectations about future value",
          "Government-set targets",
          "The CEO's age",
        ],
        correctIndex: 1,
        explanation: "Markets price stocks based on expected future earnings and growth.",
      },
    ],
  },
  {
    id: "reading-a-chart",
    order: 2,
    title: "Reading a chart",
    summary: "Learn candlesticks, trends, and basic price action.",
    sections: [
      {
        heading: "Candlestick basics",
        body: "Each candle shows open, high, low, and close for a time period. Green (or white) candles often mean price closed higher; red means it closed lower.",
      },
      {
        heading: "Trends",
        body: "An uptrend makes higher highs and higher lows. A downtrend makes lower highs and lower lows. Identifying trend direction helps contextualize individual price moves.",
      },
      {
        heading: "Volume matters",
        body: "Volume shows how many shares traded. Strong moves with high volume can signal conviction; weak volume may suggest a move is less reliable.",
      },
    ],
    takeaways: [
      "Candlesticks summarize open, high, low, and close.",
      "Trends show the general direction of price movement.",
      "Volume adds context to price changes.",
    ],
    quiz: [
      {
        id: "q2-1",
        question: "A candlestick shows…",
        options: [
          "Only the closing price",
          "Open, high, low, and close",
          "Company revenue",
          "Dividend history",
        ],
        correctIndex: 1,
        explanation: "Candlesticks pack four price points into one visual.",
      },
      {
        id: "q2-2",
        question: "An uptrend is defined by…",
        options: [
          "Lower highs and lower lows",
          "Higher highs and higher lows",
          "Flat prices only",
          "Random movement",
        ],
        correctIndex: 1,
        explanation: "Uptrends climb through successive higher peaks and troughs.",
      },
      {
        id: "q2-3",
        question: "High volume during a price move often suggests…",
        options: [
          "No one is trading",
          "Strong participation",
          "The market is closed",
          "Prices cannot change",
        ],
        correctIndex: 1,
        explanation: "Volume indicates how many shares exchanged hands.",
      },
    ],
  },
  {
    id: "orders-101",
    order: 3,
    title: "Orders 101",
    summary: "Market vs limit orders and how trades execute.",
    sections: [
      {
        heading: "Market orders",
        body: "A market order buys or sells immediately at the best available price. It's fast but you may get a slightly different price than you saw — especially in volatile markets.",
      },
      {
        heading: "Limit orders",
        body: "A limit order sets the maximum price you'll pay (buy) or minimum you'll accept (sell). It gives price control but may not fill if the market doesn't reach your limit.",
      },
      {
        heading: "Choosing the right order",
        body: "Use market orders when speed matters and spreads are tight. Use limit orders when you want precise entry/exit prices and can wait for a fill.",
      },
    ],
    takeaways: [
      "Market orders prioritize speed over exact price.",
      "Limit orders prioritize price over guaranteed execution.",
      "Pick the order type that matches your goal.",
    ],
    quiz: [
      {
        id: "q3-1",
        question: "A market order executes…",
        options: [
          "At a price you set exactly",
          "At the best available price now",
          "Only after market close",
          "Never on weekends",
        ],
        correctIndex: 1,
        explanation: "Market orders match immediately against the order book.",
      },
      {
        id: "q3-2",
        question: "A buy limit order at ₦100 means…",
        options: [
          "Buy no matter the price",
          "Buy only at ₦100 or lower",
          "Sell at ₦100",
          "Cancel all orders",
        ],
        correctIndex: 1,
        explanation: "Limit buy caps the maximum price you'll pay.",
      },
      {
        id: "q3-3",
        question: "Limit orders may not fill if…",
        options: [
          "The market never reaches your price",
          "You have enough cash",
          "The stock exists",
          "Volume is high",
        ],
        correctIndex: 0,
        explanation: "If price doesn't hit your limit, the order stays open or expires.",
      },
    ],
  },
  {
    id: "risk-management",
    order: 4,
    title: "Risk management",
    summary: "Position sizing, diversification, and protecting capital.",
    sections: [
      {
        heading: "Position sizing",
        body: "Don't put all your capital into one trade. Many traders risk only a small percentage of their portfolio on any single idea — often 1–2%.",
      },
      {
        heading: "Stop-loss concept",
        body: "A stop-loss is a planned exit when a trade moves against you. It limits downside before emotions take over. In paper trading, practice setting stops before you enter.",
      },
      {
        heading: "Diversification",
        body: "Spreading across sectors and asset types reduces reliance on any single outcome. A diversified portfolio can smooth out volatility over time.",
      },
    ],
    takeaways: [
      "Size positions so one loss won't wipe you out.",
      "Plan exits before you enter a trade.",
      "Diversification reduces single-stock risk.",
    ],
    quiz: [
      {
        id: "q4-1",
        question: "Position sizing helps you…",
        options: [
          "Guarantee profits",
          "Limit damage from any single loss",
          "Avoid all taxes",
          "Trade without research",
        ],
        correctIndex: 1,
        explanation: "Smaller positions keep losses manageable.",
      },
      {
        id: "q4-2",
        question: "A stop-loss is…",
        options: [
          "A way to double your money",
          "A planned exit when price moves against you",
          "A type of dividend",
          "A chart pattern",
        ],
        correctIndex: 1,
        explanation: "Stops define maximum acceptable loss before exiting.",
      },
      {
        id: "q4-3",
        question: "Diversification means…",
        options: [
          "Buying one hot stock",
          "Spreading across different investments",
          "Trading only crypto",
          "Ignoring risk",
        ],
        correctIndex: 1,
        explanation: "Don't rely on a single company or sector for all returns.",
      },
    ],
  },
  {
    id: "your-first-trade",
    order: 5,
    title: "Your first trade",
    summary: "Put it together with a capstone paper trade.",
    sections: [
      {
        heading: "Plan before you click",
        body: "Define why you're entering, how much you'll risk, and where you'll exit — win or lose. Good traders journal their reasoning, not just their results.",
      },
      {
        heading: "Execute in paper mode",
        body: "Use Kobopilot's practice simulator to place a small market or limit order. Watch how your portfolio and cash balance change after the fill.",
      },
      {
        heading: "Review and iterate",
        body: "After your trade, note what you learned. Did the order type behave as expected? Would you adjust position size next time?",
      },
    ],
    takeaways: [
      "Always have a plan: entry, size, and exit.",
      "Paper trading builds muscle memory without real risk.",
      "Review every trade to improve the next one.",
    ],
    quiz: [
      {
        id: "q5-1",
        question: "Before placing a trade you should…",
        options: [
          "Have no plan",
          "Define entry, size, and exit",
          "Use all available cash",
          "Ignore the chart",
        ],
        correctIndex: 1,
        explanation: "A written plan reduces impulsive decisions.",
      },
      {
        id: "q5-2",
        question: "Paper trading lets you…",
        options: [
          "Practice without real money",
          "Guarantee live profits",
          "Skip learning basics",
          "Avoid all losses forever",
        ],
        correctIndex: 0,
        explanation: "Simulated trades build skills safely.",
      },
      {
        id: "q5-3",
        question: "After a trade, you should…",
        options: [
          "Never think about it again",
          "Review what worked and what didn't",
          "Double down emotionally",
          "Delete your history",
        ],
        correctIndex: 1,
        explanation: "Reflection turns experience into skill.",
      },
    ],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getNextLesson(currentId: string): Lesson | undefined {
  const current = getLessonById(currentId);
  if (!current) return undefined;
  return lessons.find((lesson) => lesson.order === current.order + 1);
}

export function isLessonUnlocked(
  lessonOrder: number,
  completedLessonIds: string[]
): boolean {
  if (lessonOrder === 1) return true;
  const previous = lessons.find((l) => l.order === lessonOrder - 1);
  return previous ? completedLessonIds.includes(previous.id) : false;
}
