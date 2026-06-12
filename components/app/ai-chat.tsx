"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";

import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { DuoButton } from "@/components/ui/duo-button";
import { explainDailyMove } from "@/lib/market/quote-utils";
import { hapticPress, hapticTap } from "@/lib/haptics";
import { useChatStore } from "@/lib/store/chat-store";
import { useMarketStore } from "@/lib/store/market-store";
import { useTradingStore } from "@/lib/store/trading-store";
import type { WatchlistItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const generalPrompts = [
  "what is ngx?",
  "explain bid vs ask",
  "how do dividends work?",
  "should i diversify?",
];

function chartPrompts(symbol: string) {
  return [
    `why is ${symbol} moving today?`,
    "explain this chart",
    "compare yesterday vs today",
    "should i buy now?",
  ];
}

function mockReply(
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

function chartWelcomeMessage(symbol: string, quote: WatchlistItem | undefined) {
  if (!quote) {
    return `looking at ${symbol} on your chart — ask me why the price is moving, or how to read the liveline!`;
  }
  return `looking at ${symbol} on your chart. ${explainDailyMove(quote)} ask me anything about the move!`;
}

export function AiChatFab() {
  const pathname = usePathname();
  const isOpen = useChatStore((s) => s.isOpen);
  const chatContext = useChatStore((s) => s.context);
  const openChat = useChatStore((s) => s.openChat);
  const openChartChat = useChatStore((s) => s.openChartChat);
  const closeChat = useChatStore((s) => s.closeChat);
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);
  const getQuote = useMarketStore((s) => s.getQuote);

  const onPractice = pathname === "/practice";
  const chartMode = chatContext.mode === "chart" || onPractice;
  const symbol = chatContext.symbol ?? (onPractice ? selectedSymbol : undefined);

  const hasStickyCta =
    pathname.startsWith("/learn/") && !pathname.endsWith("/glossary");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "hey! i'm kobo ai — ask me about ngx stocks, orders, or anything from your lessons.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const chartSeededRef = useRef<string | null>(null);

  const starterPrompts = useMemo(
    () => (chartMode && symbol ? chartPrompts(symbol) : generalPrompts),
    [chartMode, symbol]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      chartSeededRef.current = null;
      return;
    }

    if (chartMode && symbol && chartSeededRef.current !== symbol) {
      chartSeededRef.current = symbol;
      setMessages([
        {
          id: "chart-welcome",
          role: "assistant",
          text: chartWelcomeMessage(symbol, getQuote(symbol)),
        },
      ]);
    }
  }, [isOpen, chartMode, symbol, getQuote]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const activeQuote = symbol ? getQuote(symbol) : undefined;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: trimmed },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: mockReply(trimmed, activeQuote, chartMode),
      },
    ]);
    setInput("");
  };

  const handleOpen = () => {
    if (onPractice && selectedSymbol) {
      openChartChat(selectedSymbol);
      return;
    }
    openChat();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "fixed z-40 flex size-14 items-center justify-center rounded-full border-2 border-b-4 border-[#46a302] bg-[#58cc02] text-white shadow-soft-lift micro-press transition-transform",
          hasStickyCta
            ? "bottom-[calc(var(--app-tabbar-h)+var(--app-sticky-cta-h)+env(safe-area-inset-bottom,0px)+0.5rem)] left-4 md:bottom-6 md:left-auto md:right-6"
            : "bottom-[calc(var(--app-tabbar-h)+env(safe-area-inset-bottom,0px)+1rem)] right-4 md:bottom-6 md:right-6",
          isOpen && "pointer-events-none opacity-0"
        )}
        aria-label="Open AI chat"
      >
        <MessageCircle className="size-7" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-80 flex flex-col overflow-hidden bg-canvas md:inset-auto md:bottom-6 md:right-6 md:h-[min(640px,calc(100dvh-3rem))] md:w-[min(420px,calc(100vw-2rem))] md:rounded-2xl md:border-2 md:border-b-4 md:border-hairline-strong md:bg-paper md:shadow-card">
          <div
            className="flex shrink-0 items-center justify-between border-b-2 border-hairline bg-paper px-4 py-3"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#58cc02]" />
              <div>
                <p className="font-extrabold lowercase text-ink">kobo ai</p>
                <p className="text-[10px] font-bold uppercase text-ink-soft">
                  {chartMode && symbol ? `${symbol} chart coach` : "ngx coach · demo"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="flex size-10 items-center justify-center rounded-xl border-2 border-hairline bg-canvas"
              aria-label="Close chat"
            >
              <X className="size-5" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
            <div className="flex justify-center pb-2">
              <KoboMascot
                mood="happy"
                size="sm"
                speech={chartMode ? "ask about the chart!" : "ask me anything!"}
              />
            </div>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "animate-pop-in max-w-[88%] rounded-2xl border-2 border-b-4 px-4 py-3 text-sm lowercase leading-relaxed",
                  msg.role === "user"
                    ? "ml-auto border-[#84d8ff] border-b-[#1899d6] bg-[#ddf4ff]"
                    : "border-hairline-strong bg-paper text-ink-soft"
                )}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div
            className="shrink-0 space-y-3 border-t-2 border-hairline bg-paper p-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    hapticPress();
                    send(prompt);
                  }}
                  className="micro-press rounded-full border-2 border-hairline bg-canvas px-3 py-1.5 text-xs font-bold lowercase text-ink-soft transition-colors hover:border-[#58cc02] hover:text-ink"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                hapticTap();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  chartMode ? "ask about this chart…" : "ask about ngx trading…"
                }
                className="min-w-0 flex-1 rounded-xl border-2 border-b-4 border-hairline-strong bg-canvas px-4 py-3 text-sm font-semibold outline-none focus:border-[#58cc02] focus:border-b-[#58cc02]"
              />
              <DuoButton type="submit" variant="success" size="sm" className="!px-4">
                <Send className="size-4" />
              </DuoButton>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function AskChartButton({ symbol }: { symbol: string }) {
  const openChartChat = useChatStore((s) => s.openChartChat);

  return (
    <DuoButton
      variant="secondary"
      size="sm"
      onClick={() => openChartChat(symbol)}
      className="normal-case"
    >
      ask kobo about this chart
    </DuoButton>
  );
}
