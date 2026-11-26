"use client";

import { useState } from "react";

import { AppStatPills } from "@/components/app/app-ui";
import { KoboMascot, type MascotMood } from "@/components/mascot/kobo-mascot";
import {
  DuoButton,
  DuoSelectButton,
  type DuoSelectState,
} from "@/components/ui/duo-button";
import {
  type LearningGoal,
  useProgressStore,
} from "@/lib/store/progress-store";
import { lessons } from "@/lib/lessons";
import { cn } from "@/lib/utils";

const goalOptions: { id: LearningGoal; label: string; hint: string }[] = [
  {
    id: "learn",
    label: "learn how ngx trading works",
    hint: "start with bite-sized lessons",
  },
  {
    id: "practice",
    label: "practice with ₦ paper money",
    hint: "trade dangcem, gtbco & more",
  },
  {
    id: "both",
    label: "both — lessons & ngx practice",
    hint: "the full kobopilot path",
  },
];


// Screens shown, in order. The old "how it works" screen (2) repeated the landing
// page, so it's skipped: welcome → pick a goal → you're set.
const STEP_ORDER = [0, 1, 3] as const;

export function OnboardingFlow({ onDone }: { onDone: () => void }) {
  const completeOnboarding = useProgressStore((s) => s.completeOnboarding);
  const onboardingAlreadyComplete = useProgressStore(
    (s) => s.onboardingComplete
  );
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const [step, setStep] = useState(0);
  const view = STEP_ORDER[step];
  const lastStep = STEP_ORDER.length - 1;
  const [goal, setGoal] = useState<LearningGoal | null>(null);

  const moods: MascotMood[] = ["celebrate", "thinking", "happy", "celebrate"];
  const speeches = [
    "hi! i'm kobo — your ngx trading coach!",
    "what do you want to focus on first?",
    "here's how kobopilot works on the nigerian market…",
    "you're all set. let's earn some xp!",
  ];

  const handleFinish = () => {
    if (!goal) return;
    completeOnboarding(goal);
    onDone();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 sm:items-center"
      style={{
        paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        className="flex max-h-[min(92dvh,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border-2 border-b-4 border-hairline-strong bg-canvas shadow-card sm:max-h-[85dvh]"
        role="dialog"
        aria-modal
        aria-labelledby="onboarding-title"
      >
        <div className="shrink-0 border-b border-hairline px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-hairline-strong sm:hidden" />
          <div className="flex gap-1.5">
            {STEP_ORDER.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all duration-300",
                  i <= step ? "bg-[#58cc02] scale-y-110" : "bg-hairline-strong"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <div key={step} className="animate-fade-up flex flex-col items-center text-center">
            <KoboMascot mood={moods[view]} size="md" speech={speeches[view]} />

            {view === 0 && (
              <div className="mt-4 space-y-2 sm:mt-6">
                <h2
                  id="onboarding-title"
                  className="text-xl font-extrabold lowercase text-ink sm:text-2xl"
                >
                  welcome to kobopilot
                </h2>
                <p className="text-sm lowercase text-ink-soft">
                  learn nigerian stock trading like a game — ngx lessons, quizzes,
                  and ₦ paper trades.
                </p>
              </div>
            )}

            {view === 1 && (
              <div className="mt-4 w-full space-y-3 text-left sm:mt-6">
                <h2 className="text-center text-lg font-extrabold lowercase text-ink sm:text-xl">
                  pick your goal
                </h2>
                {goalOptions.map((option, index) => {
                  const selected = goal === option.id;
                  const state: DuoSelectState = selected ? "selected" : "idle";
                  return (
                    <DuoSelectButton
                      key={option.id}
                      index={index}
                      state={state}
                      onSelect={() => setGoal(option.id)}
                      className="!min-h-[52px] !py-3"
                    >
                      <span className="block font-extrabold lowercase">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs font-semibold text-ink-soft">
                        {option.hint}
                      </span>
                    </DuoSelectButton>
                  );
                })}
              </div>
            )}

            {view === 3 && (
              <div className="mt-4 space-y-3 sm:mt-6">
                <AppStatPills
                  streak={onboardingAlreadyComplete ? streak : 0}
                  xp={onboardingAlreadyComplete ? xp : 20}
                  className="justify-center"
                />
                <p className="text-sm lowercase text-ink-soft">
                  {onboardingAlreadyComplete ? (
                    <>welcome back — pick up where you left off!</>
                  ) : (
                    <>
                      finish onboarding to earn{" "}
                      <span className="font-extrabold text-[#58cc02]">+20 xp</span>.
                      your first lesson is waiting!
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="shrink-0 border-t border-hairline bg-canvas px-4 py-4 sm:px-6"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {step < lastStep ? (
            <DuoButton
              fullWidth
              size="lg"
              variant="success"
              disabled={view === 1 && !goal}
              onClick={() => setStep((s) => s + 1)}
            >
              continue
            </DuoButton>
          ) : (
            <DuoButton fullWidth size="lg" variant="success" onClick={handleFinish}>
              {onboardingAlreadyComplete ? "done" : "let's go"}
            </DuoButton>
          )}
          {step > 0 && step < lastStep && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="mt-3 min-h-11 w-full text-sm font-bold lowercase text-ink-soft underline touch-manipulation"
            >
              back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function useFirstLessonHref(goal: LearningGoal | null) {
  const firstLesson = lessons[0];
  if (goal === "practice") return "/practice";
  return `/learn/${firstLesson.id}`;
}
