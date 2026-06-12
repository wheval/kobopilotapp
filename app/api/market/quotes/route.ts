import { NextResponse } from "next/server";

import { getNgxQuotes } from "@/lib/market/quotes-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getNgxQuotes();
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Unable to load NGX quotes" },
      { status: 500 }
    );
  }
}
