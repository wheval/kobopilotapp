import { create } from "zustand";
import { persist } from "zustand/middleware";

import { lessons } from "@/lib/lessons";

type QuizScores = Record<string, number>;
export type LearningGoal = "learn" | "practice" | "both";

type ProgressState = {
  completedLessonIds: string[];
  quizScores: QuizScores;
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  onboardingComplete: boolean;
  appTourComplete: boolean;
  learningGoal: LearningGoal | null;
  completeLesson: (lessonId: string, quizScore: number) => void;
  addXp: (amount: number) => void;
  completeOnboarding: (goal: LearningGoal) => void;
  completeAppTour: () => void;
  getOverallProgress: () => number;
  getAverageQuizScore: () => number;
  getNextIncompleteLesson: () => (typeof lessons)[0] | undefined;
  isLessonCompleted: (lessonId: string) => boolean;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessonIds: [],
      quizScores: {},
      xp: 0,
      streak: 0,
      lastActiveDate: null,
      onboardingComplete: false,
      appTourComplete: false,
      learningGoal: null,

      addXp: (amount) => {
        const today = todayKey();
        const { lastActiveDate, streak } = get();
        let nextStreak = streak;

        if (lastActiveDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = yesterday.toISOString().slice(0, 10);
          nextStreak = lastActiveDate === yesterdayKey ? streak + 1 : 1;
        }

        set((state) => ({
          xp: state.xp + amount,
          streak: nextStreak,
          lastActiveDate: today,
        }));
      },

      completeOnboarding: (goal) => {
        set({ onboardingComplete: true, learningGoal: goal });
        get().addXp(20);
      },

      completeAppTour: () => {
        set({ appTourComplete: true });
      },

      completeLesson: (lessonId, quizScore) => {
        set((state) => ({
          completedLessonIds: state.completedLessonIds.includes(lessonId)
            ? state.completedLessonIds
            : [...state.completedLessonIds, lessonId],
          quizScores: { ...state.quizScores, [lessonId]: quizScore },
        }));
        get().addXp(50);
      },

      getOverallProgress: () => {
        const { completedLessonIds } = get();
        return Math.round(
          (completedLessonIds.length / lessons.length) * 100
        );
      },

      getAverageQuizScore: () => {
        const scores = Object.values(get().quizScores);
        if (scores.length === 0) return 0;
        return Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        );
      },

      getNextIncompleteLesson: () => {
        const { completedLessonIds } = get();
        return lessons.find(
          (lesson) => !completedLessonIds.includes(lesson.id)
        );
      },

      isLessonCompleted: (lessonId) =>
        get().completedLessonIds.includes(lessonId),
    }),
    { name: "kobopilot-progress" }
  )
);
