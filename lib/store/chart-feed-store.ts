import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * `live` draws real NGX daily closes. `demo` draws the simulated intraday feed, which
 * exists so learners can see what price movement looks like — the NGX is shut for most
 * of the week, and equities only refresh every 20 minutes while it is open.
 */
export type ChartFeed = "live" | "demo";

type ChartFeedState = {
  feed: ChartFeed;
  setFeed: (feed: ChartFeed) => void;
};

export const useChartFeedStore = create<ChartFeedState>()(
  persist(
    (set) => ({
      feed: "live",
      setFeed: (feed) => set({ feed }),
    }),
    { name: "kobopilot-chart-feed" }
  )
);
