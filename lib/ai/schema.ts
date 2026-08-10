import type { UIMessage } from "ai";
import { z } from "zod";

import {
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_CHARS,
  MAX_SNAPSHOT_HOLDINGS,
} from "@/lib/ai/limits";

const holdingSchema = z.object({
  symbol: z.string().max(16),
  name: z.string().max(64),
  quantity: z.number().finite(),
  avgPrice: z.number().finite(),
});

/**
 * Only raw facts the client owns. Valuations are deliberately absent — get_portfolio
 * derives them from one server-side quote fetch so the total and the per-holding
 * numbers can't disagree by a price tick.
 */
const portfolioSchema = z.object({
  cash: z.number().finite(),
  tradeCount: z.number().int().nonnegative(),
  holdings: z.array(holdingSchema).max(MAX_SNAPSHOT_HOLDINGS),
});

const progressSchema = z.object({
  xp: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  completedLessonIds: z.array(z.string().max(64)).max(50),
  progressPercent: z.number().finite(),
  quizAveragePercent: z.number().finite(),
});

/**
 * Portfolio and progress live in localStorage, so the server can only see what the
 * client sends. Treat every field as untrusted display data — never as authorization.
 */
const clientSnapshotSchema = z.object({
  portfolio: portfolioSchema,
  progress: progressSchema,
});

export const chatContextSchema = z.object({
  mode: z.enum(["general", "chart"]),
  symbol: z.string().max(16).optional(),
  lessonId: z.string().max(64).optional(),
  client: clientSnapshotSchema,
});

export type ChatContext = z.infer<typeof chatContextSchema>;

const rawMessageSchema = z.object({
  id: z.string().max(128).optional(),
  role: z.enum(["user", "assistant"]),
  parts: z.array(z.unknown()).max(64),
});

export const chatRequestSchema = z.object({
  messages: z.array(rawMessageSchema).min(1).max(64),
  context: chatContextSchema,
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

function textOf(part: unknown): string | null {
  if (typeof part !== "object" || part === null) return null;
  const candidate = part as { type?: unknown; text?: unknown };
  if (candidate.type !== "text" || typeof candidate.text !== "string") return null;
  return candidate.text;
}

export type NormalizeResult =
  | { ok: true; messages: UIMessage[] }
  | { ok: false; error: string };

/**
 * Reduce the incoming transcript to plain text turns.
 *
 * Tool-call parts from earlier turns are dropped rather than replayed: the client is
 * the only thing that produces them, so trusting them would let a crafted request feed
 * the model fabricated tool output. The model re-calls a tool if it needs the data again.
 */
export function normalizeMessages(
  raw: ChatRequest["messages"]
): NormalizeResult {
  const messages: UIMessage[] = [];

  for (const [index, message] of raw.entries()) {
    const text = message.parts
      .map(textOf)
      .filter((value): value is string => value !== null)
      .join("")
      .trim();

    if (text.length > MAX_MESSAGE_CHARS) {
      return {
        ok: false,
        error: `Message exceeds ${MAX_MESSAGE_CHARS} characters.`,
      };
    }

    if (text.length === 0) continue;

    messages.push({
      id: message.id ?? `${message.role}-${index}`,
      role: message.role,
      parts: [{ type: "text", text }],
    });
  }

  if (messages.length === 0) {
    return { ok: false, error: "No message content." };
  }

  return { ok: true, messages: messages.slice(-MAX_HISTORY_MESSAGES) };
}

export function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role !== "user") continue;
    return message.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("");
  }
  return "";
}
