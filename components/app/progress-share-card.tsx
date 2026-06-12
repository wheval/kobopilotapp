"use client";

import { forwardRef, type ReactNode } from "react";
import { Flame, Gem, Star, TrendingUp } from "lucide-react";

import { KoboMark } from "@/components/mascot/kobo-mark";
import { lessons } from "@/lib/lessons";
import type { ProgressSnapshot } from "@/lib/share-social";
import { cn } from "@/lib/utils";

type ProgressShareCardProps = {
  displayName: string;
  snapshot: ProgressSnapshot;
  className?: string;
};

export const ProgressShareCard = forwardRef<HTMLDivElement, ProgressShareCardProps>(
  function ProgressShareCard({ displayName, snapshot, className }, ref) {
    const { streak, xp, completedCount, progressPercent, quizAverage } = snapshot;

    return (
      <div
        ref={ref}
        className={cn(
          "relative aspect-[5/3] w-full max-w-[540px] overflow-hidden rounded-2xl border-4 border-[#004a3d] bg-[#f4ede4] text-[#0c231a]",
          className
        )}
        style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#d7ffb8]/40 via-[#f4ede4] to-[#fefdfc]" />

        <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <KoboMark variant="head" mood="happy" className="size-14 sm:size-16" />
              <div>
                <p className="text-2xl font-extrabold lowercase tracking-tight text-[#58cc02] sm:text-3xl">
                  kobopilot
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#80a39e]">
                  ngx trading coach
                </p>
              </div>
            </div>
            <div className="rounded-full border-2 border-[#58cc02] bg-[#d7ffb8] px-3 py-1 text-[10px] font-extrabold uppercase text-[#004a3d]">
              progress
            </div>
          </div>

          <div>
            <p className="text-xl font-extrabold lowercase text-[#0c231a] sm:text-2xl">
              @{displayName.toLowerCase()}
            </p>
            <p className="mt-1 text-sm lowercase text-[#80a39e]">
              learning nigerian stock trading
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatPill
              icon={<Flame className="size-4 fill-[#ffc800] text-[#ffc800]" />}
              label="streak"
              value={`${streak || 0}d`}
              accent="amber"
            />
            <StatPill
              icon={<Gem className="size-4 fill-[#58cc02] text-[#58cc02]" />}
              label="xp"
              value={String(xp)}
              accent="green"
            />
            <StatPill
              icon={<Star className="size-4 fill-[#004a3d] text-[#004a3d]" />}
              label="lessons"
              value={`${completedCount}/${lessons.length}`}
              accent="teal"
            />
            <StatPill
              icon={<TrendingUp className="size-4 text-[#004a3d]" />}
              label="course"
              value={`${progressPercent}%`}
              accent="teal"
            />
          </div>

          {quizAverage > 0 && (
            <p className="text-center text-xs font-bold lowercase text-[#004a3d]">
              {quizAverage}% quiz average
            </p>
          )}

          <p className="text-center text-[10px] font-bold uppercase tracking-wide text-[#80a39e]">
            kobopilot · paper trade ngx stocks
          </p>
        </div>
      </div>
    );
  }
);

function StatPill({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent: "amber" | "green" | "teal";
}) {
  const styles = {
    amber: "border-[#ffc800] bg-[#ffc800]/15",
    green: "border-[#58cc02] bg-[#d7ffb8]/80",
    teal: "border-[#ccdad8] bg-white/70",
  };

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-b-4 px-2 py-2 text-center sm:px-3",
        styles[accent]
      )}
    >
      <div className="flex justify-center">{icon}</div>
      <p className="mt-1 text-[9px] font-bold uppercase text-[#80a39e]">{label}</p>
      <p className="text-sm font-extrabold tabular-nums text-[#0c231a] sm:text-base">
        {value}
      </p>
    </div>
  );
}
