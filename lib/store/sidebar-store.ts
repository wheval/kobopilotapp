import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarState = {
  desktopOpen: boolean;
  mobileOpen: boolean;
  toggleDesktop: () => void;
  openDesktop: () => void;
  closeDesktop: () => void;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      desktopOpen: true,
      mobileOpen: false,
      toggleDesktop: () =>
        set((state) => ({ desktopOpen: !state.desktopOpen })),
      openDesktop: () => set({ desktopOpen: true }),
      closeDesktop: () => set({ desktopOpen: false }),
      toggleMobile: () =>
        set((state) => ({ mobileOpen: !state.mobileOpen })),
      openMobile: () => set({ mobileOpen: true }),
      closeMobile: () => set({ mobileOpen: false }),
    }),
    {
      name: "kobopilot-sidebar",
      partialize: (state) => ({ desktopOpen: state.desktopOpen }),
    }
  )
);
