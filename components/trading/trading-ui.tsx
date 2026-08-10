"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { DuoButton, DuoSelectButton } from "@/components/ui/duo-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNgn } from "@/lib/format-currency";
import { hapticError, hapticSuccess, hapticPress } from "@/lib/haptics";
import { useMarketStore } from "@/lib/store/market-store";
import { useTradingStore } from "@/lib/store/trading-store";
import type { OrderSide } from "@/lib/types";
import { cn } from "@/lib/utils";

function MarketSourceBadge() {
  const source = useMarketStore((s) => s.source);
  const provider = useMarketStore((s) => s.provider);
  const updatedAt = useMarketStore((s) => s.updatedAt);

  const providerLabel =
    provider === "ngxpulse"
      ? "ngxpulse"
      : provider === "trove"
        ? "trove"
        : provider === "itick"
          ? "itick"
          : "simulated";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
        NGX
      </Badge>
      {source === "live" && (
        <Badge variant="outline" className="border-success text-success">
          {providerLabel} live
        </Badge>
      )}
      {updatedAt && (
        <span className="text-xs lowercase text-ink-soft">
          updated {new Date(updatedAt).toLocaleTimeString("en-NG")}
        </span>
      )}
    </div>
  );
}

export function Watchlist() {
  const quotes = useMarketStore((s) => s.quotes);
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useTradingStore((s) => s.setSelectedSymbol);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-ink">NGX watchlist</CardTitle>
        <CardDescription>Nigerian stocks · tap to trade</CardDescription>
        <MarketSourceBadge />
      </CardHeader>
      <CardContent className="space-y-2">
        {quotes.map((item, index) => {
          const positive = item.change >= 0;
          const selected = selectedSymbol === item.symbol;
          return (
            <DuoSelectButton
              key={item.symbol}
              index={index}
              state={selected ? "selected" : "idle"}
              onSelect={() => setSelectedSymbol(item.symbol)}
              className="!py-3"
            >
              <div className="flex w-full min-w-0 items-center justify-between gap-2 normal-case sm:gap-3">
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 font-extrabold uppercase text-ink">
                      {item.symbol}
                    </span>
                    <span className="min-w-0 truncate text-xs font-semibold lowercase text-ink-soft">
                      {item.name}
                    </span>
                  </div>
                  <p className="text-sm font-bold">{formatNgn(item.price)}</p>
                </div>
                <div
                  className={cn(
                    "flex shrink-0 items-center gap-1 text-sm font-extrabold",
                    positive ? "text-success" : "text-destructive"
                  )}
                >
                  {positive ? (
                    <TrendingUp className="size-4" />
                  ) : (
                    <TrendingDown className="size-4" />
                  )}
                  {positive ? "+" : ""}
                  {item.changePercent.toFixed(2)}%
                </div>
              </div>
            </DuoSelectButton>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function OrderForm() {
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);
  const getPrice = useTradingStore((s) => s.getPrice);
  const getStockName = useTradingStore((s) => s.getStockName);
  const placeOrder = useTradingStore((s) => s.placeOrder);
  const cash = useTradingStore((s) => s.cash);

  const [quantity, setQuantity] = useState("1");
  const [side, setSide] = useState<OrderSide>("buy");
  const [message, setMessage] = useState<string | null>(null);

  const price = getPrice(selectedSymbol);
  const qty = parseInt(quantity, 10) || 0;
  const total = price * qty;

  const handleSubmit = () => {
    const result = placeOrder(selectedSymbol, side, qty);
    setMessage(result.message);
    if (result.success) hapticSuccess();
    else hapticError();
  };

  return (
    <Card className="border-2 border-b-4 border-hairline-strong shadow-soft-lift">
      <CardHeader>
        <CardTitle className="font-extrabold lowercase text-ink">
          place order
        </CardTitle>
        <CardDescription className="normal-case">
          {selectedSymbol} · {getStockName(selectedSymbol)} · market order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {(["buy", "sell"] as OrderSide[]).map((option) => (
            <DuoSelectButton
              key={option}
              state={side === option ? "selected" : "idle"}
              onSelect={() => setSide(option)}
              className="!py-3 text-center !text-base"
            >
              {option}
            </DuoSelectButton>
          ))}
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold lowercase text-ink">
            quantity
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="duo-input w-full rounded-xl border-2 border-b-4 border-hairline-strong bg-paper px-4 py-3 text-base font-bold outline-none focus:border-[#84d8ff] focus:border-b-[#84d8ff]"
          />
        </div>
        <div className="rounded-2xl border-2 border-hairline bg-canvas p-4 text-sm">
          <div className="flex justify-between lowercase">
            <span className="text-ink-soft">price</span>
            <span className="font-bold">{formatNgn(price)}</span>
          </div>
          <div className="mt-2 flex justify-between font-extrabold lowercase">
            <span>total</span>
            <span>{formatNgn(total)}</span>
          </div>
          <div className="mt-1 flex justify-between lowercase text-ink-soft">
            <span>cash</span>
            <span>{formatNgn(cash)}</span>
          </div>
        </div>
        <DuoButton
          fullWidth
          variant={side === "buy" ? "success" : "danger"}
          onClick={handleSubmit}
          className="normal-case"
        >
          {side} {selectedSymbol}
        </DuoButton>
        {message && (
          <p
            key={message}
            className={cn(
              "animate-pop-in text-center text-sm font-bold lowercase",
              message.includes("Bought") || message.includes("Sold")
                ? "text-success"
                : "text-destructive"
            )}
          >
            {message.toLowerCase()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function PortfolioSummary() {
  const cash = useTradingStore((s) => s.cash);
  const holdings = useTradingStore((s) => s.holdings);
  const trades = useTradingStore((s) => s.trades);
  const getPrice = useTradingStore((s) => s.getPrice);
  const getPortfolioValue = useTradingStore((s) => s.getPortfolioValue);
  const getTotalPnL = useTradingStore((s) => s.getTotalPnL);
  const resetPortfolio = useTradingStore((s) => s.resetPortfolio);

  const portfolioValue = getPortfolioValue();
  const pnl = getTotalPnL();
  const pnlPositive = pnl >= 0;

  return (
    <div className="min-w-0 space-y-6">
      <Card className="min-w-0">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="min-w-0">
            <CardTitle className="text-ink">Portfolio</CardTitle>
            <CardDescription>NGX paper trading · ₦1M starting cash</CardDescription>
          </div>
          <DuoButton
            variant="ghost"
            size="sm"
            onClick={() => {
              hapticPress();
              resetPortfolio();
            }}
          >
            reset
          </DuoButton>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-ink">{formatNgn(portfolioValue)}</p>
          <p
            className={cn(
              "mt-1 text-sm font-medium",
              pnlPositive ? "text-success" : "text-destructive"
            )}
          >
            {pnlPositive ? "+" : ""}
            {formatNgn(pnl)} all time
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-muted-foreground">Cash</p>
              <p className="font-semibold">{formatNgn(cash)}</p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-muted-foreground">Holdings</p>
              <p className="font-semibold">{holdings.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-ink">Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No holdings yet. Place a buy order to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {holdings.map((holding) => {
                const currentPrice = getPrice(holding.symbol);
                const value = currentPrice * holding.quantity;
                const cost = holding.avgPrice * holding.quantity;
                const holdingPnl = value - cost;
                return (
                  <div
                    key={holding.symbol}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-semibold">{holding.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {holding.quantity} shares @ {formatNgn(holding.avgPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNgn(value)}</p>
                      <p
                        className={cn(
                          "text-xs",
                          holdingPnl >= 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {holdingPnl >= 0 ? "+" : ""}
                        {formatNgn(holdingPnl)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-ink">Trade history</CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trades yet.</p>
          ) : (
            <div className="space-y-2">
              {trades.slice(0, 8).map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        trade.side === "buy"
                          ? "bg-success/15 text-success hover:bg-success/15"
                          : "bg-destructive/15 text-destructive hover:bg-destructive/15"
                      )}
                    >
                      {trade.side.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{trade.symbol}</span>
                    <span className="text-muted-foreground">
                      {trade.quantity} @ {formatNgn(trade.price)}
                    </span>
                  </div>
                  <span className="font-medium">{formatNgn(trade.total)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
