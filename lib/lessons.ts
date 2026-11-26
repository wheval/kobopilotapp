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
    id: "ngx-basics",
    order: 2,
    title: "NGX market basics",
    summary: "How Nigeria's stock exchange works and what moves the ASI.",
    sections: [
      {
        heading: "What is the NGX?",
        body: "The Nigerian Exchange Group (NGX) is where shares of Nigerian companies trade. When you buy DANGCEM or ZENITHBANK, your order routes through a licensed broker to the exchange.",
      },
      {
        heading: "Trading hours & the ASI",
        body: "NGX trades Monday–Friday, roughly 9:00 AM to 4:00 PM WAT. The All-Share Index (ASI) tracks the overall market — when it rises, most listed stocks tend to move up together.",
      },
      {
        heading: "Boards and sectors",
        body: "Companies sit on Premium, Main, or Growth boards. Banks, cement, telcos, and oil & gas dominate market cap. Sector trends often matter as much as single-stock news.",
      },
    ],
    takeaways: [
      "NGX is Nigeria's main equity market.",
      "The ASI shows broad market direction.",
      "Sector context helps you read individual moves.",
    ],
    quiz: [
      {
        id: "q6-1",
        question: "NGX trading mainly happens on…",
        options: ["Weekends only", "Weekdays during market hours", "Only at midnight", "Only during holidays"],
        correctIndex: 1,
        explanation: "NGX follows a weekday schedule with defined market hours.",
      },
      {
        id: "q6-2",
        question: "The ASI measures…",
        options: ["One company's revenue", "Overall market direction", "Your portfolio balance", "Bank interest rates"],
        correctIndex: 1,
        explanation: "The All-Share Index tracks the broad NGX market.",
      },
      {
        id: "q6-3",
        question: "To buy an NGX stock you need…",
        options: ["Direct access to the exchange floor", "A licensed broker or platform", "Government approval each time", "Only foreign currency"],
        correctIndex: 1,
        explanation: "Retail investors trade through licensed brokers and apps.",
      },
    ],
  },
  {
    id: "reading-a-chart",
    order: 3,
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
    order: 4,
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
    order: 5,
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
    order: 6,
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
  {
    id: "dividends-on-ngx",
    order: 7,
    title: "Dividends on NGX",
    summary: "How Nigerian companies pay shareholders and what to watch for.",
    sections: [
      {
        heading: "What is a dividend?",
        body: "A dividend is cash some profitable companies pay shareholders — usually in naira per share. Banks and consumer giants on NGX are common dividend payers.",
      },
      {
        heading: "Ex-dividend date",
        body: "You must own shares before the ex-dividend date to receive the payout. After that date, the stock often drops by roughly the dividend amount.",
      },
      {
        heading: "Yield vs growth",
        body: "High dividend yield can mean steady income, but very high yields sometimes signal trouble. Balance dividend stocks with growth names in your paper portfolio.",
      },
    ],
    takeaways: [
      "Dividends are profit shared with shareholders.",
      "Ex-dividend date determines who gets paid.",
      "Yield is one factor — not the only one.",
    ],
    quiz: [
      {
        id: "q7-1",
        question: "A dividend is…",
        options: ["A loan to the company", "Cash paid to shareholders", "A type of market order", "A chart pattern"],
        correctIndex: 1,
        explanation: "Dividends return cash to shareholders from company profits.",
      },
      {
        id: "q7-2",
        question: "To receive a declared dividend you must own shares…",
        options: ["After the ex-dividend date", "Before the ex-dividend date", "Only on weekends", "Never"],
        correctIndex: 1,
        explanation: "Ownership before ex-dividend date qualifies you for the payout.",
      },
      {
        id: "q7-3",
        question: "Dividend yield tells you…",
        options: ["CEO age", "Income relative to share price", "Trading volume", "Broker fees"],
        correctIndex: 1,
        explanation: "Yield compares annual dividend to the current share price.",
      },
    ],
  },
  {
    id: "news-and-filings",
    order: 8,
    title: "News & company filings",
    summary: "Read NGX headlines and disclosures without getting overwhelmed.",
    sections: [
      {
        heading: "Price vs news",
        body: "Headlines move sentiment fast — earnings beats, dividend announcements, and regulatory news can spike volume. Not every headline deserves a trade.",
      },
      {
        heading: "Corporate disclosures",
        body: "Listed companies file material events with NGX: results, rights issues, board changes. These are more reliable than random social media tips.",
      },
      {
        heading: "Build a simple routine",
        body: "Check the ASI direction, scan your watchlist, read one disclosure on a holding, then decide if your paper thesis still holds. Consistency beats reacting to every alert.",
      },
    ],
    takeaways: [
      "News moves prices but isn't always actionable.",
      "Official filings beat rumours.",
      "A simple review routine reduces impulsive trades.",
    ],
    quiz: [
      {
        id: "q8-1",
        question: "Corporate disclosures are useful because they…",
        options: ["Guarantee profits", "Come from official company filings", "Replace all research", "Only appear on weekends"],
        correctIndex: 1,
        explanation: "Disclosures are regulated, official updates from listed companies.",
      },
      {
        id: "q8-2",
        question: "Before trading on a headline you should…",
        options: ["Ignore your plan", "Check if it changes your thesis", "Always double position size", "Never read charts"],
        correctIndex: 1,
        explanation: "Ask whether the news actually changes your reason for owning the stock.",
      },
      {
        id: "q8-3",
        question: "A healthy review routine includes…",
        options: ["Only social media", "Market direction + holdings check", "Deleting trade history", "Trading every rumour"],
        correctIndex: 1,
        explanation: "Combine market context with a quick look at your positions.",
      },
    ],
  },
  {
    id: "reading-results",
    order: 9,
    title: "Reading a company's results",
    summary: "Revenue, profit and EPS, and how to tell real growth from a one-off.",
    sections: [
      {
        heading: "Revenue, profit and EPS",
        body: "Revenue is the money a company brings in from sales. Profit after tax is what's left once costs and tax are paid. Earnings per share (EPS) divides that profit by the number of shares, so you can compare it with the share price.",
      },
      {
        heading: "Where results come from",
        body: "NGX-listed companies publish quarterly results and audited annual reports, and they appear as disclosures on the NGX website. Annual reports also include the auditor's opinion on whether the numbers can be trusted.",
      },
      {
        heading: "Real growth vs a one-off",
        body: "Compare results with the same period last year, not just the last quarter. A big jump can come from a one-off, such as foreign-exchange gains when the naira moves, which may not repeat next year.",
      },
    ],
    takeaways: [
      "EPS is profit divided by the number of shares.",
      "Official results and annual reports beat rumours.",
      "Compare year-on-year and watch for one-off gains.",
    ],
    quiz: [
      {
        id: "q9-1",
        question: "Earnings per share (EPS) is…",
        options: ["Revenue divided by employees", "Profit divided by the number of shares", "The share price divided by two", "The dividend paid last year"],
        correctIndex: 1,
        explanation: "EPS spreads the company's profit across every share.",
      },
      {
        id: "q9-2",
        question: "Comparing this quarter with the same quarter last year helps you…",
        options: ["Spot real growth, not seasonal swings", "Predict tomorrow's price", "Avoid reading results", "Guarantee a profit"],
        correctIndex: 0,
        explanation: "Year-on-year comparisons remove seasonal effects.",
      },
      {
        id: "q9-3",
        question: "A profit jump caused by a one-off FX gain…",
        options: ["Will definitely repeat", "May not repeat next year", "Means the stock must be bought", "Has no effect on profit"],
        correctIndex: 1,
        explanation: "One-off gains flatter a single period; check where the profit came from.",
      },
    ],
  },
  {
    id: "valuation-basics",
    order: 10,
    title: "Valuation: P/E and dividend yield",
    summary: "Why a high share price isn't the same as an expensive stock.",
    sections: [
      {
        heading: "Price isn't value",
        body: "SEPLAT trading above ₦11,000 and NB around ₦70 tells you nothing about which is cheaper. What matters is what you get for the price: the company's earnings and the dividends it pays.",
      },
      {
        heading: "The P/E ratio",
        body: "Price-to-earnings (P/E) is the share price divided by EPS. A P/E of 5 means you pay ₦5 for every ₦1 of yearly profit. A low P/E can mean a bargain, or that investors expect profits to fall.",
      },
      {
        heading: "Dividend yield",
        body: "Dividend yield is the yearly dividend per share divided by the share price. A ₦10 dividend on a ₦100 share is a 10% yield. An unusually high yield can be a warning that the market expects the dividend to be cut.",
      },
    ],
    takeaways: [
      "A high share price doesn't make a stock expensive.",
      "P/E = share price ÷ earnings per share.",
      "Dividend yield = yearly dividend ÷ share price.",
    ],
    quiz: [
      {
        id: "q10-1",
        question: "The P/E ratio is calculated as…",
        options: ["Share price ÷ earnings per share", "Revenue ÷ profit", "Dividend × share price", "Market cap ÷ employees"],
        correctIndex: 0,
        explanation: "P/E compares what you pay with the profit behind each share.",
      },
      {
        id: "q10-2",
        question: "A ₦5 yearly dividend on a ₦50 share is a yield of…",
        options: ["5%", "10%", "50%", "1%"],
        correctIndex: 1,
        explanation: "₦5 ÷ ₦50 = 0.10, a 10% dividend yield.",
      },
      {
        id: "q10-3",
        question: "A stock priced at ₦11,000 per share is…",
        options: ["Always too expensive", "Not necessarily expensive: compare it with earnings", "Always a bargain", "Impossible to buy"],
        correctIndex: 1,
        explanation: "Value depends on earnings and dividends, not the price tag alone.",
      },
    ],
  },
  {
    id: "avoiding-scams",
    order: 11,
    title: "Spotting scams and hype",
    summary: "Guaranteed returns, unregistered platforms and pump-and-dumps.",
    sections: [
      {
        heading: "Guaranteed returns are a red flag",
        body: "Real investments carry risk, so no one can promise a fixed high return. Schemes that guarantee big monthly payouts and pay early members with new members' money are Ponzi schemes, and they collapse.",
      },
      {
        heading: "Check who you're dealing with",
        body: "Stockbrokers and investment platforms in Nigeria must be registered with the Securities and Exchange Commission (SEC). Check the SEC's list of registered capital market operators before you send anyone money.",
      },
      {
        heading: "Pump and dump",
        body: "Groups hype a small stock on social media, buy early, then sell to latecomers as the price spikes. If a tip pushes you to buy right now before it's too late, slow down and check the company's filings.",
      },
    ],
    takeaways: [
      "Guaranteed high returns are a classic scam sign.",
      "Only use SEC-registered brokers and platforms.",
      "Urgent hype is a reason to slow down, not speed up.",
    ],
    quiz: [
      {
        id: "q11-1",
        question: "A scheme promising a guaranteed 30% every month is most likely…",
        options: ["A safe savings plan", "A scam", "A government bond", "A normal stock"],
        correctIndex: 1,
        explanation: "No real investment can guarantee returns like that.",
      },
      {
        id: "q11-2",
        question: "Before using a broker or platform, check that it is registered with…",
        options: ["A WhatsApp group", "The SEC", "The stock's fan page", "No one"],
        correctIndex: 1,
        explanation: "The SEC registers and supervises capital market operators in Nigeria.",
      },
      {
        id: "q11-3",
        question: "A pump-and-dump scheme makes money by…",
        options: ["Paying dividends", "Selling hyped shares to late buyers", "Lowering the spread", "Publishing audited results"],
        correctIndex: 1,
        explanation: "The promoters sell at the top, leaving latecomers with the losses.",
      },
    ],
  },
  {
    id: "owning-real-shares",
    order: 12,
    title: "Owning real NGX shares",
    summary: "Brokers, your CHN, fees, and how dividends reach you.",
    sections: [
      {
        heading: "Brokers and your CHN",
        body: "To buy real NGX shares you open an account with an SEC-registered stockbroker; many offer apps. Your shares are held electronically at the Central Securities Clearing System (CSCS) under your Clearing House Number (CHN).",
      },
      {
        heading: "Fees add up",
        body: "Every buy and sell pays a broker's commission plus regulatory fees. Lots of small, frequent trades can lose money to costs even when prices barely move, which is one more reason to practise here first.",
      },
      {
        heading: "Getting your dividends",
        body: "Dividends are paid by the company's registrar. Register an e-dividend mandate so payments go straight into your bank account instead of sitting unclaimed.",
      },
    ],
    takeaways: [
      "Real shares are bought through an SEC-registered stockbroker.",
      "Your shares sit at the CSCS under your CHN.",
      "Fees and an e-dividend mandate both matter.",
    ],
    quiz: [
      {
        id: "q12-1",
        question: "Your real NGX shares are held electronically under your…",
        options: ["BVN at your bank", "CHN at the CSCS", "Phone number", "Email address"],
        correctIndex: 1,
        explanation: "The CSCS holds shares under each investor's Clearing House Number.",
      },
      {
        id: "q12-2",
        question: "Why can lots of small, frequent trades lose money?",
        options: ["Fees on every trade add up", "Small trades are illegal", "Prices always fall", "Dividends stop"],
        correctIndex: 0,
        explanation: "Commission and fees are charged on every buy and sell.",
      },
      {
        id: "q12-3",
        question: "To receive dividends directly in your bank account, you should…",
        options: ["Wait for a cheque", "Register an e-dividend mandate", "Sell your shares", "Call the stock exchange"],
        correctIndex: 1,
        explanation: "An e-dividend mandate sends payments straight to your bank.",
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
  // a lesson you've already completed always stays open, even if the path
  // order changed since (ngx basics moved from lesson 6 to lesson 2)
  const self = lessons.find((l) => l.order === lessonOrder);
  if (self && completedLessonIds.includes(self.id)) return true;
  const previous = lessons.find((l) => l.order === lessonOrder - 1);
  return previous ? completedLessonIds.includes(previous.id) : false;
}
