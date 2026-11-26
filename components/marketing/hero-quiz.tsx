"use client";

import { useState } from "react";

import { KoboMark, type MascotMood } from "@/components/mascot/kobo-mark";
import { DuoButton, DuoSelectButton } from "@/components/ui/duo-button";
import type { Lesson } from "@/lib/types";
import { cn } from "@/lib/utils";

const XP_PER_CORRECT = 10;

type Question = Lesson["quiz"][number];

/**
 * A playable slice of lesson 1's real quiz, right in the hero.
 *
 * No layout shift: every question (and the score screen) is rendered into the
 * same CSS grid cell, with only the active one visible. The card is therefore
 * always as tall as its tallest state. Kobo's bubble lives in a fixed-height
 * row above the card and delivers the explanation, so nothing grows on answer.
 */
export function HeroQuiz({
  questions,
  lessonHref,
}: {
  questions: Question[];
  lessonHref: string;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const answered = picked !== null;
  const correct = answered && picked === q.correctIndex;
  const isLast = index === questions.length - 1;

  let mood: MascotMood = "thinking";
  let speech = "tap the answer you think is right.";
  if (done) {
    mood = score === questions.length ? "celebrate" : "happy";
    speech =
      score === questions.length
        ? "perfect score. you're a natural!"
        : "good start. lesson 1 fills in the gaps.";
  } else if (answered) {
    mood = correct ? "happy" : "sad";
    const why = q.explanation.toLowerCase();
    speech = correct ? `yes! ${why}` : `not quite. ${why}`;
  }

  const pick = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (isLast) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  return (
    <div>
      {/* Kobo + bubble: fixed height so a longer explanation never pushes the card */}
      <div className="mb-3 flex h-24 items-end gap-3 pl-1 sm:h-[5.5rem]">
        <KoboMark
          mood={mood}
          className={cn(
            "size-16 shrink-0 drop-shadow-lg sm:size-[4.5rem]",
            mood === "celebrate" && "animate-wiggle"
          )}
        />
        <p
          key={speech}
          aria-live="polite"
          className="animate-pop-in mb-2 rounded-2xl rounded-bl-sm bg-paper px-4 py-2.5 text-sm font-bold lowercase leading-snug text-ink shadow-soft-lift"
        >
          {speech}
        </p>
      </div>

      <div className="rounded-[28px] border-2 border-b-[6px] border-primary-deep bg-paper p-5 text-ink shadow-card sm:p-6">
        {/* progress + xp */}
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5" aria-hidden>
            {questions.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2.5 flex-1 rounded-full transition-colors duration-300",
                  done || i < index || (i === index && answered)
                    ? "bg-[#58cc02]"
                    : "bg-cloud"
                )}
              />
            ))}
          </div>
          <span
            key={score}
            className="animate-score-pop inline-flex min-w-16 justify-center rounded-full bg-accent-lime px-3 py-1 text-sm font-black tabular-nums text-ink"
          >
            {score * XP_PER_CORRECT} xp
          </span>
        </div>

        {/* every state shares one grid cell → constant height */}
        <div className="mt-5 grid">
          {questions.map((question, qi) => {
            const active = !done && qi === index;
            return (
              <div
                key={active ? `${question.id}-on` : question.id}
                className={cn(
                  "flex flex-col [grid-area:1/1]",
                  !active && "invisible"
                )}
                aria-hidden={!active}
                inert={!active}
              >
                <p className="text-sm font-bold lowercase text-ink/55">
                  question {qi + 1} of {questions.length}
                </p>
                <h2 className="mt-1 text-2xl font-black lowercase leading-tight tracking-tight sm:text-[1.7rem]">
                  {question.question.toLowerCase()}
                </h2>

                <div className="mt-4 space-y-2.5">
                  {question.options.map((opt, i) => (
                    <DuoSelectButton
                      key={opt}
                      index={i}
                      onSelect={() => pick(i)}
                      state={
                        !active || !answered
                          ? "idle"
                          : i === question.correctIndex
                            ? "correct"
                            : i === picked
                              ? "wrong"
                              : "disabled"
                      }
                      className="lowercase"
                    >
                      {opt}
                    </DuoSelectButton>
                  ))}
                </div>

                <div className="mt-auto pt-5">
                  <DuoButton
                    variant="success"
                    fullWidth
                    disabled={!active || !answered}
                    onClick={next}
                  >
                    {qi === questions.length - 1 ? "see my score" : "next question"}
                  </DuoButton>
                </div>
              </div>
            );
          })}

          <div
            className={cn(
              "flex flex-col justify-center text-center [grid-area:1/1]",
              done ? "animate-pop-in" : "invisible"
            )}
            aria-hidden={!done}
            inert={!done}
          >
            <p className="text-7xl font-black tracking-tighter text-primary">
              {score}/{questions.length}
            </p>
            <p className="mt-2 text-base font-bold lowercase text-ink/60">
              +{score * XP_PER_CORRECT} xp. every lesson plays like this.
            </p>
            <div className="mt-8 flex flex-col gap-2.5">
              <DuoButton href="/dashboard" variant="success" fullWidth>
                start learning
              </DuoButton>
              <DuoButton href={lessonHref} variant="ghost" fullWidth>
                finish lesson 1
              </DuoButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
