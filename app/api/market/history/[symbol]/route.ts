import { NextResponse } from "next/server";

import { NGX_SYMBOLS } from "@/lib/market/ngx-seed";
import { getNgxHistory } from "@/lib/market/quotes-service";

export const dynamic = "force-dynamic";

const DEFAULT_DAYS = 260;
const MAX_DAYS = 1000;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const wanted = symbol.toUpperCase();

  // Only the tickers this app teaches with. Keeps a public route from being used to
  // proxy arbitrary requests against our rate-limited provider key.
  if (!NGX_SYMBOLS.includes(wanted)) {
    return NextResponse.json({ error: "Unknown symbol." }, { status: 404 });
  }

  const requested = Number(new URL(request.url).searchParams.get("days"));
  const days =
    Number.isFinite(requested) && requested > 0
      ? Math.min(MAX_DAYS, Math.floor(requested))
      : DEFAULT_DAYS;

  try {
    return NextResponse.json(await getNgxHistory(wanted, days));
  } catch {
    return NextResponse.json(
      { error: "Unable to load NGX history." },
      { status: 500 }
    );
  }
}
