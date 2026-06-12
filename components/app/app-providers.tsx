"use client";

import { MarketProvider } from "@/components/market/market-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <MarketProvider>{children}</MarketProvider>;
}
