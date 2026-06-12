"use client";

import { useState } from "react";
import { BookOpen, LineChart, Sparkles } from "lucide-react";

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

const tourSteps = [
  {
    icon: BookOpen,
    title: "follow the path",
    body: "unlock lesson bubbles one at a time.",
  },
  {
    icon: Sparkles,
    title: "pass quick quizzes",
    body: "tap answers, get instant feedback from kobo.",
  },
  {
    icon: LineChart,
    title: "paper trade ngx stocks",
    body: "buy & sell nigerian tickers with ₦ play cash — zero risk.",
  },
];

export function OnboardingFlow({ onDone }: { onDone: () => void }) {
  const completeOnboarding = useProgressStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-2xl border-2 border-b-0 border-hairline-strong bg-canvas shadow-card sm:max-h-[85dvh] sm:rounded-xl sm:border-b-4"
        role="dialog"
        aria-modal
        aria-labelledby="onboarding-title"
      >
        <div className="shrink-0 border-b border-hairline px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-hairline-strong sm:hidden" />
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-[#58cc02]" : "bg-hairline-strong"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <KoboMascot mood={moods[step]} size="md" speech={speeches[step]} />

            {step === 0 && (
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

            {step === 1 && (
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

            {step === 2 && (
              <div className="mt-4 w-full space-y-3 sm:mt-6">
                {tourSteps.map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-xl border-2 border-b-4 border-hairline-strong bg-paper p-3 text-left"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border-b-4 border-b-primary-deep bg-primary">
                      <Icon className="size-5 text-on-primary" />
                    </span>
                    <div>
                      <p className="font-extrabold lowercase text-ink">{title}</p>
                      <p className="text-sm lowercase text-ink-soft">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="mt-4 space-y-3 sm:mt-6">
                <AppStatPills streak={0} xp={20} className="justify-center" />
                <p className="text-sm lowercase text-ink-soft">
                  finish onboarding to earn{" "}
                  <span className="font-extrabold text-[#58cc02]">+20 xp</span>.
                  your first lesson is waiting!
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="shrink-0 border-t border-hairline bg-canvas px-4 py-4 sm:px-6"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {step < 3 ? (
            <DuoButton
              fullWidth
              size="lg"
              variant="success"
              disabled={step === 1 && !goal}
              onClick={() => setStep((s) => s + 1)}
            >
              continue
            </DuoButton>
          ) : (
            <DuoButton fullWidth size="lg" variant="success" onClick={handleFinish}>
              start learning
            </DuoButton>
          )}
          {step > 0 && step < 3 && (
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
