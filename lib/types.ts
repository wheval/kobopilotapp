export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Lesson = {
  id: string;
  order: number;
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
  takeaways: string[];
  quiz: QuizQuestion[];
};

export type WatchlistItem = {
  symbol: string;
  name: string;
  price: number;
  previousClose?: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  /** Present only on live NGXPulse quotes; absent on simulated ones. */
  volume?: number;
  marketCap?: number;
  sector?: string;
  changePercent7d?: number;
  /** YYYY-MM-DD of the session this price came from. */
  tradeDate?: string;
};

export type Holding = {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
};

export type Trade = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  total: number;
  timestamp: number;
};

export type OrderSide = "buy" | "sell";
