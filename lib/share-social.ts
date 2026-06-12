import { lessons } from "@/lib/lessons";

export type ProgressSnapshot = {
  streak: number;
  xp: number;
  completedCount: number;
  progressPercent: number;
  quizAverage: number;
};

const INVITE_CODE_KEY = "kobopilot-invite-code";

export function getOrCreateInviteCode(): string {
  if (typeof window === "undefined") return "kobopilot";

  let code = localStorage.getItem(INVITE_CODE_KEY);
  if (!code) {
    code = Math.random().toString(36).slice(2, 8).toLowerCase();
    localStorage.setItem(INVITE_CODE_KEY, code);
  }
  return code;
}

export function getInviteUrl(origin = typeof window !== "undefined" ? window.location.origin : ""): string {
  const code = getOrCreateInviteCode();
  return `${origin}/?ref=${code}`;
}

export function buildProgressShareText(
  snapshot: ProgressSnapshot,
  displayName?: string
): string {
  const who = displayName ? `@${displayName.toLowerCase()} · ` : "";
  const lines = [
    `${who}i'm learning ngx trading on kobopilot!`,
    `🔥 ${snapshot.streak || 0} day streak · ${snapshot.xp} xp`,
    `📚 ${snapshot.completedCount}/${lessons.length} lessons · ${snapshot.progressPercent}% complete`,
  ];

  if (snapshot.quizAverage > 0) {
    lines.push(`✅ ${snapshot.quizAverage}% quiz average`);
  }

  lines.push("", "learn nigerian stocks with lessons, quizzes & ₦ paper trading.");
  return lines.join("\n");
}

export function buildInviteShareText(
  snapshot: ProgressSnapshot,
  inviteUrl: string,
  displayName?: string
): string {
  const who = displayName ? `${displayName} invites you` : "join me";
  return [
    `${who} on kobopilot — gamified ngx trading lessons!`,
    "",
    `i've completed ${snapshot.completedCount}/${lessons.length} lessons with a ${snapshot.streak || 0}-day streak.`,
    "",
    `start free: ${inviteUrl}`,
  ].join("\n");
}

export async function shareOrCopy(text: string, url?: string): Promise<"shared" | "copied"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: "Kobopilot",
        text,
        url: url || undefined,
      });
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw err;
      }
    }
  }

  await navigator.clipboard.writeText(url ? `${text}\n${url}` : text);
  return "copied";
}
