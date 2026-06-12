"use client";

import Link from "next/link";
import { Check, Lock, Star } from "lucide-react";

import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { hapticPress, hapticTap } from "@/lib/haptics";
import { isLessonUnlocked, lessons } from "@/lib/lessons";
import { useProgressStore } from "@/lib/store/progress-store";
import { cn } from "@/lib/utils";

export function LessonPath() {
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);
  const nextLesson = useProgressStore((s) => s.getNextIncompleteLesson());

  return (
    <div className="relative mx-auto max-w-lg py-2 sm:py-4">
      <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
        <KoboMascot
          mood="happy"
          size="md"
          speech={
            nextLesson
              ? "ready for your next lesson?"
              : "you crushed every lesson!"
          }
        />
      </div>

      <div className="relative space-y-4 sm:space-y-6">
        {lessons.map((lesson, index) => {
          const unlocked = isLessonUnlocked(lesson.order, completedLessonIds);
          const completed = completedLessonIds.includes(lesson.id);
          const isCurrent = nextLesson?.id === lesson.id;
          const alignRight = index % 2 === 1;

          return (
            <div
              key={lesson.id}
              className={cn(
                "relative flex items-center gap-3 sm:gap-4",
                "flex-row",
                alignRight && "md:flex-row-reverse md:pl-16",
                !alignRight && "md:pr-16"
              )}
            >
              {index < lessons.length - 1 && (
                <div
                  className={cn(
                    "absolute top-14 hidden h-[calc(100%+8px)] w-1 rounded-full bg-hairline-strong md:block",
                    alignRight ? "right-[2.6rem]" : "left-[2.6rem]",
                    completed && "bg-success"
                  )}
                />
              )}

              <Link
                href={unlocked ? `/learn/${lesson.id}` : "#"}
                aria-disabled={!unlocked}
                aria-label={`Lesson ${lesson.order}: ${lesson.title}`}
                onClick={(e) => {
                  if (!unlocked) {
                    e.preventDefault();
                    return;
                  }
                  hapticTap();
                }}
                className={cn(
                  "group relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full border-b-4 sm:size-16",
                  "touch-manipulation transition-transform duration-100",
                  "active:translate-y-0.5 active:border-b-2",
                  completed &&
                    "border-b-[#46a302] bg-[#58cc02] text-white shadow-[0_4px_0_#46a302]",
                  isCurrent &&
                    !completed &&
                    "animate-bounce-soft border-b-primary-deep bg-primary text-on-primary shadow-[0_4px_0_var(--primary-deep)]",
                  unlocked &&
                    !completed &&
                    !isCurrent &&
                    "border-b-hairline-strong bg-paper text-ink shadow-[0_4px_0_var(--hairline-strong)]",
                  !unlocked &&
                    "pointer-events-none border-b-hairline bg-cloud text-ink-soft opacity-70"
                )}
              >
                {completed ? (
                  <Check className="size-6 stroke-[3] sm:size-7" />
                ) : !unlocked ? (
                  <Lock className="size-5" />
                ) : (
                  <Star
                    className={cn(
                      "size-5 sm:size-6",
                      isCurrent && "fill-accent-lime text-accent-lime"
                    )}
                  />
                )}
              </Link>

              <Link
                href={unlocked ? `/learn/${lesson.id}` : "#"}
                onClick={(e) => {
                  if (!unlocked) e.preventDefault();
                  else hapticPress();
                }}
                className={cn(
                  "min-w-0 flex-1 rounded-xl border-2 border-b-4 border-hairline-strong bg-paper p-3 shadow-soft-lift sm:p-4",
                  "touch-manipulation active:translate-y-0.5 active:border-b-2",
                  isCurrent && "border-primary border-b-primary-deep",
                  !unlocked && "pointer-events-none opacity-60"
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft sm:text-xs">
                  lesson {lesson.order}
                </p>
                <p className="mt-0.5 font-extrabold lowercase text-ink sm:mt-1">
                  {lesson.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs lowercase text-ink-soft sm:mt-1 sm:text-sm">
                  {lesson.summary}
                </p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
