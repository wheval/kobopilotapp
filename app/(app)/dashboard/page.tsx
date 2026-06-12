"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { BookOpen, LineChart, TrendingUp } from "lucide-react";

import {
  AppStatPills,
  DuoTile,
  LessonProgressBar,
} from "@/components/app/app-ui";
import {
  OnboardingFlow,
} from "@/components/app/onboarding-flow";
import { AppTour } from "@/components/app/app-tour";
import { SocialShareSection } from "@/components/app/social-share";
import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { DuoButton } from "@/components/ui/duo-button";
import { formatNgn } from "@/lib/format-currency";
import { lessons } from "@/lib/lessons";
import { useProgressHydrated, useProgressStore } from "@/lib/store/progress-store";
import { useTradingStore } from "@/lib/store/trading-store";

export default function DashboardPage() {
  const progress = useProgressStore((s) => s.getOverallProgress());
  const averageQuizScore = useProgressStore((s) => s.getAverageQuizScore());
  const nextLesson = useProgressStore((s) => s.getNextIncompleteLesson());
  const completedCount = useProgressStore((s) => s.completedLessonIds.length);
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const onboardingComplete = useProgressStore((s) => s.onboardingComplete);
  const appTourComplete = useProgressStore((s) => s.appTourComplete);
  const learningGoal = useProgressStore((s) => s.learningGoal);
  const portfolioValue = useTradingStore((s) => s.getPortfolioValue());
  const tradeCount = useTradingStore((s) => s.trades.length);

  const [replayIntro, setReplayIntro] = useState(false);
  const progressHydrated = useProgressHydrated();
  const showOnboarding =
    progressHydrated && (replayIntro || !onboardingComplete);
  const showAppTour =
    progressHydrated &&
    onboardingComplete &&
    !appTourComplete &&
    !showOnboarding;

  const mascotSpeech =
    !onboardingComplete && !showOnboarding
      ? "tap get started when you're ready!"
      : nextLesson
        ? "ready for your next lesson?"
        : "path complete — go practice!";

  return (
    <>
      {showOnboarding && (
        <OnboardingFlow onDone={() => setReplayIntro(false)} />
      )}
      {showAppTour && <AppTour />}

      <div className="mx-auto max-w-2xl space-y-5 px-1 pb-2 pt-3 lg:p-8 ">
        {/* Hero card */}
        <section className="micro-card animate-fade-up overflow-hidden rounded-xl border-2 border-b-4 border-hairline-strong bg-paper shadow-soft-lift">
          <div className="bg-canvas px-5 py-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:text-left">
              <KoboMascot mood="happy" size="md" speech={mascotSpeech} />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-display-sm lowercase text-ink">
                  {completedCount === 0 ? "let's get started!" : "welcome back!"}
                </h1>
                <p className="mt-2 text-sm lowercase text-ink-soft">
                  {learningGoal === "practice"
                    ? "your paper portfolio is ready whenever you are."
                    : learningGoal === "learn"
                      ? "keep your streak alive with one quick lesson."
                      : "lessons, quizzes, and paper trades — all in one place."}
                </p>
                <div className="mt-4 hidden sm:block">
                  <AppStatPills streak={streak} xp={xp} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-hairline bg-paper p-5">
            <LessonProgressBar
              value={progress}
              label="course progress"
            />
            <p className="mt-2 text-xs lowercase text-ink-soft">
              {completedCount} of {lessons.length} lessons complete
            </p>

            <div className="mt-5" data-tour="continue">
              {nextLesson ? (
                <DuoButton href={`/learn/${nextLesson.id}`} fullWidth variant="success" size="lg">
                  {completedCount === 0 ? "start lesson 1" : "continue"}
                </DuoButton>
              ) : (
                <DuoButton href="/practice" fullWidth variant="success" size="lg">
                  go practice
                </DuoButton>
              )}
            </div>
          </div>
        </section>

        {/* Mobile stats */}
        <div className="grid grid-cols-3 gap-3 sm:hidden">
          <StatCard label="streak" value={streak || 0} accent="amber" />
          <StatCard label="xp" value={xp} accent="green" />
          <StatCard
            label="lessons"
            value={`${completedCount}/${lessons.length}`}
            accent="teal"
          />
        </div>

        {/* Next up */}
        {nextLesson && (
          <section className="micro-card animate-fade-up rounded-xl border-2 border-b-4 border-[#84d8ff] border-b-[#1899d6] bg-[#ddf4ff]/50 p-5">
            <p className="text-xs font-bold uppercase text-[#1899d6]">up next</p>
            <p className="mt-1 text-xl font-extrabold lowercase text-ink">
              {nextLesson.title.toLowerCase()}
            </p>
            <p className="mt-1 text-sm lowercase text-ink-soft">
              {nextLesson.summary.toLowerCase()}
            </p>
          </section>
        )}

        {/* Stats row desktop */}
        <div className="hidden gap-3 sm:grid sm:grid-cols-2">
          <StatCard
            label="quiz average"
            value={averageQuizScore > 0 ? `${averageQuizScore}%` : "—"}
            accent="default"
            icon={<TrendingUp className="size-5 text-primary" />}
          />
          <StatCard
            label="paper trades"
            value={tradeCount}
            accent="default"
            icon={<LineChart className="size-5 text-primary" />}
          />
        </div>

        {/* Share & invite */}
        {onboardingComplete && !showOnboarding && <SocialShareSection />}

        {/* Quick links */}
        <section className="space-y-3">
          <p className="text-sm font-extrabold lowercase text-ink-soft">
            jump to
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <DuoTile
              href="/learn"
              title="lesson path"
              subtitle="see all bubbles on the map"
              accent="green"
              icon={<BookOpen className="size-5 text-[#58cc02]" />}
            />
            <DuoTile
              href="/practice"
              title="paper trading"
              subtitle={`${formatNgn(portfolioValue, true)} ngx portfolio`}
              accent="blue"
              icon={<LineChart className="size-5 text-[#1899d6]" />}
            />
          </div>
        </section>

        {onboardingComplete && !showOnboarding && (
          <div className="text-center">
            <DuoButton variant="secondary" onClick={() => setReplayIntro(true)}>
              replay intro
            </DuoButton>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  accent: "amber" | "green" | "teal" | "default";
  icon?: ReactNode;
}) {
  const styles = {
    amber: "border-[#ffc800] border-b-[#e5a800] bg-[#ffc800]/15 text-[#ffc800]",
    green: "border-[#58cc02] border-b-[#46a302] bg-[#d7ffb8] text-[#58cc02]",
    teal: "border-primary border-b-primary-deep bg-primary/10 text-primary",
    default: "border-hairline-strong bg-paper text-ink",
  };

  return (
    <div
      className={`micro-card rounded-xl border-2 border-b-4 p-4 ${styles[accent]}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase opacity-80">{label}</p>
        {icon}
      </div>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}
