"use client";

import { useState } from "react";
import Link from "next/link";

import { KoboMascot, type MascotMood } from "@/components/mascot/kobo-mascot";
import {
  DuoButton,
  DuoSelectButton,
  type DuoSelectState,
} from "@/components/ui/duo-button";
import {
  MobileScrollSpacer,
  MobileStickyCta,
} from "@/components/app/mobile-sticky-cta";
import { isLessonUnlocked, lessons } from "@/lib/lessons";
import { hapticError, hapticSuccess } from "@/lib/haptics";
import { useProgressStore } from "@/lib/store/progress-store";
import { cn } from "@/lib/utils";

export function QuizBlock({
  lessonId,
  onComplete,
}: {
  lessonId: string;
  onComplete: (score: number) => void;
}) {
  const lesson = lessons.find((l) => l.id === lessonId);
  const addXp = useProgressStore((s) => s.addXp);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!lesson) return null;

  const question = lesson.quiz[questionIndex];
  const progress = ((questionIndex + (checked ? 1 : 0)) / lesson.quiz.length) * 100;

  const mascotMood: MascotMood = !checked
    ? "thinking"
    : selectedIndex === question.correctIndex
      ? "happy"
      : "sad";

  const mascotSpeech = !checked
    ? "pick the best answer!"
    : selectedIndex === question.correctIndex
      ? "yes! that's right!"
      : "almost — keep going!";

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
    if (questionIndex < lesson.quiz.length - 1) {
      setQuestionIndex((i) => i + 1);
      setSelectedIndex(null);
      setChecked(false);
      return;
    }

    const finalScore = Math.round((correctCount / lesson.quiz.length) * 100);
    setFinished(true);
    addXp(25);
    onComplete(finalScore);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <KoboMascot mood="celebrate" size="xl" speech="lesson complete!" />
        <p className="max-w-sm text-lg font-bold lowercase text-ink">
          you scored {Math.round((correctCount / lesson.quiz.length) * 100)}% on
          this quiz. nice work!
        </p>
      </div>
    );
  }

  return (
    <>
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

          <div className="grid gap-3">
            {question.options.map((option, optionIndex) => (
              <DuoSelectButton
                key={option}
                index={optionIndex}
                state={getOptionState(optionIndex)}
                onSelect={() => handleSelect(optionIndex)}
                className="!min-h-[52px]"
              >
                {option.toLowerCase()}
              </DuoSelectButton>
            ))}
          </div>

          {checked && (
            <div
              className={cn(
                "animate-fade-up rounded-xl border-2 border-b-4 p-4 text-sm font-semibold lowercase",
                selectedIndex === question.correctIndex
                  ? "border-success border-b-success bg-[#d7ffb8] text-success"
                  : "border-destructive border-b-destructive bg-[#ffdfe0] text-destructive"
              )}
            >
              {question.explanation.toLowerCase()}
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
              continue
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
            continue
          </DuoButton>
        </MobileStickyCta>
      )}
      {checked && <MobileScrollSpacer />}
    </>
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
