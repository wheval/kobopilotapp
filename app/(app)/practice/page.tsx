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
    <PageShell size="xl" className="pb-8">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <KoboMascot mood="happy" size="md" speech="watch the chart move!" />
        <div>
          <h1 className="text-2xl font-extrabold lowercase text-ink sm:text-3xl">
            paper trading
          </h1>
          <p className="mt-1 text-sm lowercase text-ink-soft">
            live ngx charts, ₦1,000,000 play cash — prices refresh every 30s.
          </p>
        </div>
      </div>

      <StockChart />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Watchlist />
          <OrderForm />
        </div>
        <PortfolioSummary />
      </div>
    </PageShell>
  );
}
