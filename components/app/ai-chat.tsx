"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  getToolName,
  isToolUIPart,
  type UIMessage,
} from "ai";
import { MessageCircle, RotateCcw, Send, Sparkles, Square, X } from "lucide-react";

import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { DuoButton } from "@/components/ui/duo-button";
import { buildChatContext } from "@/lib/ai/client-context";
import { MAX_MESSAGE_CHARS } from "@/lib/ai/limits";
import { chartWelcomeMessage, mockReply } from "@/lib/ai/mock-reply";
import { hapticPress, hapticTap } from "@/lib/haptics";
import {
  useChatHistoryHydrated,
  useChatHistoryStore,
  type StoredChatMessage,
} from "@/lib/store/chat-history-store";
import { useChatStore } from "@/lib/store/chat-store";
import { useMarketStore } from "@/lib/store/market-store";
import { useTradingStore } from "@/lib/store/trading-store";
import { cn } from "@/lib/utils";

const transport = new DefaultChatTransport({ api: "/api/chat" });

const WELCOME_TEXT =
  "hey! i'm kobo ai — ask me about ngx stocks, orders, or anything from your lessons.";

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

/** What Kobo is doing while a tool runs, so the pause reads as work not lag. */
const toolLabels: Record<string, string> = {
  get_quote: "checking the price",
  get_watchlist: "checking the watchlist",
  get_portfolio: "checking your portfolio",
  get_progress: "checking your progress",
  list_lessons: "checking your lessons",
  get_lesson: "checking your lessons",
  lookup_glossary: "checking the glossary",
};

function assistantMessage(id: string, text: string): UIMessage {
  return { id, role: "assistant", parts: [{ type: "text", text }] };
}

function messageText(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

function toStored(message: UIMessage): StoredChatMessage | null {
  if (message.role !== "user" && message.role !== "assistant") return null;
  const text = messageText(message);
  if (!text) return null;
  return { id: message.id, role: message.role, text };
}

function fromStored(message: StoredChatMessage): UIMessage {
  return {
    id: message.id,
    role: message.role,
    parts: [{ type: "text", text: message.text }],
  };
}

function runningToolLabel(message: UIMessage): string | null {
  for (const part of message.parts) {
    if (!isToolUIPart(part)) continue;
    if (part.state === "output-available" || part.state === "output-error") continue;
    return toolLabels[getToolName(part)] ?? "looking that up";
  }
  return null;
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
  // On practice the live watchlist selection wins. Preferring the symbol captured when
  // the panel opened would pin the coach to a chart the user has since switched away
  // from — and with per-symbol threads, strand the new symbol's transcript.
  const symbol = onPractice ? selectedSymbol : chatContext.symbol;

  const onLesson =
    pathname.startsWith("/learn/") && !pathname.endsWith("/glossary");
  const lessonId = onLesson ? pathname.split("/")[2] : undefined;
  const hasStickyCta = onLesson;

  // One transcript per conversation subject: the general coach, and each chart symbol.
  const threadKey = chartMode && symbol ? `chart:${symbol}` : "general";
  const historyHydrated = useChatHistoryHydrated();

  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const loadedThreadRef = useRef<string | null>(null);
  const stickToBottomRef = useRef(true);

  const {
    messages,
    sendMessage,
    setMessages,
    regenerate,
    stop,
    status,
    error,
    clearError,
  } = useChat({
    transport,
    // Coalesce token updates; without it every delta is a React render.
    throttle: 50,
    messages: [assistantMessage("welcome", WELCOME_TEXT)],
  });

  const busy = status === "submitted" || status === "streaming";

  const starterPrompts = useMemo(
    () => (chartMode && symbol ? chartPrompts(symbol) : generalPrompts),
    [chartMode, symbol]
  );

  const lastUserText = useMemo(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    return lastUser ? messageText(lastUser) : "";
  }, [messages]);

  const requestBody = useCallback(
    () => ({
      context: buildChatContext({
        mode: chartMode ? "chart" : "general",
        symbol,
        lessonId,
      }),
    }),
    [chartMode, symbol, lessonId]
  );

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!trimmed || busy) return;

      setInput("");
      stickToBottomRef.current = true;
      clearError();
      void sendMessage({ text: trimmed }, { body: requestBody() });
    },
    [busy, clearError, requestBody, sendMessage]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Only follow the stream while the user is already at the bottom — yanking them back
  // mid-read is worse than a stale scroll position.
  useEffect(() => {
    if (!isOpen || !stickToBottomRef.current) return;
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({
      top: list.scrollHeight,
      behavior: status === "streaming" ? "auto" : "smooth",
    });
  }, [messages, isOpen, status, error]);

  const welcomeMessage = useCallback(
    () =>
      chartMode && symbol
        ? assistantMessage(
            `chart-welcome-${symbol}`,
            chartWelcomeMessage(symbol, getQuote(symbol))
          )
        : assistantMessage("welcome", WELCOME_TEXT),
    [chartMode, symbol, getQuote]
  );

  // Load and save share one effect so their order is not a race: the pass that restores
  // a thread returns before the save branch, which would otherwise write the previous
  // thread's messages under the new key in the same commit.
  useEffect(() => {
    if (!isOpen) {
      loadedThreadRef.current = null;
      return;
    }
    if (!historyHydrated) return;

    const history = useChatHistoryStore.getState();

    if (loadedThreadRef.current !== threadKey) {
      loadedThreadRef.current = threadKey;
      const stored = history.readThread(threadKey);
      setMessages(stored.length > 0 ? stored.map(fromStored) : [welcomeMessage()]);
      stickToBottomRef.current = true;
      return;
    }

    if (status === "streaming") return;
    // Don't persist an auto-seeded welcome — its price quote would greet them stale
    // tomorrow. A thread becomes real once the user has actually said something.
    if (!messages.some((message) => message.role === "user")) return;

    history.saveThread(
      threadKey,
      messages
        .map(toStored)
        .filter((message): message is StoredChatMessage => message !== null)
    );
  }, [
    isOpen,
    historyHydrated,
    threadKey,
    messages,
    status,
    setMessages,
    welcomeMessage,
  ]);

  const handleOpen = () => {
    if (onPractice && selectedSymbol) {
      openChartChat(selectedSymbol);
      return;
    }
    openChat();
  };

  const handleClear = () => {
    hapticPress();
    if (busy) stop();
    useChatHistoryStore.getState().clearThread(threadKey);
    clearError();
    setMessages([welcomeMessage()]);
    stickToBottomRef.current = true;
  };

  const handleScroll = () => {
    const list = listRef.current;
    if (!list) return;
    stickToBottomRef.current =
      list.scrollHeight - list.scrollTop - list.clientHeight < 80;
  };

  const lastMessage = messages[messages.length - 1];
  const pendingTool =
    lastMessage?.role === "assistant" ? runningToolLabel(lastMessage) : null;
  const awaitingFirstToken =
    status === "submitted" || (busy && lastMessage?.role === "user");

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
                  {chartMode && symbol ? `${symbol} chart coach` : "ngx coach"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="micro-press flex size-10 items-center justify-center rounded-xl border-2 border-hairline bg-canvas text-ink-soft"
                aria-label="Start a new chat"
                title="start a new chat"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                onClick={closeChat}
                className="flex size-10 items-center justify-center rounded-xl border-2 border-hairline bg-canvas"
                aria-label="Close chat"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4"
            aria-live="polite"
            aria-busy={busy}
          >
            <div className="flex justify-center pb-2">
              <KoboMascot
                mood="happy"
                size="sm"
                speech={chartMode ? "ask about the chart!" : "ask me anything!"}
              />
            </div>

            {messages.map((message) => {
              const text = messageText(message);
              if (!text) return null;

              return (
                <div
                  key={message.id}
                  className={cn(
                    "animate-pop-in max-w-[88%] whitespace-pre-wrap rounded-2xl border-2 border-b-4 px-4 py-3 text-sm lowercase leading-relaxed",
                    message.role === "user"
                      ? "ml-auto border-[#84d8ff] border-b-[#1899d6] bg-[#ddf4ff]"
                      : "border-hairline-strong bg-paper text-ink-soft"
                  )}
                >
                  {text}
                </div>
              );
            })}

            {(awaitingFirstToken || pendingTool) && (
              <div className="flex max-w-[88%] items-center gap-2 rounded-2xl border-2 border-b-4 border-hairline-strong bg-paper px-4 py-3">
                <span className="flex gap-1" aria-hidden>
                  <Dot delay="0ms" />
                  <Dot delay="150ms" />
                  <Dot delay="300ms" />
                </span>
                <span className="text-xs font-bold lowercase text-ink-soft">
                  {pendingTool ?? "thinking"}
                </span>
              </div>
            )}

            {error && (
              <div className="animate-pop-in max-w-[88%] space-y-2 rounded-2xl border-2 border-b-4 border-hairline-strong bg-paper px-4 py-3 text-sm lowercase leading-relaxed text-ink-soft">
                <p>
                  {mockReply(
                    lastUserText,
                    symbol ? getQuote(symbol) : undefined,
                    chartMode
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    hapticPress();
                    clearError();
                    stickToBottomRef.current = true;
                    void regenerate({ body: requestBody() });
                  }}
                  className="micro-press rounded-full border-2 border-hairline bg-canvas px-3 py-1 text-xs font-bold lowercase text-ink-soft hover:border-[#58cc02] hover:text-ink"
                >
                  try again
                </button>
              </div>
            )}
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
                  disabled={busy}
                  onClick={() => {
                    hapticPress();
                    send(prompt);
                  }}
                  className="micro-press rounded-full border-2 border-hairline bg-canvas px-3 py-1.5 text-xs font-bold lowercase text-ink-soft transition-colors hover:border-[#58cc02] hover:text-ink disabled:opacity-50"
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
                maxLength={MAX_MESSAGE_CHARS}
                placeholder={
                  chartMode ? "ask about this chart…" : "ask about ngx trading…"
                }
                className="min-w-0 flex-1 rounded-xl border-2 border-b-4 border-hairline-strong bg-canvas px-4 py-3 text-sm font-semibold outline-none focus:border-[#58cc02] focus:border-b-[#58cc02]"
              />
              {busy ? (
                <DuoButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="!px-4"
                  onClick={() => {
                    hapticPress();
                    stop();
                  }}
                  aria-label="Stop generating"
                >
                  <Square className="size-4" />
                </DuoButton>
              ) : (
                <DuoButton
                  type="submit"
                  variant="success"
                  size="sm"
                  className="!px-4"
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                </DuoButton>
              )}
            </form>
            <p className="text-center text-[10px] font-bold lowercase text-ink-soft">
              educational only · not financial advice
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="size-1.5 animate-bounce rounded-full bg-ink-soft"
      style={{ animationDelay: delay }}
    />
  );
}

export function AskChartButton({
  symbol,
  className,
}: {
  symbol: string;
  className?: string;
}) {
  const openChartChat = useChatStore((s) => s.openChartChat);

  return (
    <DuoButton
      variant="secondary"
      size="sm"
      onClick={() => openChartChat(symbol)}
      className={cn("normal-case", className)}
    >
      ask kobo about this chart
    </DuoButton>
  );
}
