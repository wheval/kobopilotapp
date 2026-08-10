import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";

export type StoredChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type Thread = {
  messages: StoredChatMessage[];
  updatedAt: number;
};

/** Transcripts are capped so localStorage can't grow without bound. */
const MAX_MESSAGES_PER_THREAD = 30;
const MAX_THREADS = 8;

type ChatHistoryState = {
  threads: Record<string, Thread>;
  readThread: (key: string) => StoredChatMessage[];
  saveThread: (key: string, messages: StoredChatMessage[]) => void;
  clearThread: (key: string) => void;
};

/** Drop the least recently used threads once there are too many. */
function pruneThreads(threads: Record<string, Thread>): Record<string, Thread> {
  const keys = Object.keys(threads);
  if (keys.length <= MAX_THREADS) return threads;

  const keep = keys
    .sort((a, b) => threads[b].updatedAt - threads[a].updatedAt)
    .slice(0, MAX_THREADS);

  return Object.fromEntries(keep.map((key) => [key, threads[key]]));
}

export const useChatHistoryStore = create<ChatHistoryState>()(
  persist(
    (set, get) => ({
      threads: {},

      readThread: (key) => get().threads[key]?.messages ?? [],

      saveThread: (key, messages) => {
        set((state) => ({
          threads: pruneThreads({
            ...state.threads,
            [key]: {
              messages: messages.slice(-MAX_MESSAGES_PER_THREAD),
              updatedAt: Date.now(),
            },
          }),
        }));
      },

      clearThread: (key) => {
        set((state) => {
          if (!(key in state.threads)) return state;
          const threads = { ...state.threads };
          delete threads[key];
          return { threads };
        });
      },
    }),
    { name: "kobopilot-chat-history" }
  )
);

/**
 * Wait for localStorage before reading a thread — restoring from an empty store would
 * seed a fresh welcome and then overwrite the real transcript with it.
 */
export function useChatHistoryHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    () =>
      typeof window !== "undefined" &&
      useChatHistoryStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hydrated) return;
    return useChatHistoryStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, [hydrated]);

  return hydrated;
}
