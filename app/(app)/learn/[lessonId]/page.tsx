"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";

import {
  QuizBlock,
  QuizCompleteScreen,
} from "@/components/app/lesson-ui";
import { GlossaryTerms } from "@/components/app/glossary-panel";
import {
  MobileScrollSpacer,
  MobileStickyCta,
} from "@/components/app/mobile-sticky-cta";
import { PageShell } from "@/components/app/page-shell";
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
  const quizScores = useProgressStore((s) => s.quizScores);
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const isCompleted = useProgressStore((s) => s.isLessonCompleted(lessonId));
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    correctCount: number;
  } | null>(null);
  const [sectionIndex, setSectionIndex] = useState(0);

  if (!lesson) notFound();

  const unlocked = isLessonUnlocked(lesson.order, completedLessonIds);
  const nextLesson = getNextLesson(lessonId);
  const section = lesson.sections[sectionIndex];
  const isLastSection = sectionIndex >= lesson.sections.length - 1;
  const savedScore = quizScores[lessonId];

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
      <PageShell size="md">
        <div className="flex flex-col items-center gap-6 text-center">
          <KoboMascot mood="sad" size="md" speech="finish the last lesson first!" />
          <DuoButton href="/learn" variant="secondary" fullWidth>
            back to path
          </DuoButton>
        </div>
      </PageShell>
    );
  }

  if (showQuiz && quizResults) {
    return (
      <QuizCompleteScreen
        score={quizResults.score}
        correctCount={quizResults.correctCount}
        totalQuestions={lesson.quiz.length}
        nextLessonHref={nextLesson ? `/learn/${nextLesson.id}` : undefined}
      />
    );
  }

  if (showQuiz && !isCompleted) {
    return (
      <QuizBlock
        lessonId={lessonId}
        onComplete={(score, correctCount) => {
          completeLesson(lessonId, score);
          setQuizResults({ score, correctCount });
        }}
      />
    );
  }

  if (isCompleted) {
    return (
      <QuizCompleteScreen
        score={savedScore ?? 0}
        correctCount={Math.round(((savedScore ?? 0) / 100) * lesson.quiz.length)}
        totalQuestions={lesson.quiz.length}
        nextLessonHref={nextLesson ? `/learn/${nextLesson.id}` : undefined}
        variant="review"
      />
    );
  }

  return (
    <>
      <PageShell className="pb-2 md:pb-0">
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

        <div
          key={sectionIndex}
          className="animate-fade-up rounded-xl border-2 border-b-4 border-hairline-strong bg-paper p-4 shadow-soft-lift sm:p-6"
        >
          <p className="text-[10px] font-bold uppercase text-ink-soft sm:text-xs">
            lesson {lesson.order} · step {sectionIndex + 1}/{lesson.sections.length}
          </p>
          <h1 className="mt-2 text-xl font-extrabold lowercase text-ink sm:text-2xl">
            {section.heading.toLowerCase()}
          </h1>
          <p className="mt-3 text-sm leading-relaxed lowercase text-ink-soft first-letter:uppercase sm:mt-4 sm:text-base">
            {section.body}
          </p>
          <GlossaryTerms text={section.body} />
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

        <div className="hidden space-y-2 md:block">
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
              className="min-h-11 w-full text-center text-sm font-bold lowercase text-ink-soft underline touch-manipulation"
            >
              go back
            </button>
          )}
        </div>
      </PageShell>

      <MobileStickyCta
        className={sectionIndex > 0 ? "flex flex-row items-stretch gap-2" : undefined}
      >
        <DuoButton
          fullWidth={sectionIndex === 0}
          size="lg"
          variant={isLastSection ? "success" : "primary"}
          onClick={handleContinue}
          className={sectionIndex > 0 ? "min-w-0 flex-2" : undefined}
        >
          {isLastSection ? "start quiz" : "continue"}
        </DuoButton>
        {sectionIndex > 0 && (
          <DuoButton
            variant="ghost"
            size="lg"
            onClick={() => setSectionIndex((i) => i - 1)}
            className="min-w-0 flex-1 normal-case"
          >
            go back
          </DuoButton>
        )}
      </MobileStickyCta>
      <MobileScrollSpacer />
    </>
  );
}
