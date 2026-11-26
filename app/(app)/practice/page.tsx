import {
  OrderForm,
  PortfolioSummary,
  Watchlist,
} from "@/components/trading/trading-ui";
import { StockChart } from "@/components/trading/stock-chart";
import { PageShell } from "@/components/app/page-shell";
import { KoboMascot } from "@/components/mascot/kobo-mascot";

export default function PracticePage() {
  return (
    <PageShell size="xl" className="pb-8 max-md:px-0">
      <div className="flex w-full min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <KoboMascot mood="happy" size="md" speech="watch the chart move!" />
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold lowercase text-ink sm:text-3xl">
            paper trading
          </h1>
          <p className="mt-1 text-sm lowercase text-ink-soft">
            ngx stocks, ₦1,000,000 of play cash. trade with zero risk, or switch to
            demo mode to watch a chart move.
          </p>
        </div>
      </div>

      <div className="min-w-0 max-w-full">
        <StockChart />
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3">
        {/* min-w-0: grid items default to min-width:auto, so a long company name in the
            watchlist stretches the column past the viewport and gets clipped. */}
        {/* phones: chart → order form → watchlist, so trading needs no long scroll.
            desktop keeps the watchlist first. */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <div className="order-2 min-w-0 lg:order-1">
            <Watchlist />
          </div>
          <div className="order-1 min-w-0 lg:order-2">
            <OrderForm />
          </div>
        </div>
        <PortfolioSummary />
      </div>
    </PageShell>
  );
}
