"use client";

import { LessonPath } from "@/components/app/lesson-path";
import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { DuoButton } from "@/components/ui/duo-button";
import { lessons } from "@/lib/lessons";
import { useProgressStore } from "@/lib/store/progress-store";

export default function LearnPage() {
  // streak & xp already sit in the sidebar / top bar; the path shows progress
  const done = useProgressStore((s) => s.completedLessonIds.length);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-1 pb-2 pt-3 lg:p-8">
      <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-b-4 border-hairline-strong bg-paper p-4 shadow-soft-lift">
        <div>
          <h1 className="text-2xl font-extrabold lowercase text-ink sm:text-3xl">
            your path
          </h1>
          <p className="mt-1 text-sm lowercase text-ink-soft">
            tap a lesson bubble to start learning
          </p>
        </div>
        <div className="shrink-0 rounded-xl border-2 border-b-4 border-[#46a302] bg-[#d7ffb8] px-3 py-2 text-center">
          <p className="text-lg font-extrabold tabular-nums text-[#3c8a02]">
            {done}/{lessons.length}
          </p>
          <p className="text-[10px] font-bold lowercase text-ink-soft">lessons done</p>
        </div>
      </div>

      <LessonPath />

      <div className="flex flex-col items-center gap-4 pt-2">
        <DuoButton href="/learn/glossary" variant="secondary" fullWidth>
          open glossary
        </DuoButton>
        <KoboMascot mood="idle" size="md" speech="one step at a time!" />
      </div>
    </div>
  );
}
