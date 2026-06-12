"use client";

import type { ReactNode } from "react";
import { Flame, Gem, Star } from "lucide-react";

import { hapticPress } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type AppStatPillProps = {
  streak: number;
  xp: number;
  className?: string;
  compact?: boolean;
};

export function AppStatPills({ streak, xp, className, compact }: AppStatPillProps) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      data-tour="stats"
    >
      <div className="flex items-center gap-1.5 rounded-xl border-2 border-b-4 border-[#e5a800] bg-[#ffc800]/20 px-2.5 py-1.5 transition-transform duration-150 hover:scale-[1.02]">
        <Flame className="size-4 fill-[#ffc800] text-[#ffc800]" />
        <span className="text-sm font-extrabold text-[#ffc800]">{streak || 0}</span>
        {!compact && (
          <span className="hidden text-[10px] font-bold uppercase text-[#ffc800]/80 sm:inline">
            streak
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 rounded-xl border-2 border-b-4 border-[#46a302] bg-[#d7ffb8] px-2.5 py-1.5 transition-transform duration-150 hover:scale-[1.02]">
        <Gem className="size-4 fill-[#58cc02] text-[#58cc02]" />
        <span className="text-sm font-extrabold text-[#58cc02]">{xp}</span>
        {!compact && (
          <span className="hidden text-[10px] font-bold uppercase text-[#58cc02]/80 sm:inline">
            xp
          </span>
        )}
      </div>
    </div>
  );
}

export function LessonProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        {label && (
          <p className="text-sm font-extrabold lowercase text-ink">{label}</p>
        )}
        <span className="flex items-center gap-1 text-sm font-extrabold text-[#58cc02]">
          <Star className="size-4 fill-[#58cc02] text-[#58cc02]" />
          {value}%
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-xl border-2 border-hairline-strong bg-cloud">
        <div
          className="h-full rounded-lg bg-[#58cc02] transition-all duration-500 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function DuoTile({
  href,
  title,
  subtitle,
  accent = "default",
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  accent?: "default" | "green" | "blue";
  icon?: ReactNode;
}) {
  const accents = {
    default: "border-hairline-strong hover:border-primary",
    green: "border-[#58cc02] border-b-[#46a302] bg-[#d7ffb8]/30",
    blue: "border-[#84d8ff] border-b-[#1899d6] bg-[#ddf4ff]/40",
  };

  return (
    <a
      href={href}
      onClick={() => hapticPress()}
      className={cn(
        "micro-card block rounded-xl border-2 border-b-4 bg-paper p-4 shadow-soft-lift",
        "hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2",
        accents[accent]
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-extrabold lowercase text-ink">{title}</p>
      </div>
      <p className="mt-1 text-sm lowercase text-ink-soft">{subtitle}</p>
    </a>
  );
}
