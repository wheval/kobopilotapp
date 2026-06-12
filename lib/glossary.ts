export type GlossaryEntry = {
  term: string;
  definition: string;
  example?: string;
};

export const glossary: GlossaryEntry[] = [
  {
    term: "NGX",
    definition:
      "The Nigerian Exchange Group — Nigeria's main stock market where companies like DANGCEM and GTCO list their shares.",
    example: "When you buy MTNN on Kobopilot, you're trading an NGX-listed stock.",
  },
  {
    term: "bid",
    definition:
      "The highest price a buyer is willing to pay for a stock right now.",
    example: "If the bid is ₦285, buyers want shares at that price or lower.",
  },
  {
    term: "ask",
    definition:
      "The lowest price a seller is willing to accept for a stock right now.",
    example: "If the ask is ₦287, sellers won't sell below that price.",
  },
  {
    term: "spread",
    definition: "The gap between the bid and ask prices.",
    example: "A tight spread usually means the stock is easier to trade.",
  },
  {
    term: "market order",
    definition:
      "An order to buy or sell immediately at the best available price.",
    example: "Use this when speed matters more than an exact entry price.",
  },
  {
    term: "limit order",
    definition:
      "An order that only fills at your chosen price or better.",
    example: "A buy limit at ₦100 only executes at ₦100 or lower.",
  },
  {
    term: "volume",
    definition: "How many shares changed hands during a trading session.",
    example: "High volume on a price move often means strong participation.",
  },
  {
    term: "dividend",
    definition:
      "Cash some companies pay shareholders from their profits, usually in naira per share.",
    example: "If GTCO pays ₦3 per share, 100 shares earn ₦300 in dividends.",
  },
  {
    term: "portfolio",
    definition: "Your collection of investments — cash plus all your holdings.",
    example: "Paper mode starts you with ₦1,000,000 cash and zero holdings.",
  },
  {
    term: "diversification",
    definition:
      "Spreading money across different stocks or sectors to reduce risk.",
    example: "Owning both a bank and a cement stock is more diversified than one stock.",
  },
  {
    term: "candlestick",
    definition:
      "A chart shape showing open, high, low, and close prices for a time period.",
    example: "A green candle means the price closed higher than it opened.",
  },
  {
    term: "ASI",
    definition:
      "All-Share Index — tracks the overall direction of the NGX market.",
    example: "When the ASI rises, most NGX stocks are trending up together.",
  },
  {
    term: "market cap",
    definition:
      "Total value of a company's shares — price multiplied by shares outstanding.",
    example: "Large caps like DANGCEM often move more slowly than small caps.",
  },
  {
    term: "paper trading",
    definition:
      "Practice buying and selling with fake money — zero real risk.",
    example: "Kobopilot's practice tab uses ₦ play cash, not your bank account.",
  },
];

const glossaryMap = new Map(
  glossary.map((entry) => [entry.term.toLowerCase(), entry])
);

export function getGlossaryEntry(term: string): GlossaryEntry | undefined {
  return glossaryMap.get(term.toLowerCase());
}

export function findTermsInText(text: string): GlossaryEntry[] {
  const lower = text.toLowerCase();
  return glossary.filter((entry) => {
    const pattern = new RegExp(`\\b${entry.term.toLowerCase()}\\b`, "i");
    return pattern.test(lower);
  });
}
