"use client";

import { useCallback, useEffect, useState } from "react";

import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { DuoButton } from "@/components/ui/duo-button";
import { useProgressStore } from "@/lib/store/progress-store";

const tourSteps = [
  {
    target: '[data-tour="stats"]',
    title: "streak & xp",
    body: "complete lessons daily to grow your streak and earn xp.",
    speech: "keep that streak hot!",
  },
  {
    target: '[data-tour="continue"]',
    title: "continue learning",
    body: "your next ngx lesson is one tap away from here.",
    speech: "lesson bubbles unlock one at a time!",
  },
  {
    target: '[data-tour="nav-learn"]',
    title: "lesson path",
    body: "see every lesson on the map — quizzes included.",
    speech: "the full path lives under learn.",
  },
  {
    target: '[data-tour="nav-practice"]',
    title: "paper trade ngx",
    body: "practice buying dangcem, gtbco & more with ₦ play money.",
    speech: "zero risk — real nigerian tickers!",
  },
];

export function AppTour() {
  const completeAppTour = useProgressStore((s) => s.completeAppTour);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const current = tourSteps[step];

  const measureTarget = useCallback(() => {
    const el = document.querySelector(current.target);
    if (!el) {
      setRect(null);
      return;
    }
    setRect(el.getBoundingClientRect());
  }, [current.target]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      measureTarget();
    });
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [measureTarget, step]);

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

  const padding = 8;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal aria-label="App tour">
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-[1px]" onClick={finish} />

      {rect && (
        <div
          className="pointer-events-none absolute rounded-xl ring-4 ring-[#58cc02] ring-offset-2 ring-offset-transparent transition-all duration-200"
          style={{
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          }}
        />
      )}

      <div
        className="fixed inset-x-4 z-[71] mx-auto max-w-md rounded-2xl border-2 border-b-4 border-hairline-strong bg-canvas p-4 shadow-card sm:inset-x-auto sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2"
        style={{
          bottom: "calc(var(--app-tabbar-h, 64px) + env(safe-area-inset-bottom, 0px) + 1rem)",
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
          <DuoButton variant="ghost" fullWidth onClick={finish}>
            skip
          </DuoButton>
          <DuoButton variant="success" fullWidth onClick={next}>
            {step >= tourSteps.length - 1 ? "got it!" : "next"}
          </DuoButton>
        </div>
      </div>
    </div>
  );
}
