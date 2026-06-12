import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";

type UserState = {
  displayName: string | null;
  profileCreatedAt: number | null;
  setProfile: (displayName: string) => void;
  clearProfile: () => void;
  hasProfile: () => boolean;
};

export function normalizeDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, 24);
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      displayName: null,
      profileCreatedAt: null,

      setProfile: (displayName) => {
        const normalized = normalizeDisplayName(displayName);
        if (normalized.length < 2) return;
        set({
          displayName: normalized,
          profileCreatedAt: Date.now(),
        });
      },

      clearProfile: () =>
        set({ displayName: null, profileCreatedAt: null }),

      hasProfile: () => {
        const name = get().displayName;
        return Boolean(name && name.length >= 2);
      },
    }),
    { name: "kobopilot-user" }
  )
);

export function useUserHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    () =>
      typeof window !== "undefined" &&
      useUserStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hydrated) return;
    return useUserStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, [hydrated]);

  return hydrated;
}
