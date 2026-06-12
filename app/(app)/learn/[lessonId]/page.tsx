"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";

import { QuizBlock } from "@/components/app/lesson-ui";
import {
  MobileScrollSpacer,
  MobileStickyCta,
} from "@/components/app/mobile-sticky-cta";
import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { DuoButton } from "@/components/ui/duo-button";
import {
  getLessonById,
  getNextLesson,
  isLessonUnlocked,
} from "@/lib/lessons";
import { hapticTap } from "@/lib/haptics";
import { useProgressStore } from "@/lib/store/progress-store";

export default function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = use(params);
  const lesson = getLessonById(lessonId);
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const isCompleted = useProgressStore((s) => s.isLessonCompleted(lessonId));
  const [showQuiz, setShowQuiz] = useState(false);
  const [sectionIndex, setSectionIndex] = useState(0);

  if (!lesson) notFound();

  const unlocked = isLessonUnlocked(lesson.order, completedLessonIds);
  const nextLesson = getNextLesson(lessonId);
  const section = lesson.sections[sectionIndex];
  const isLastSection = sectionIndex >= lesson.sections.length - 1;

  const handleContinue = () => {
    hapticTap();
    if (isLastSection) {
      setShowQuiz(true);
    } else {
      setSectionIndex((i) => i + 1);
    }
  };

  if (!unlocked) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-8 text-center sm:py-12">
        <KoboMascot mood="sad" size="md" speech="finish the last lesson first!" />
        <DuoButton href="/learn" variant="secondary" fullWidth>
          back to path
        </DuoButton>
      </div>
    );
  }

  if (showQuiz && !isCompleted) {
    return (
      <div className="mx-auto max-w-lg">
        <QuizBlock
          lessonId={lessonId}
          onComplete={(score) => completeLesson(lessonId, score)}
        />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-8 text-center sm:py-12">
        <KoboMascot mood="celebrate" size="lg" speech="you already nailed this one!" />
        {nextLesson ? (
          <DuoButton href={`/learn/${nextLesson.id}`} fullWidth>
            next lesson
          </DuoButton>
        ) : (
          <DuoButton href="/practice" variant="success" fullWidth>
            start paper trading
          </DuoButton>
        )}
        <DuoButton href="/learn" variant="secondary" fullWidth>
          back to path
        </DuoButton>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-lg space-y-4 pb-4 sm:space-y-6 md:pb-0">
        <div className="h-3 overflow-hidden rounded-full bg-cloud">
          <div
            className="h-full rounded-full bg-[#58cc02] transition-all duration-500"
            style={{
              width: `${((sectionIndex + 1) / lesson.sections.length) * 100}%`,
            }}
          />
        </div>

        <div className="flex justify-center">
          <KoboMascot mood="thinking" size="sm" speech="read this bit carefully!" />
        </div>

        <div className="rounded-xl border-2 border-b-4 border-hairline-strong bg-paper p-4 shadow-soft-lift sm:p-6">
          <p className="text-[10px] font-bold uppercase text-ink-soft sm:text-xs">
            lesson {lesson.order} · step {sectionIndex + 1}/{lesson.sections.length}
          </p>
          <h1 className="mt-2 text-xl font-extrabold lowercase text-ink sm:text-2xl">
            {section.heading.toLowerCase()}
          </h1>
          <p className="mt-3 text-sm leading-relaxed lowercase text-ink-soft first-letter:uppercase sm:mt-4 sm:text-base">
            {section.body}
          </p>
        </div>

        {isLastSection && (
          <div className="rounded-xl border-2 border-b-4 border-[#ffc800] bg-[#ffc800]/10 p-4">
            <p className="font-extrabold lowercase text-ink">key takeaways</p>
            <ul className="mt-2 space-y-2">
              {lesson.takeaways.map((item) => (
                <li key={item} className="flex gap-2 text-sm lowercase text-ink-soft">
                  <span className="font-extrabold text-[#ffc800]">•</span>
                  {item.toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {sectionIndex > 0 && (
          <button
            type="button"
            onClick={() => setSectionIndex((i) => i - 1)}
            className="hidden min-h-11 w-full text-center text-sm font-bold lowercase text-ink-soft underline touch-manipulation md:block"
          >
            go back
          </button>
        )}

        <div className="hidden md:block">
          <DuoButton
            fullWidth
            size="lg"
            variant={isLastSection ? "success" : "primary"}
            onClick={handleContinue}
          >
            {isLastSection ? "start quiz" : "continue"}
          </DuoButton>
        </div>
      </div>

      <MobileStickyCta className="flex flex-col gap-2">
        <DuoButton
          fullWidth
          size="lg"
          variant={isLastSection ? "success" : "primary"}
          onClick={handleContinue}
        >
          {isLastSection ? "start quiz" : "continue"}
        </DuoButton>
        {sectionIndex > 0 && (
          <button
            type="button"
            onClick={() => setSectionIndex((i) => i - 1)}
            className="min-h-10 text-sm font-bold lowercase text-ink-soft underline touch-manipulation"
          >
            go back
          </button>
        )}
      </MobileStickyCta>
      <MobileScrollSpacer />
    </>
  );
}
