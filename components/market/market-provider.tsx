"use client";

import { useEffect } from "react";

import { useMarketStore } from "@/lib/store/market-store";

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const startPolling = useMarketStore((s) => s.startPolling);
  const stopPolling = useMarketStore((s) => s.stopPolling);

  useEffect(() => {
    startPolling(30_000);
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  return children;
}
