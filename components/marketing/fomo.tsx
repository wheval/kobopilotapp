"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { KoboMark } from "@/components/mascot/kobo-mark";
import { DuoButton } from "@/components/ui/duo-button";
import { getMarketSession, msUntilClose } from "@/lib/market/market-hours";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  A clock that ticks every 30s, and renders nothing on the server           */
/*  (so the countdown never causes a hydration mismatch).                      */
/* -------------------------------------------------------------------------- */

const TICK_MS = 30_000;
const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, TICK_MS);
  return () => window.clearInterval(id);
};
const getTick = () => Math.floor(Date.now() / TICK_MS);
const getServerTick = () => 0;

function formatSpan(ms: number) {
  const mins = Math.max(1, Math.round(ms / 60_000));
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function useMarketStatus() {
  const tick = useSyncExternalStore(subscribe, getTick, getServerTick);
  if (tick === 0) return null;
  const now = new Date();
  const session = getMarketSession(now);
  return session.isOpen
    ? { open: true, text: `ngx is live. closes in ${formatSpan(msUntilClose(now))}` }
    : { open: false, text: `ngx opens in ${formatSpan(session.msUntilOpen)}` };
}

/** Live NGX session pill: real trading hours, 09:00–16:00 WAT on weekdays. */
export function MarketClock({ className }: { className?: string }) {
  const status = useMarketStatus();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 border-b-4 border-hairline-strong bg-paper px-3.5 py-1.5 text-sm font-black lowercase text-ink",
        className
      )}
    >
      <span className="relative flex size-2.5">
        {status?.open && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#58cc02] opacity-60 motion-reduce:animate-none" />
        )}
        <span
          className={cn(
            "relative inline-flex size-2.5 rounded-full",
            status?.open ? "bg-[#58cc02]" : "bg-ink/30"
          )}
        />
      </span>
      {/* placeholder keeps the pill's width stable before the clock mounts */}
      <span className={cn(!status && "invisible")}>
        {status?.text ?? "ngx is live. closes in 0h 00m"}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Start bar: slides up once the hero is gone, hides at the final CTA        */
/* -------------------------------------------------------------------------- */

export function StartBar() {
  const [show, setShow] = useState(false);
  const status = useMarketStatus();

  useEffect(() => {
    const hero = document.getElementById("hero");
    const end = [document.getElementById("final-cta"), document.querySelector("footer")]
      .filter((el): el is HTMLElement => !!el);
    if (!hero) return;

    const visible = new Map<Element, boolean>();
    const update = () => {
      const heroOn = visible.get(hero) ?? true;
      const endOn = end.some((el) => visible.get(el));
      setShow(!heroOn && !endOn);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target, e.isIntersecting));
        update();
      },
      { threshold: 0 }
    );
    [hero, ...end].forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!show}
      inert={!show}
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 mx-auto max-w-xl transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none sm:bottom-5",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[130%] opacity-0"
      )}
    >
      <div className="flex items-center gap-3 rounded-2xl border-2 border-b-4 border-hairline-strong bg-paper/95 p-2.5 pl-3 shadow-card backdrop-blur">
        <KoboMark variant="head" mood="happy" className="size-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black lowercase text-ink sm:text-base">
            lesson 1: what is a stock?
          </p>
          <p className="flex items-center gap-1.5 truncate text-xs font-bold lowercase text-ink/55">
            <span
              className={cn(
                "inline-block size-2 shrink-0 rounded-full",
                status?.open ? "bg-[#58cc02]" : "bg-ink/30"
              )}
            />
            {status?.text ?? " "}
          </p>
        </div>
        <DuoButton href="/dashboard" variant="success" size="sm" className="shrink-0">
          start
        </DuoButton>
      </div>
    </div>
  );
}
