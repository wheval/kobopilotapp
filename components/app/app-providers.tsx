"use client";

import { MarketProvider } from "@/components/market/market-provider";
import { AiChatFab } from "@/components/app/ai-chat";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider>
      {children}
      <AiChatFab />
    </MarketProvider>
  );
}
