"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { KoboMark } from "@/components/mascot/kobo-mark";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Shared: play a section's story once, when it scrolls into view            */
/* -------------------------------------------------------------------------- */

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function useStoryTrigger<T extends Element>(threshold = 0.4) {
  const ref = useRef<T>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPlayed(true);
        observer.disconnect();
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, played };
}

const naira = (n: number) =>
  `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* -------------------------------------------------------------------------- */
/*  Lesson path: bubbles unlock one by one, ending on "you are here"          */
/* -------------------------------------------------------------------------- */

type PathLesson = { id: string; order: number; title: string };

// Sway like the in-app path on wider screens.
const sway = ["md:ml-0", "md:ml-20", "md:ml-32", "md:ml-20"];

/** How far the demo learner gets: lessons before this index end up done. */
const DEMO_CURRENT = 3;
const STEP_MS = 260;

export function PathStory({ lessons }: { lessons: PathLesson[] }) {
  const { ref, played } = useStoryTrigger<HTMLOListElement>(0.3);

  return (
    <ol ref={ref} className="space-y-4">
      {lessons.map((lesson, i) => {
        const target =
          i < DEMO_CURRENT ? "done" : i === DEMO_CURRENT ? "current" : "locked";
        const state = played ? target : "locked";
        const delay = played ? `${i * STEP_MS}ms` : "0ms";

        return (
          <li
            key={lesson.id}
            className={cn("flex items-center gap-4", sway[i % sway.length])}
          >
            <span
              style={{ transitionDelay: delay }}
              className={cn(
                "relative inline-flex size-14 shrink-0 items-center justify-center rounded-full border-b-[6px] text-xl font-black transition-[background-color,border-color,color,transform] duration-300 motion-reduce:transition-none sm:size-16 sm:text-2xl",
                state === "done" &&
                  "border-b-[#46a302] bg-[#58cc02] text-white",
                state === "current" &&
                  "scale-110 border-b-primary-deep bg-primary text-accent-lime",
                state === "locked" &&
                  "border-b-hairline-strong bg-paper text-ink/30"
              )}
            >
              <span
                style={{ transitionDelay: delay }}
                className={cn(
                  "transition-opacity duration-200 motion-reduce:transition-none",
                  state === "done" && "opacity-0"
                )}
              >
                {lesson.order}
              </span>
              <Check
                aria-hidden
                strokeWidth={4}
                style={{ transitionDelay: delay }}
                className={cn(
                  "absolute size-6 transition-[opacity,transform] duration-300 motion-reduce:transition-none",
                  state === "done" ? "scale-100 opacity-100" : "scale-50 opacity-0"
                )}
              />
              {target === "current" && (
                <span
                  style={{ transitionDelay: played ? `${(i + 1) * STEP_MS}ms` : "0ms" }}
                  className={cn(
                    "absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-primary px-2 py-0.5 text-xs font-black lowercase text-accent-lime transition-opacity duration-300 motion-reduce:transition-none",
                    played ? "opacity-100" : "opacity-0"
                  )}
                >
                  you are here
                </span>
              )}
            </span>
            <h3
              className={cn(
                "text-lg font-black lowercase leading-tight transition-colors duration-300 sm:text-xl",
                played && target !== "locked" ? "text-ink" : "text-ink/45"
              )}
              style={{ transitionDelay: delay }}
            >
              {lesson.title.toLowerCase()}
            </h3>
          </li>
        );
      })}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/*  Practice board: a mini trading screen with a real 7-session chart         */
/* -------------------------------------------------------------------------- */

type BoardStock = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sparkline: number[];
};

const DEMO_SYMBOL = "ZENITHBANK";
const LOT = 100;

// Same up / down / flat colours as the in-app chart (components/trading/stock-chart.tsx).
const trendColor = (pct: number) =>
  pct > 0 ? "#00a239" : pct < 0 ? "#b5162a" : "#004a3d";

const CHART_W = 320;
const CHART_H = 120;
const PAD_Y = 12;

function MiniChart({ stock, play }: { stock: BoardStock; play: boolean }) {
  const pts = stock.sparkline;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min;
  const color = trendColor(stock.changePercent);

  const coords = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * CHART_W;
    const y =
      range === 0
        ? CHART_H / 2
        : PAD_Y + (1 - (v - min) / range) * (CHART_H - PAD_Y * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const area = `${line} L${CHART_W} ${CHART_H} L0 ${CHART_H} Z`;
  const [lastX, lastY] = coords[coords.length - 1];
  const gradId = `grad-${stock.symbol}`;

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="h-auto w-full overflow-visible"
      role="img"
      aria-label={`${stock.symbol} closing prices over the last ${pts.length} sessions`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* faint guides */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1="0"
          x2={CHART_W}
          y1={CHART_H * f}
          y2={CHART_H * f}
          stroke="#e5e0da"
          strokeWidth="1"
        />
      ))}
      <path
        d={area}
        fill={`url(#${gradId})`}
        className={cn(
          "transition-opacity delay-300 duration-500 motion-reduce:transition-none",
          play ? "opacity-100" : "opacity-0"
        )}
      />
      {/* pathLength=1 lets the line "draw" itself via dashoffset */}
      <path
        d={line}
        pathLength={1}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 1"
        strokeDashoffset={play ? 0 : 1}
        className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
      />
      <circle
        cx={lastX}
        cy={lastY}
        r="5"
        fill={color}
        stroke="#fefdfc"
        strokeWidth="2.5"
        className={cn(
          "transition-opacity delay-700 duration-200 motion-reduce:transition-none",
          play ? "opacity-100" : "opacity-0"
        )}
      />
    </svg>
  );
}

export function PracticeBoard({
  stocks,
  startingCash,
}: {
  stocks: BoardStock[];
  startingCash: number;
}) {
  const { ref, played } = useStoryTrigger<HTMLDivElement>(0.45);
  const [selected, setSelected] = useState(
    stocks.find((s) => s.symbol === DEMO_SYMBOL)?.symbol ?? stocks[0].symbol
  );
  const [cash, setCash] = useState(startingCash); // animated display value
  const [balance, setBalance] = useState(startingCash); // the real balance
  const [held, setHeld] = useState<Record<string, number>>({});
  const [lastBuy, setLastBuy] = useState<string | null>(null);
  // re-key the chart so it redraws when you switch stocks
  const [drawKey, setDrawKey] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const cashRef = useRef(startingCash);
  const frameRef = useRef(0);

  const stock = stocks.find((s) => s.symbol === selected) ?? stocks[0];
  const cost = stock.price * LOT;
  const canAfford = balance >= cost;

  const animateCash = (to: number) => {
    const from = cashRef.current;
    cashRef.current = to;
    cancelAnimationFrame(frameRef.current);
    if (prefersReducedMotion()) {
      setCash(to);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 600, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCash(from + (to - from) * eased);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  };

  const buy = (s: BoardStock) => {
    const price = s.price * LOT;
    if (cashRef.current < price) return;
    animateCash(cashRef.current - price);
    setBalance(cashRef.current);
    setHeld((h) => ({ ...h, [s.symbol]: (h[s.symbol] ?? 0) + LOT }));
    setLastBuy(`bought ${LOT} ${s.symbol.toLowerCase()}`);
  };

  const pick = (symbol: string) => {
    if (symbol === selected) return;
    setSelected(symbol);
    setDrawn(false);
    setDrawKey((k) => k + 1);
  };

  // draw the chart: once when the board scrolls in, then after every switch
  useEffect(() => {
    if (!played) return;
    const t = window.setTimeout(() => setDrawn(true), 60);
    return () => window.clearTimeout(t);
  }, [played, drawKey]);

  // the one-time demo: the chart draws, then a buy lands on its own
  const demoDone = useRef(false);
  useEffect(() => {
    if (!played || demoDone.current) return;
    demoDone.current = true;
    const demo = stocks.find((s) => s.symbol === DEMO_SYMBOL) ?? stocks[0];
    const t = window.setTimeout(() => buy(demo), prefersReducedMotion() ? 0 : 1400);
    return () => window.clearTimeout(t);
    // buy is stable enough for a one-shot demo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [played, stocks]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const up = stock.changePercent > 0;
  const down = stock.changePercent < 0;
  const owned = held[stock.symbol] ?? 0;

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-[28px] border-2 border-b-[6px] border-hairline-strong bg-paper"
    >
      {/* cash */}
      <div className="flex items-end justify-between gap-3 border-b-2 border-hairline px-5 py-4 sm:px-6">
        <div>
          <p className="text-sm font-bold lowercase text-ink/55">play cash</p>
          <p className="text-3xl font-black tracking-tight tabular-nums text-ink sm:text-4xl">
            {naira(cash)}
          </p>
        </div>
        {/* always rendered so nothing shifts when a trade lands */}
        <span
          key={lastBuy ?? "none"}
          aria-live="polite"
          className={cn(
            "rounded-xl border-2 border-b-4 border-[#46a302] bg-[#d7ffb8] px-3 py-1 text-xs font-black lowercase text-[#3c8a02]",
            lastBuy ? "animate-pop-in" : "invisible"
          )}
        >
          {lastBuy ?? "\u00a0"}
        </span>
      </div>

      {/* chart */}
      <div className="px-5 pt-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xl font-black text-ink">{stock.symbol}</p>
            <p className="truncate text-sm font-semibold lowercase text-ink/55">
              {stock.name.toLowerCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black tabular-nums text-ink">
              {naira(stock.price)}
            </p>
            <p
              className={cn(
                "text-sm font-bold tabular-nums",
                up && "text-success",
                down && "text-destructive",
                !up && !down && "text-ink/45"
              )}
            >
              {up ? "+" : ""}
              {stock.changePercent.toFixed(2)}% today
            </p>
          </div>
        </div>

        <div className="mt-3">
          <MiniChart key={drawKey} stock={stock} play={drawn} />
          <p className="mt-1 text-xs font-semibold lowercase text-ink/40">
            last {stock.sparkline.length} sessions
          </p>
        </div>
      </div>

      {/* pick a stock */}
      <div
        className="flex flex-wrap gap-2 px-5 pt-5 sm:px-6"
        role="group"
        aria-label="choose a stock"
      >
        {stocks.map((s) => (
          <button
            key={s.symbol}
            type="button"
            aria-pressed={s.symbol === selected}
            onClick={() => pick(s.symbol)}
            className={cn(
              "rounded-xl border-2 border-b-4 px-3 py-1.5 text-xs font-black transition-colors duration-150 active:translate-y-0.5 active:border-b-2",
              s.symbol === selected
                ? "border-[#46a302] bg-[#d7ffb8] text-[#3c8a02]"
                : "border-hairline-strong bg-paper text-ink/70 hover:bg-cloud"
            )}
          >
            {s.symbol}
          </button>
        ))}
      </div>

      {/* buy */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t-2 border-hairline bg-canvas px-5 py-4 sm:px-6">
        <p className="text-sm font-bold lowercase text-ink/60">
          {owned > 0 ? `you own ${owned} shares` : `${LOT} shares for ${naira(cost)}`}
        </p>
        <button
          type="button"
          onClick={() => buy(stock)}
          disabled={!canAfford}
          className="min-h-11 rounded-xl border-b-4 border-b-[#46a302] bg-[#58cc02] px-5 text-sm font-extrabold uppercase tracking-wide text-white transition-[filter,transform] duration-100 hover:brightness-110 active:translate-y-0.5 active:border-b-2 disabled:opacity-50"
        >
          buy {LOT}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ask Kobo: a pinned section whose conversation is played by your scroll    */
/* -------------------------------------------------------------------------- */

const QUESTION = "what's the difference between a market order and a limit order?";
const ANSWER =
  "a market order buys right away at the best price available. a limit order only buys at your price or better. lesson 4 covers both.";

// Scroll progress (0–1) through the pinned section → what's on screen.
const ASK_AT = 0.04; // question appears
const TYPING_AT = 0.16; // kobo starts "typing"
const ANSWER_FROM = 0.3; // answer starts writing itself out…
const ANSWER_TO = 0.8; // …and is complete here; the rest is reading time

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Once the chat is on screen it also plays by itself, so a visitor who stops
// scrolling to watch still sees Kobo answer (≈4.5s from question to full answer).
const AUTOPLAY_RATE = ANSWER_TO / 4500; // progress units per ms

export function AskKoboStory({
  heading,
  body,
  headingClass,
  bodyClass,
}: {
  heading: string;
  body: string;
  headingClass: string;
  bodyClass: string;
}) {
  const outerRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0); // from scroll position
  const [auto, setAuto] = useState(0); // from the clock, once started
  const autoRef = useRef(0);
  const [reduced, setReduced] = useState(false);
  const started = progress >= ASK_AT;

  // autoplay: never rewinds, and scrolling faster simply overtakes it
  useEffect(() => {
    if (!started || reduced) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      autoRef.current = Math.min(1, autoRef.current + dt * AUTOPLAY_RATE);
      setAuto(autoRef.current);
      if (autoRef.current < 1) raf = requestAnimationFrame(tick);
    };
    if (autoRef.current < 1) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, reduced]);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    if (prefersReducedMotion()) {
      const t = window.setTimeout(() => setReduced(true), 0);
      return () => window.clearTimeout(t);
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = outer.getBoundingClientRect();
      const travel = outer.offsetHeight - window.innerHeight;
      setProgress(travel > 0 ? clamp01(-rect.top / travel) : 1);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // whichever is further along wins: your scroll or the clock
  const p = reduced ? 1 : Math.max(progress, auto);
  const asked = p >= ASK_AT;
  const typing = p >= TYPING_AT && p < ANSWER_FROM;
  const chars = Math.round(
    ANSWER.length * clamp01((p - ANSWER_FROM) / (ANSWER_TO - ANSWER_FROM))
  );
  const writing = chars > 0 && chars < ANSWER.length;
  const answered = chars >= ANSWER.length;

  return (
    <section
      id="kobo"
      ref={outerRef}
      // tall outer + sticky inner = pinned while your scroll plays the chat
      className={cn("scroll-mt-0 bg-canvas", reduced ? "py-20 sm:py-28" : "h-[200vh]")}
    >
      <div
        className={cn(
          "flex items-center",
          !reduced && "sticky top-0 h-[100svh]"
        )}
      >
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8">
          <div>
            <h2 className={headingClass}>{heading}</h2>
            <p className={bodyClass}>{body}</p>
          </div>

          <div className="space-y-4">
            <div
              className={cn(
                "ml-auto w-fit max-w-[85%] rounded-3xl rounded-br-md bg-primary px-5 py-3.5 text-base font-bold lowercase leading-snug text-on-primary transition-[opacity,transform] duration-300 motion-reduce:transition-none",
                asked ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              )}
            >
              {QUESTION}
            </div>

            <div className="flex items-end gap-3">
              <KoboMark
                variant="head"
                mood={typing || writing ? "thinking" : "happy"}
                className={cn(
                  "size-12 shrink-0 transition-opacity duration-300",
                  asked ? "opacity-100" : "opacity-0"
                )}
              />
              {/* the full answer is laid out invisibly first, so the bubble
                  never grows while the text writes itself out */}
              <div className="grid max-w-[85%]">
                <div
                  className={cn(
                    "rounded-3xl rounded-bl-md border-2 border-b-4 border-hairline-strong bg-paper px-5 py-3.5 text-base font-semibold lowercase leading-relaxed text-ink transition-opacity duration-200 [grid-area:1/1]",
                    chars > 0 ? "opacity-100" : "opacity-0"
                  )}
                >
                  <span className="sr-only">{ANSWER}</span>
                  <span aria-hidden className="grid">
                    <span className="invisible [grid-area:1/1]">{ANSWER}</span>
                    <span className="[grid-area:1/1]">
                      {ANSWER.slice(0, chars)}
                      {writing && (
                        <span className="ml-0.5 inline-block h-[1.1em] w-0.5 translate-y-[0.2em] animate-pulse bg-ink/60" />
                      )}
                    </span>
                  </span>
                </div>
                <div
                  aria-hidden
                  className={cn(
                    "flex items-end transition-opacity duration-200 [grid-area:1/1]",
                    typing ? "opacity-100" : "opacity-0"
                  )}
                >
                  <span className="inline-flex gap-1.5 rounded-3xl rounded-bl-md border-2 border-b-4 border-hairline-strong bg-paper px-5 py-4">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="size-2 animate-bounce-soft rounded-full bg-ink/40"
                        style={{ animationDelay: `${d * 150}ms`, animationDuration: "0.9s" }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            </div>

            <p
              className={cn(
                "pl-[3.75rem] text-xs font-bold lowercase text-ink/40 transition-opacity duration-300",
                answered && !reduced ? "opacity-100" : "opacity-0"
              )}
            >
              ask kobo anything inside the app.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
