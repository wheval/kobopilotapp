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
            real ngx prices, ₦1,000,000 play cash — switch to demo mode to watch a
            simulated chart move.
          </p>
        </div>
      </div>

      <div className="min-w-0 max-w-full">
        <StockChart />
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3">
        {/* min-w-0: grid items default to min-width:auto, so a long company name in the
            watchlist stretches the column past the viewport and gets clipped. */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Watchlist />
          <OrderForm />
        </div>
        <PortfolioSummary />
      </div>
    </PageShell>
  );
}
