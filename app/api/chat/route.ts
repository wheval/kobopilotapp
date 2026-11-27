import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
} from "ai";
import { NextResponse } from "next/server";

import { mockReply } from "@/lib/ai/mock-reply";
import { checkRateLimit, clientKey } from "@/lib/ai/rate-limit";
import {
  chatRequestSchema,
  lastUserText,
  normalizeMessages,
  type ChatContext,
} from "@/lib/ai/schema";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { buildTools } from "@/lib/ai/tools";
import { getNgxQuotes } from "@/lib/market/quotes-service";

// Node runtime: the rate limiter keeps its window in module memory.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Models are served through Vercel AI Gateway as `provider/model` strings (the AI SDK
 * routes plain strings to the gateway and authenticates with AI_GATEWAY_API_KEY).
 * Any ID from https://ai-gateway.vercel.sh/v1/models works via AI_GATEWAY_MODEL.
 */
const DEFAULT_MODEL = "openai/gpt-5-mini";
/**
 * Reasoning tokens count against this budget on gpt-5* models, so it has to sit well
 * above the visible reply length — at 500 the answer itself got truncated mid-sentence.
 */
const MAX_OUTPUT_TOKENS = 1200;
const MAX_TOOL_STEPS = 5;
/** A 2-4 sentence coaching reply does not need deliberation; this keeps latency down. */
const DEFAULT_REASONING_EFFORT = "minimal";

const RATE_LIMIT_MESSAGE =
  "whoa, that's a lot of questions at once! give me a few minutes to catch my breath, then ask me again.";

/**
 * Emit a fixed string as a UI message stream so the client renders it as an ordinary
 * Kobo bubble. Used for the no-API-key fallback and for rate limiting — both are states
 * the user should read as a reply, not as a broken chat.
 */
function streamFixedReply(text: string, headers?: HeadersInit) {
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const id = "fallback";
      writer.write({ type: "text-start", id });
      for (const chunk of text.match(/\S+\s*/g) ?? [text]) {
        writer.write({ type: "text-delta", id, delta: chunk });
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      writer.write({ type: "text-end", id });
    },
  });

  return createUIMessageStreamResponse({ stream, headers });
}

async function quoteForContext(ctx: ChatContext) {
  if (!ctx.symbol) return undefined;
  try {
    const market = await getNgxQuotes();
    return market.quotes.find((q) => q.symbol === ctx.symbol);
  } catch {
    return undefined;
  }
}

export async function POST(req: Request) {
  const limit = checkRateLimit(clientKey(req.headers));
  if (!limit.allowed) {
    // Answered as a normal bubble rather than a 4xx: the user still gets a reply, and
    // no model call is made, which is the point of the limiter.
    return streamFixedReply(RATE_LIMIT_MESSAGE, {
      "Retry-After": String(limit.retryAfterSeconds),
      "X-Kobopilot-Rate-Limited": "1",
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid chat request.", issues: parsed.error.issues.slice(0, 5) },
      { status: 400 }
    );
  }

  const normalized = normalizeMessages(parsed.data.messages);
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const { messages } = normalized;
  const ctx = parsed.data.context;

  // No gateway key → scripted offline replies, so the app still works with zero config.
  if (!process.env.AI_GATEWAY_API_KEY) {
    const quote = await quoteForContext(ctx);
    const reply = mockReply(lastUserText(messages), quote, ctx.mode === "chart");
    return streamFixedReply(reply, { "X-Kobopilot-Chat-Mode": "offline" });
  }

  // `||`, not `??`: a declared-but-blank env var is the common case when someone
  // copies .env.example, and `""` is not a usable model id.
  const modelId = process.env.AI_GATEWAY_MODEL || DEFAULT_MODEL;

  const result = streamText({
    model: modelId,
    system: buildSystemPrompt(ctx),
    messages: await convertToModelMessages(messages),
    tools: buildTools(ctx),
    stopWhen: isStepCount(MAX_TOOL_STEPS),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    abortSignal: req.signal,
    // gpt-5* are reasoning models and default to more thinking than a short coaching
    // reply needs. Through the gateway, provider options stay keyed by the real
    // provider ("openai"); other models reject the option, so only send it for gpt-5*.
    providerOptions: modelId.startsWith("openai/gpt-5")
      ? {
          openai: {
            reasoningEffort:
              process.env.AI_REASONING_EFFORT || DEFAULT_REASONING_EFFORT,
          },
        }
      : undefined,
    onError: ({ error }) => {
      console.error("[chat] streamText failed", error);
    },
  });

  return result.toUIMessageStreamResponse({
    // Without this the SDK masks every failure as a bare "An error occurred".
    onError: () =>
      "sorry — i couldn't reach my brain just now. give it another try in a moment.",
  });
}
