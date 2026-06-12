"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { DuoButton } from "@/components/ui/duo-button";
import { useProgressStore } from "@/lib/store/progress-store";

type TourPlacement = "above" | "below" | "auto";

const tourSteps: {
  target: string;
  title: string;
  body: string;
  speech: string;
  placement: TourPlacement;
}[] = [
  {
    target: '[data-tour="stats"]',
    title: "streak & xp",
    body: "complete lessons daily to grow your streak and earn xp.",
    speech: "keep that streak hot!",
    placement: "below",
  },
  {
    target: '[data-tour="continue"]',
    title: "continue learning",
    body: "your next ngx lesson is one tap away from here.",
    speech: "lesson bubbles unlock one at a time!",
    placement: "above",
  },
  {
    target: '[data-tour="nav-learn-tab"], [data-tour="nav-learn"]',
    title: "lesson path",
    body: "see every lesson on the map — quizzes included.",
    speech: "the full path lives under learn.",
    placement: "above",
  },
  {
    target: '[data-tour="nav-practice-tab"], [data-tour="nav-practice"]',
    title: "paper trade ngx",
    body: "practice buying dangcem, gtbco & more with ₦ play money.",
    speech: "zero risk — real nigerian tickers!",
    placement: "above",
  },
];

const PAD = 10;
const GAP = 20;
const TOOLTIP_ESTIMATE = 320;

function isElementVisible(node: Element): boolean {
  if (!(node instanceof HTMLElement)) return false;

  const style = window.getComputedStyle(node);
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    style.opacity === "0"
  ) {
    return false;
  }

  if (node.closest('[aria-hidden="true"]')) return false;

  const rect = node.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return rect.right > 0 && rect.left < vw && rect.bottom > 0 && rect.top < vh;
}

function getVisibleRect(selector: string): DOMRect | null {
  const nodes = document.querySelectorAll(selector);
  for (const node of nodes) {
    if (!isElementVisible(node)) continue;
    return node.getBoundingClientRect();
  }
  return null;
}

function computeHighlight(rect: DOMRect) {
  const top = Math.max(8, rect.top - PAD);
  const left = Math.max(8, rect.left - PAD);
  const right = Math.min(window.innerWidth - 8, rect.right + PAD);
  const bottom = Math.min(window.innerHeight - 8, rect.bottom + PAD);
  return {
    top,
    left,
    width: right - left,
    height: bottom - top,
    bottom,
    right,
  };
}

function computeTooltipTop(
  highlight: ReturnType<typeof computeHighlight>,
  placement: TourPlacement,
  tooltipHeight: number
) {
  const vh = window.innerHeight;
  const spaceBelow = vh - highlight.bottom - GAP;
  const spaceAbove = highlight.top - GAP;

  if (placement === "below") {
    return Math.min(highlight.bottom + GAP, vh - tooltipHeight - 8);
  }

  if (placement === "above") {
    return Math.max(8, highlight.top - GAP - tooltipHeight);
  }

  if (spaceBelow >= tooltipHeight) return highlight.bottom + GAP;
  if (spaceAbove >= tooltipHeight) return highlight.top - GAP - tooltipHeight;
  return spaceBelow >= spaceAbove
    ? highlight.bottom + GAP
    : Math.max(8, highlight.top - GAP - tooltipHeight);
}

function rectsOverlap(
  a: { top: number; bottom: number },
  b: { top: number; height: number }
) {
  return b.top < a.bottom && b.top + b.height > a.top;
}

export function AppTour() {
  const completeAppTour = useProgressStore((s) => s.completeAppTour);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState(TOOLTIP_ESTIMATE);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const current = tourSteps[step];

  const measureTarget = useCallback(() => {
    const visible = getVisibleRect(current.target);
    if (visible) {
      const nodes = document.querySelectorAll(current.target);
      for (const node of nodes) {
        if (!isElementVisible(node)) continue;
        node.scrollIntoView({ block: "nearest", behavior: "smooth" });
        break;
      }
    }
    setRect(visible);
  }, [current.target]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(measureTarget);
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [measureTarget, step]);

  useEffect(() => {
    const el = tooltipRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setTooltipHeight(el.offsetHeight);
    });
    observer.observe(el);
    setTooltipHeight(el.offsetHeight);
    return () => observer.disconnect();
  }, [step]);

  const layout = useMemo(() => {
    if (!rect) return null;

    const highlight = computeHighlight(rect);
    let tooltipTop = computeTooltipTop(
      highlight,
      current.placement,
      tooltipHeight
    );

    if (
      rectsOverlap(
        { top: highlight.top, bottom: highlight.bottom },
        { top: tooltipTop, height: tooltipHeight }
      )
    ) {
      tooltipTop =
        highlight.top > window.innerHeight / 2
          ? Math.max(8, highlight.top - GAP - tooltipHeight)
          : highlight.bottom + GAP;
    }

    return { highlight, tooltipTop };
  }, [rect, current.placement, tooltipHeight]);

  const finish = () => {
    completeAppTour();
  };

  const next = () => {
    if (step >= tourSteps.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div
      className="fixed inset-0 z-70 overflow-hidden"
      role="dialog"
      aria-modal
      aria-label="App tour"
    >
      {layout && (
        <>
          <div
            className="absolute inset-x-0 top-0 bg-ink/55"
            style={{ height: layout.highlight.top }}
            onClick={finish}
            aria-hidden
          />
          <div
            className="absolute bg-ink/55"
            style={{
              top: layout.highlight.top,
              left: 0,
              width: layout.highlight.left,
              height: layout.highlight.height,
            }}
            onClick={finish}
            aria-hidden
          />
          <div
            className="absolute bg-ink/55"
            style={{
              top: layout.highlight.top,
              left: layout.highlight.right,
              right: 0,
              height: layout.highlight.height,
            }}
            onClick={finish}
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bg-ink/55"
            style={{ top: layout.highlight.bottom, bottom: 0 }}
            onClick={finish}
            aria-hidden
          />

          <div
            className="pointer-events-none absolute z-71 rounded-xl ring-4 ring-[#58cc02] ring-offset-2 ring-offset-transparent transition-all duration-200"
            style={{
              top: layout.highlight.top,
              left: layout.highlight.left,
              width: layout.highlight.width,
              height: layout.highlight.height,
            }}
          />
        </>
      )}

      {!layout && (
        <div
          className="absolute inset-0 bg-ink/55"
          onClick={finish}
          aria-hidden
        />
      )}

      <div
        ref={tooltipRef}
        className="absolute inset-x-4 z-72 mx-auto max-w-md overflow-hidden rounded-2xl border-2 border-b-4 border-hairline-strong bg-canvas p-4 shadow-card transition-[top] duration-200 sm:inset-x-auto sm:left-1/2 sm:w-[min(420px,calc(100vw-2rem))] sm:-translate-x-1/2"
        style={{
          top: layout?.tooltipTop ?? "auto",
          bottom: layout ? undefined : "calc(var(--app-tabbar-h, 64px) + env(safe-area-inset-bottom, 0px) + 0.75rem)",
          maxHeight: "calc(100dvh - env(safe-area-inset-top, 0px) - 2rem)",
        }}
      >
        <div className="mb-3 flex justify-center">
          <KoboMascot mood="happy" size="sm" speech={current.speech} />
        </div>
        <p className="text-center text-lg font-extrabold lowercase text-ink">
          {current.title}
        </p>
        <p className="mt-1 text-center text-sm lowercase text-ink-soft">
          {current.body}
        </p>
        <div className="mt-4 flex gap-1.5">
          {tourSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-[#58cc02]" : "bg-hairline-strong"
              }`}
            />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <DuoButton variant="ghost" className="min-w-0 flex-1" onClick={finish}>
            skip
          </DuoButton>
          <DuoButton variant="success" className="min-w-0 flex-2" onClick={next}>
            {step >= tourSteps.length - 1 ? "got it!" : "next"}
          </DuoButton>
        </div>
      </div>
    </div>
  );
}
