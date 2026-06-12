"use client";

import Link from "next/link";
import { useState } from "react";

import {
  MobileScrollSpacer,
  MobileStickyCta,
} from "@/components/app/mobile-sticky-cta";
import { PageShell } from "@/components/app/page-shell";
import { KoboMascot, type MascotMood } from "@/components/mascot/kobo-mascot";
import {
  DuoButton,
  DuoSelectButton,
  type DuoSelectState,
} from "@/components/ui/duo-button";
import { hapticError, hapticSuccess } from "@/lib/haptics";
import { isLessonUnlocked, lessons } from "@/lib/lessons";
import {
  optionLabel,
  scoreHeadline,
  scoreMascotSpeech,
  shuffleQuestionOptions,
} from "@/lib/quiz-utils";
import { useProgressStore } from "@/lib/store/progress-store";
import { cn } from "@/lib/utils";

export function QuizCompleteScreen({
  score,
  correctCount,
  totalQuestions,
  nextLessonHref,
  variant = "fresh",
}: {
  score: number;
  correctCount: number;
  totalQuestions: number;
  nextLessonHref?: string;
  variant?: "fresh" | "review";
}) {
  const headline = scoreHeadline(score);
  const speech =
    variant === "review"
      ? `you scored ${score}% last time!`
      : scoreMascotSpeech(score);

  return (
    <PageShell size="md">
      <div className="flex flex-col items-center gap-6 text-center">
        <KoboMascot mood="celebrate" size="xl" speech={speech} />

        <div className="w-full rounded-2xl border-2 border-b-4 border-hairline-strong bg-paper p-6 shadow-soft-lift sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            {variant === "review" ? "lesson complete" : "quiz complete"}
          </p>
          <p className="mt-2 text-2xl font-extrabold lowercase text-ink">
            {headline}
          </p>
          <p className="mt-4 text-5xl font-extrabold tabular-nums text-[#58cc02] sm:text-6xl animate-score-pop">
            {score}%
          </p>
          <p className="mt-3 text-sm font-semibold lowercase text-ink-soft">
            you got {correctCount} of {totalQuestions} questions right
          </p>
        </div>

        <div className="hidden w-full space-y-2 md:block">
          {nextLessonHref ? (
            <DuoButton href={nextLessonHref} fullWidth size="lg">
              next lesson
            </DuoButton>
          ) : (
            <DuoButton href="/practice" variant="success" fullWidth size="lg">
              start paper trading
            </DuoButton>
          )}
          <DuoButton href="/learn" variant="secondary" fullWidth size="lg">
            back to path
          </DuoButton>
        </div>
      </div>

      <MobileStickyCta className="space-y-2">
        {nextLessonHref ? (
          <DuoButton href={nextLessonHref} fullWidth size="lg">
            next lesson
          </DuoButton>
        ) : (
          <DuoButton href="/practice" variant="success" fullWidth size="lg">
            start paper trading
          </DuoButton>
        )}
        <DuoButton href="/learn" variant="secondary" fullWidth size="lg">
          back to path
        </DuoButton>
      </MobileStickyCta>
      <MobileScrollSpacer />
    </PageShell>
  );
}

export function QuizBlock({
  lessonId,
  onComplete,
}: {
  lessonId: string;
  onComplete: (score: number, correctCount: number) => void;
}) {
  const lesson = lessons.find((l) => l.id === lessonId);
  const addXp = useProgressStore((s) => s.addXp);

  const [questions] = useState(() =>
    lesson ? lesson.quiz.map(shuffleQuestionOptions) : []
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  if (!lesson || questions.length === 0) return null;

  const question = questions[questionIndex];
  const progress =
    ((questionIndex + (checked ? 1 : 0)) / questions.length) * 100;

  const mascotMood: MascotMood = !checked
    ? "thinking"
    : selectedIndex === question.correctIndex
      ? "happy"
      : "sad";

  const mascotSpeech = !checked
    ? "pick the best answer!"
    : selectedIndex === question.correctIndex
      ? "yes! that's right!"
      : `correct answer is ${optionLabel(question.correctIndex)}!`;

  const correctAnswerText =
    question.options[question.correctIndex]?.toLowerCase() ?? "";

  function getOptionState(optionIndex: number): DuoSelectState {
    if (!checked) {
      return selectedIndex === optionIndex ? "selected" : "idle";
    }
    if (optionIndex === question.correctIndex) return "correct";
    if (selectedIndex === optionIndex) return "wrong";
    return "disabled";
  }

  const handleSelect = (optionIndex: number) => {
    if (checked) return;
    setSelectedIndex(optionIndex);
    setChecked(true);
    const isCorrect = optionIndex === question.correctIndex;
    if (isCorrect) {
      hapticSuccess();
      setCorrectCount((c) => c + 1);
      addXp(10);
    } else {
      hapticError();
    }
  };

  const handleContinue = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((i) => i + 1);
      setSelectedIndex(null);
      setChecked(false);
      return;
    }

    const finalCorrect = correctCount;
    const finalScore = Math.round((finalCorrect / questions.length) * 100);
    addXp(25);
    onComplete(finalScore, finalCorrect);
  };

  return (
    <PageShell>
      <div className="space-y-6 pb-4 md:pb-0">
        <div className="h-3 overflow-hidden rounded-full bg-cloud">
          <div
            className="h-full rounded-full bg-[#58cc02] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-center py-1 sm:py-2">
          <KoboMascot mood={mascotMood} size="md" speech={mascotSpeech} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-extrabold lowercase text-ink sm:text-xl">
            {question.question}
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            {question.options.map((option, optionIndex) => (
              <DuoSelectButton
                key={`${question.id}-${option}`}
                index={optionIndex}
                state={getOptionState(optionIndex)}
                onSelect={() => handleSelect(optionIndex)}
                className="!min-h-[52px]"
              >
                <span className="flex items-center gap-3 normal-case">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-b-4 text-sm font-extrabold uppercase transition-transform duration-150",
                      !checked && "border-hairline-strong bg-canvas text-ink-soft",
                      checked &&
                        optionIndex === question.correctIndex &&
                        "scale-110 animate-pill-bump border-success border-b-success bg-success text-white",
                      checked &&
                        selectedIndex === optionIndex &&
                        optionIndex !== question.correctIndex &&
                        "border-destructive border-b-destructive bg-destructive text-white",
                      checked &&
                        optionIndex !== question.correctIndex &&
                        optionIndex !== selectedIndex &&
                        "border-hairline bg-canvas text-ink-soft opacity-60"
                    )}
                  >
                    {optionLabel(optionIndex)}
                  </span>
                  <span className="lowercase">{option.toLowerCase()}</span>
                </span>
              </DuoSelectButton>
            ))}
          </div>

          {checked && (
            <div
              className={cn(
                "animate-pop-in space-y-2 rounded-xl border-2 border-b-4 p-4 text-sm font-semibold lowercase",
                selectedIndex === question.correctIndex
                  ? "border-success border-b-success bg-[#d7ffb8] text-success"
                  : "border-destructive border-b-destructive bg-[#ffdfe0] text-destructive"
              )}
            >
              <p className="font-extrabold">
                {selectedIndex === question.correctIndex
                  ? `correct! ${optionLabel(question.correctIndex)} is right.`
                  : `correct answer is ${optionLabel(question.correctIndex)}: ${correctAnswerText}`}
              </p>
              <p>{question.explanation.toLowerCase()}</p>
            </div>
          )}
        </div>

        {checked && (
          <div className="hidden md:block">
            <DuoButton
              fullWidth
              size="lg"
              variant={
                selectedIndex === question.correctIndex ? "success" : "secondary"
              }
              onClick={handleContinue}
            >
              {questionIndex < questions.length - 1 ? "continue" : "see my score"}
            </DuoButton>
          </div>
        )}
      </div>

      {checked && (
        <MobileStickyCta>
          <DuoButton
            fullWidth
            size="lg"
            variant={
              selectedIndex === question.correctIndex ? "success" : "secondary"
            }
            onClick={handleContinue}
          >
            {questionIndex < questions.length - 1 ? "continue" : "see my score"}
          </DuoButton>
        </MobileStickyCta>
      )}
      {checked && <MobileScrollSpacer />}
    </PageShell>
  );
}

export function LessonCard({ lessonId }: { lessonId: string }) {
  const lesson = lessons.find((l) => l.id === lessonId);
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);
  const quizScores = useProgressStore((s) => s.quizScores);
  const isCompleted = useProgressStore((s) => s.isLessonCompleted(lessonId));
  const unlocked = lesson
    ? isLessonUnlocked(lesson.order, completedLessonIds)
    : false;

  if (!lesson) return null;

  const score = quizScores[lessonId];

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-b-4 border-hairline-strong bg-paper p-4 shadow-soft-lift",
        !unlocked && "opacity-60"
      )}
    >
      <p className="text-xs font-bold uppercase text-ink-soft">
        lesson {lesson.order}
      </p>
      <p className="mt-1 font-extrabold lowercase text-ink">{lesson.title}</p>
      <p className="mt-1 text-sm lowercase text-ink-soft">{lesson.summary}</p>
      {score !== undefined && (
        <p className="mt-2 text-sm font-bold lowercase text-primary">
          quiz: {score}%
        </p>
      )}
      {unlocked ? (
        <Link href={`/learn/${lesson.id}`} className="mt-4 block">
          <DuoButton fullWidth size="sm" variant={isCompleted ? "secondary" : "primary"}>
            {isCompleted ? "review" : "start"}
          </DuoButton>
        </Link>
      ) : (
        <DuoButton fullWidth size="sm" variant="secondary" disabled className="mt-4">
          locked
        </DuoButton>
      )}
    </div>
  );
}
