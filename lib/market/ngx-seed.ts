import type { WatchlistItem } from "@/lib/types";

/**
 * Offline fallback for the eight NGX tickers Kobopilot teaches with.
 *
 * Real closing prices and real seven-session sparklines, snapshotted from NGXPulse
 * for the 2026-08-07 session. Only used when no provider key is configured or every
 * provider fails, so they drift over time — refresh if the gap gets embarrassing.
 */
export const NGX_SEED_STOCKS: WatchlistItem[] = [
  {
    symbol: "DANGCEM",
    name: "Dangote Cement Plc",
    price: 1034.0,
    previousClose: 1034.0,
    change: 0.0,
    changePercent: 0.0,
    sector: "INDUSTRIAL GOODS",
    sparkline: [1034, 1034, 1034, 1034, 1034, 1034, 1034],
  },
  {
    symbol: "GTCO",
    name: "Guaranty Trust Holding Company Plc",
    price: 128.0,
    previousClose: 128.21,
    change: -0.21,
    changePercent: -0.16,
    sector: "FINANCIAL SERVICES",
    sparkline: [128.8, 130, 131, 130, 128, 128, 128],
  },
  {
    symbol: "MTNN",
    name: "MTN Nigeria Communications Plc",
    price: 845.0,
    previousClose: 845.0,
    change: 0.0,
    changePercent: 0.0,
    sector: "ICT",
    sparkline: [857.1, 837, 845, 845, 845, 845, 845],
  },
  {
    symbol: "BUACEMENT",
    name: "BUA Cement Plc",
    price: 316.0,
    previousClose: 316.0,
    change: 0.0,
    changePercent: 0.0,
    sector: "INDUSTRIAL GOODS",
    sparkline: [316, 316, 316, 316, 316, 316, 316],
  },
  {
    symbol: "ZENITHBANK",
    name: "Zenith Bank Plc",
    price: 126.0,
    previousClose: 124.0,
    change: 2.0,
    changePercent: 1.61,
    sector: "FINANCIAL SERVICES",
    sparkline: [120.4, 123.55, 124.9, 124.3, 123, 124, 126],
  },
  {
    symbol: "AIRTELAFRI",
    name: "Airtel Africa Plc",
    price: 5801.4,
    previousClose: 5801.4,
    change: 0.0,
    changePercent: 0.0,
    sector: "ICT",
    sparkline: [5801.4, 5801.4, 5801.4, 5801.4, 5801.4, 5801.4, 5801.4],
  },
  {
    symbol: "NB",
    name: "Nigerian Breweries Plc",
    price: 70.4,
    previousClose: 70.4,
    change: 0.0,
    changePercent: 0.0,
    sector: "CONSUMER GOODS",
    sparkline: [75, 73, 72, 70.5, 70.4, 70.4, 70.4],
  },
  {
    symbol: "SEPLAT",
    name: "Seplat Energy Plc",
    price: 11363.9,
    previousClose: 11363.9,
    change: 0.0,
    changePercent: 0.0,
    sector: "OIL AND GAS",
    sparkline: [11363.9, 11363.9, 11363.9, 11363.9, 11363.9, 11363.9, 11363.9],
  },
];

export const NGX_SYMBOLS = NGX_SEED_STOCKS.map((s) => s.symbol);
