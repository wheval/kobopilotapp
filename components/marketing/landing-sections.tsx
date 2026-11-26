import { Flame } from "lucide-react";

import { StartBar, MarketClock } from "@/components/marketing/fomo";
import { HeroQuiz } from "@/components/marketing/hero-quiz";
import {
  AskKoboStory,
  PathStory,
  PracticeBoard,
} from "@/components/marketing/story-sections";
import { KoboMark } from "@/components/mascot/kobo-mark";
import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { DuoButton } from "@/components/ui/duo-button";
import { lessons } from "@/lib/lessons";
import { NGX_SEED_STOCKS } from "@/lib/market/ngx-seed";
import { PAPER_STARTING_CASH } from "@/lib/paper-trading";
import { cn } from "@/lib/utils";

/** Date of the NGX closing snapshot in lib/market/ngx-seed.ts. */
const SEED_DATE = "7 aug 2026";

const naira = (n: number, decimals = 2) =>
  `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;

const firstLesson = lessons[0];

const sectionHeading =
  "text-[clamp(2.25rem,4.6vw,3.5rem)] font-black lowercase leading-[0.98] tracking-[-0.03em] text-primary";
const sectionBody =
  "mt-5 max-w-[36ch] text-lg font-semibold lowercase leading-relaxed text-ink/65";

/* -------------------------------------------------------------------------- */
/*  Hero: Duolingo-style — light, mascot-led, two buttons, subject strip      */
/* -------------------------------------------------------------------------- */

function HeroPhone() {
  return (
    <div className="relative mx-auto w-[min(40vw,170px)] sm:w-[240px] lg:w-[280px]">
      {/* the phone pops in; the tilt lives on the inner box so the animation can't undo it */}
      <div className="animate-pop-in">
        <div className="flex aspect-[9/15] -rotate-[8deg] items-center justify-center rounded-[44px] border-[6px] border-[#58cc02] bg-paper shadow-[14px_14px_0_#46a302] ring-[6px] ring-inset ring-[#d7ffb8]">
          <div className="flex w-full flex-col items-center px-3">
            <KoboMark mood="happy" className="w-[70%] animate-float drop-shadow-md" />
            <p className="-mt-1 text-[0.7rem] font-black lowercase text-ink/45 sm:text-xs">
              play cash
            </p>
            <p className="text-[clamp(1.05rem,4.6vw,1.55rem)] font-black tabular-nums tracking-tight text-ink">
              {naira(PAPER_STARTING_CASH, 0)}
            </p>
          </div>
        </div>
      </div>

      <span
        style={{ animationDelay: "350ms" }}
        className="animate-pop-in absolute -right-8 top-8 rotate-[8deg] rounded-2xl border-b-4 border-[#c9e040] bg-accent-lime px-3.5 py-1.5 text-base font-black text-ink shadow-soft-lift sm:-right-12"
      >
        +10 xp
      </span>
      <span
        style={{ animationDelay: "550ms" }}
        className="animate-pop-in absolute -left-10 bottom-14 hidden -rotate-[6deg] sm:inline-flex items-center gap-1.5 rounded-2xl border-2 border-b-4 border-hairline-strong bg-paper px-3.5 py-1.5 text-base font-black lowercase text-ink shadow-soft-lift sm:-left-14"
      >
        <Flame className="size-5 fill-orange-400 text-orange-500" />3 day streak
      </span>
    </div>
  );
}

function TickerItems({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {NGX_SEED_STOCKS.map((s) => {
        const up = s.changePercent > 0;
        const down = s.changePercent < 0;
        return (
          <li
            key={s.symbol}
            className="flex items-baseline gap-2.5 whitespace-nowrap px-7 text-sm"
          >
            <span className="font-black tracking-wide text-ink/70">{s.symbol}</span>
            <span className="font-semibold tabular-nums text-ink/50">
              {naira(s.price)}
            </span>
            <span
              className={cn(
                "font-bold tabular-nums",
                up && "text-success",
                down && "text-destructive",
                !up && !down && "text-ink/35"
              )}
            >
              {up ? "+" : ""}
              {s.changePercent.toFixed(2)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function TickerTape() {
  return (
    <div
      role="region"
      aria-label={`ngx closing prices, ${SEED_DATE}`}
      className="flex items-center overflow-clip border-y-2 border-hairline bg-paper py-4"
    >
      <p className="relative z-10 shrink-0 bg-paper pl-4 pr-3 text-xs font-bold lowercase text-ink/40 sm:pl-6 lg:pl-8">
        ngx, {SEED_DATE}
      </p>
      <div className="ticker-mask flex min-w-0 flex-1 overflow-clip">
        <div className="animate-ticker flex w-max">
          <TickerItems />
          <TickerItems hidden />
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="hero" className="flex min-h-[calc(100svh-4rem)] flex-col bg-paper">
      <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-7 px-4 py-7 sm:gap-10 sm:px-6 sm:py-14 md:grid-cols-2 md:gap-10 lg:px-8">
        <HeroPhone />

        <div className="flex flex-col items-center text-center">
          <MarketClock className="mb-4 sm:mb-6" />
          <h1 className="max-w-[14ch] text-[clamp(2.4rem,5.2vw,3.6rem)] font-black lowercase leading-[1.02] tracking-[-0.03em] text-ink">
            learn the ngx market by playing it.
          </h1>
          <p className="mt-4 max-w-[30ch] text-lg font-semibold lowercase leading-relaxed text-ink/60">
            bite-sized lessons, real ngx prices, and{" "}
            {naira(PAPER_STARTING_CASH, 0)} of play money to practise with.
          </p>
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
            <DuoButton href="/dashboard" size="lg" variant="success" fullWidth>
              start learning
            </DuoButton>
            <DuoButton
              href="#try"
              size="lg"
              variant="ghost"
              fullWidth
              className="border-2 border-hairline-strong text-primary"
            >
              try a quick quiz
            </DuoButton>
          </div>
          <p className="mt-4 text-sm font-bold lowercase text-ink/45">
            play money. no sign-up. no card.
          </p>
        </div>
      </div>

      <TickerTape />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Try it: the playable lesson 1 quiz                                         */
/* -------------------------------------------------------------------------- */

export function TryQuiz() {
  return (
    <section className="bg-canvas py-20 sm:py-28">
      {/* the anchor is the quiz layout itself (not the padded section), so
          "try a quick quiz" lands with the whole quiz on screen */}
      <div
        id="try"
        className="mx-auto grid max-w-5xl scroll-mt-20 items-center gap-12 px-4 sm:px-6 md:grid-cols-[1fr_1.05fr] lg:gap-20 lg:px-8"
      >
        <div>
          <h2 className={sectionHeading}>try lesson 1 right now.</h2>
          <p className={sectionBody}>three questions. no sign-up.</p>
        </div>
        <div className="mx-auto w-full max-w-md">
          <HeroQuiz
            questions={firstLesson.quiz.slice(0, 3)}
            lessonHref={`/learn/${firstLesson.id}`}
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  1. Learn: the path                                                         */
/* -------------------------------------------------------------------------- */

export function LessonPath() {
  return (
    <section id="path" className="scroll-mt-20 bg-canvas py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className={sectionHeading}>
            {lessons.length} lessons. pass one, unlock the next.
          </h2>
          <p className={sectionBody}>
            from what a stock is to owning real ngx shares.
          </p>
          <div className="mt-8">
            <DuoButton href="/learn" variant="primary">
              open the path
            </DuoButton>
          </div>
        </div>

        <div className="pt-8">
          <PathStory
            lessons={lessons.map(({ id, order, title }) => ({ id, order, title }))}
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  2. Practise: the board                                                     */
/* -------------------------------------------------------------------------- */

export function Practice() {
  return (
    <section id="practice" className="scroll-mt-20 bg-paper py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20 lg:px-8">
        <div className="order-2 min-w-0 lg:order-1">
          <PracticeBoard
            stocks={NGX_SEED_STOCKS.map(
              ({ symbol, name, price, changePercent, sparkline }) => ({
                symbol,
                name,
                price,
                changePercent,
                sparkline,
              })
            )}
            startingCash={PAPER_STARTING_CASH}
          />
        </div>

        <div className="order-1 lg:order-2">
          <h2 className={sectionHeading}>then trade the real board.</h2>
          <p className={sectionBody}>
            eight ngx companies, {naira(PAPER_STARTING_CASH, 0)} of play money,
            not a single kobo at risk.
          </p>
          <div className="mt-8">
            <DuoButton href="/practice" variant="primary">
              try paper trading
            </DuoButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  3. Ask: Kobo                                                               */
/* -------------------------------------------------------------------------- */

export function AskKobo() {
  return (
    <AskKoboStory
      heading="stuck? ask kobo."
      body="your coach knows your lessons and your portfolio."
      headingClass={sectionHeading}
      bodyClass={sectionBody}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Final CTA                                                                  */
/* -------------------------------------------------------------------------- */

export function FinalCta() {
  return (
    <section id="final-cta" className="border-t-2 border-hairline bg-paper py-20 sm:py-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
        <KoboMascot mood="celebrate" size="xl" speech="see you in lesson 1!" />
        <h2 className="mt-8 max-w-[16ch] text-[clamp(2.4rem,5.2vw,3.6rem)] font-black lowercase leading-[1.02] tracking-[-0.03em] text-ink">
          learn the ngx, one lesson at a time.
        </h2>
        <MarketClock className="mt-6" />
        <div className="mt-8 w-full max-w-xs">
          <DuoButton href="/dashboard" size="lg" variant="success" fullWidth>
            start learning
          </DuoButton>
        </div>
      </div>
      <StartBar />
    </section>
  );
}
