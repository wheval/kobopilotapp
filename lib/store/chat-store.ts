import { create } from "zustand";

type ChatContext = {
  mode: "general" | "chart";
  symbol?: string;
};

type ChatState = {
  isOpen: boolean;
  context: ChatContext;
  openChat: (context?: ChatContext) => void;
  openChartChat: (symbol: string) => void;
  closeChat: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  context: { mode: "general" },

  openChat: (context = { mode: "general" }) =>
    set({ isOpen: true, context }),

  openChartChat: (symbol) =>
    set({
      isOpen: true,
      context: { mode: "chart", symbol: symbol.toUpperCase() },
    }),

  closeChat: () =>
    set({ isOpen: false, context: { mode: "general" } }),
}));
