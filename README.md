# Kobopilot

Interactive trading education platform — learn, quiz, and practice with paper trading.

## Features

- **Landing page** — marketing site at `/`
- **Dashboard** — progress overview at `/dashboard`
- **Learn** — 12-lesson path with quizzes at `/learn`, plus a glossary at `/learn/glossary`
- **Practice** — paper trading simulator at `/practice`
- **Kobo AI** — an NGX coach in every screen, grounded in live quotes, your paper
  portfolio, and your lesson progress

## Getting started

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Everything is optional — the app runs with no configuration at all.

| Variable | Effect if unset |
| --- | --- |
| `OPENAI_API_KEY` | Kobo AI falls back to scripted offline replies |
| `OPENAI_CHAT_MODEL` | Defaults to `gpt-5-mini` |
| `OPENAI_REASONING_EFFORT` | Defaults to `minimal` (gpt-5* models only) |
| `NGXPULSE_API_KEY`, `TROVE_API_KEY`, `ITICK_API_TOKEN` | Prices are deterministically simulated |

Market providers are tried in order and the first returning 3+ quotes wins. Leaving a
variable blank counts as unset.

## Market data

NGXPulse is the working provider. It gives a snapshot of all NGX equities and **daily
closing bars** per symbol — no intraday, no published intraday high/low, no websocket.
Equities refresh about every 20 minutes and the exchange trades 09:00–16:00 WAT, Mon–Fri.

Two things follow from that, and both are load-bearing:

**Quota.** The Personal tier allows 10 requests/min and **100/day**. Client polling is
therefore decoupled from upstream calls: the snapshot fetch carries `revalidate: 1200`
and history `revalidate: 86400`, so one upstream call serves every connected client, and
`lib/market/market-hours.ts` stops the client polling altogether while the NGX is shut.
Worst case is roughly 30 upstream calls a day. Public holidays are not hardcoded — they
are detected from the feed's own `trade_date` going stale.

**The chart has two modes.** `ngx live` draws real daily closes over 1w/1m/3m/1y. Because
real prices barely move within a session, `demo mode` draws a simulated intraday series
so learners can see what price action looks like. Each mode states which it is on screen,
and synthesis never runs under the live label — `getNgxHistory` deliberately has no
simulated fallback, because serving invented history from a "live" chart would present
fabricated data as real.

## Kobo AI

`POST /api/chat` streams replies via the Vercel AI SDK. The model answers through tools
rather than from memory: `get_quote` and `get_watchlist` hit the same NGX provider chain
the charts use, while `get_portfolio` and `get_progress` read a snapshot the client sends
with each request, since that state lives in `localStorage`.

Guardrails worth knowing about before changing the prompt or tools:

- `get_lesson` never returns the `quiz` field — the model cannot leak quiz answers.
- Prior tool-call parts are stripped from the transcript server-side, so a crafted
  request cannot feed the model fabricated tool output.
- The endpoint is unauthenticated, so it is rate limited to 20 requests per 10 minutes
  per IP, held in process memory. Replace this with a Redis-backed limiter before a
  public launch — see `lib/ai/rate-limit.ts`.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (localStorage persistence)
- Vercel AI SDK + OpenAI

## Brand

Kobopilot uses the Invest Bamboo design token system (deep green, warm canvas, lime accents). See `.cursor/skills/kobopilot-design/SKILL.md` and `.cursor/skills/investbamboo-design/SKILL.md`.
