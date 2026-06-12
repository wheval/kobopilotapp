import type { WatchlistItem } from "@/lib/types";

/** NGX-listed stocks used for demo fallback (prices in ₦, approximate baselines) */
export const NGX_SEED_STOCKS: WatchlistItem[] = [
  {
    symbol: "DANGCEM",
    name: "Dangote Cement",
    price: 285.5,
    change: 4.5,
    changePercent: 1.6,
    sparkline: [278, 280, 279, 282, 284, 283, 285.5],
  },
  {
    symbol: "GTCO",
    name: "GTCO Plc",
    price: 42.85,
    change: 0.65,
    changePercent: 1.54,
    sparkline: [41.2, 41.8, 42.0, 42.1, 42.4, 42.6, 42.85],
  },
  {
    symbol: "MTNN",
    name: "MTN Nigeria",
    price: 210.0,
    change: -2.5,
    changePercent: -1.18,
    sparkline: [215, 214, 213, 212, 211, 210.5, 210],
  },
  {
    symbol: "BUACEMENT",
    name: "BUA Cement",
    price: 98.2,
    change: 1.8,
    changePercent: 1.87,
    sparkline: [94, 95, 96, 96.5, 97, 97.8, 98.2],
  },
  {
    symbol: "ZENITHBANK",
    name: "Zenith Bank",
    price: 38.5,
    change: -0.4,
    changePercent: -1.03,
    sparkline: [39.2, 39.0, 38.8, 38.7, 38.6, 38.5, 38.5],
  },
  {
    symbol: "AIRTELAFRI",
    name: "Airtel Africa",
    price: 2150.0,
    change: 35.0,
    changePercent: 1.65,
    sparkline: [2080, 2095, 2110, 2120, 2135, 2140, 2150],
  },
  {
    symbol: "NB",
    name: "Nigerian Breweries",
    price: 28.75,
    change: 0.25,
    changePercent: 0.88,
    sparkline: [28.0, 28.1, 28.2, 28.3, 28.5, 28.6, 28.75],
  },
  {
    symbol: "SEPLAT",
    name: "Seplat Energy",
    price: 4200.0,
    change: -55.0,
    changePercent: -1.29,
    sparkline: [4280, 4260, 4250, 4230, 4220, 4210, 4200],
  },
];

export const NGX_SYMBOLS = NGX_SEED_STOCKS.map((s) => s.symbol);
