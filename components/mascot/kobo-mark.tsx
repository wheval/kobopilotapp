import { cn } from "@/lib/utils";

export type MascotMood = "idle" | "happy" | "thinking" | "celebrate" | "sad";

type KoboMarkProps = {
  className?: string;
  mood?: MascotMood;
  /** Compact head-only crop for logo / favicon */
  variant?: "full" | "head";
};

export function KoboMark({
  className,
  mood = "happy",
  variant = "full",
}: KoboMarkProps) {
  // The head body spans x 20–100, y 28–96. The old "22 22 76 76" crop was
  // narrower than the body, which sliced ~2px off each side ("cut-off ears").
  const viewBox = variant === "head" ? "16 20 88 88" : "0 0 120 120";

  return (
    <svg
      viewBox={viewBox}
      className={cn("shrink-0", className)}
      aria-hidden
      role="img"
    >
      {variant === "full" && (
        <ellipse cx="60" cy="95" rx="34" ry="8" fill="rgba(12,35,26,0.12)" />
      )}
      <rect x="20" y="28" width="80" height="68" rx="28" fill="#004a3d" />
      <rect x="26" y="34" width="68" height="56" rx="22" fill="#006652" />
      <circle cx="44" cy="58" r="10" fill="#fefdfc" />
      <circle cx="76" cy="58" r="10" fill="#fefdfc" />
      <circle
        cx={mood === "sad" ? 41 : 46}
        cy={mood === "sad" ? 60 : 58}
        r="4.5"
        fill="#0c231a"
      />
      <circle
        cx={mood === "sad" ? 79 : 74}
        cy={mood === "sad" ? 60 : 58}
        r="4.5"
        fill="#0c231a"
      />
      {mood === "happy" || mood === "celebrate" || mood === "idle" ? (
        <path
          d="M 44 74 Q 60 86 76 74"
          fill="none"
          stroke="#fefdfc"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ) : mood === "sad" ? (
        <path
          d="M 44 80 Q 60 70 76 80"
          fill="none"
          stroke="#fefdfc"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ) : (
        <rect x="48" y="72" width="24" height="4" rx="2" fill="#fefdfc" />
      )}
      <ellipse cx="36" cy="68" rx="6" ry="3" fill="rgba(230,255,85,0.35)" />
      <ellipse cx="84" cy="68" rx="6" ry="3" fill="rgba(230,255,85,0.35)" />
      <path d="M 60 18 L 68 8 L 76 18 Z" fill="#e6ff55" />
    </svg>
  );
}
