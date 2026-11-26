import type { QuizQuestion } from "@/lib/types";

/** Shuffle options so the correct answer is not always in the same slot. */
export function shuffleQuestionOptions(question: QuizQuestion): QuizQuestion {
  const entries = question.options.map((option, index) => ({ option, index }));

  for (let i = entries.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }

  const correctIndex = entries.findIndex(
    (entry) => entry.index === question.correctIndex
  );

  return {
    ...question,
    options: entries.map((entry) => entry.option),
    correctIndex,
  };
}

/** Correct answers needed to pass a quiz and unlock the next lesson (2 of 3). */
export function requiredToPass(totalQuestions: number): number {
  return Math.ceil((totalQuestions * 2) / 3);
}

export function scoreHeadline(score: number): string {
  if (score >= 90) return "amazing!";
  if (score >= 70) return "good job!";
  if (score >= 50) return "nice try!";
  return "keep practicing!";
}

export function scoreMascotSpeech(score: number): string {
  if (score >= 90) return "perfect score energy!";
  if (score >= 70) return "you crushed that quiz!";
  if (score >= 50) return "solid effort — review and go again!";
  return "every mistake is a lesson!";
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"] as const;

export function optionLabel(index: number): string {
  return OPTION_LABELS[index] ?? String.fromCharCode(65 + index);
}
