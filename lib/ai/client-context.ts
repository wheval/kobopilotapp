"use client";

import { MAX_SNAPSHOT_HOLDINGS } from "@/lib/ai/limits";
import type { ChatContext } from "@/lib/ai/schema";
import { useProgressStore } from "@/lib/store/progress-store";
import { useTradingStore } from "@/lib/store/trading-store";

type ContextArgs = {
  mode: ChatContext["mode"];
  symbol?: string;
  lessonId?: string;
};

/**
 * Snapshot the localStorage-backed stores for the server.
 *
 * Read through `getState()` rather than a hook so the values are whatever is true at
 * send time — a subscribed value could be a render behind after a trade or a lesson.
 */
export function buildChatContext({
  mode,
  symbol,
  lessonId,
}: ContextArgs): ChatContext {
  const trading = useTradingStore.getState();
  const progress = useProgressStore.getState();

  return {
    mode,
    ...(symbol ? { symbol } : {}),
    ...(lessonId ? { lessonId } : {}),
    client: {
      portfolio: {
        cash: trading.cash,
        tradeCount: trading.trades.length,
        holdings: trading.holdings
          .slice(0, MAX_SNAPSHOT_HOLDINGS)
          .map((holding) => ({
            symbol: holding.symbol,
            name: holding.name,
            quantity: holding.quantity,
            avgPrice: holding.avgPrice,
          })),
      },
      progress: {
        xp: progress.xp,
        streak: progress.streak,
        completedLessonIds: progress.completedLessonIds,
        progressPercent: progress.getOverallProgress(),
        quizAveragePercent: progress.getAverageQuizScore(),
      },
    },
  };
}
