"use client";

import { LessonPath } from "@/components/app/lesson-path";
import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { useProgressStore } from "@/lib/store/progress-store";

export default function LearnPage() {
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-b-4 border-hairline-strong bg-paper p-4 shadow-soft-lift">
        <div>
          <h1 className="text-2xl font-extrabold lowercase text-ink sm:text-3xl">
            your path
          </h1>
          <p className="mt-1 text-sm lowercase text-ink-soft">
            tap a lesson bubble to start learning
          </p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl border-2 border-b-4 border-[#ffc800] bg-[#ffc800]/20 px-3 py-2 text-center">
            <p className="text-lg font-extrabold text-[#ffc800]">{streak || 0}</p>
            <p className="text-[10px] font-bold uppercase text-ink-soft">streak</p>
          </div>
          <div className="rounded-xl border-2 border-b-4 border-[#84d8ff] bg-[#ddf4ff] px-3 py-2 text-center">
            <p className="text-lg font-extrabold text-[#1899d6]">{xp}</p>
            <p className="text-[10px] font-bold uppercase text-ink-soft">xp</p>
          </div>
        </div>
      </div>

      <LessonPath />

      <div className="flex justify-center pt-4">
        <KoboMascot mood="idle" size="md" speech="one step at a time!" />
      </div>
    </div>
  );
}
