import { cn } from "@/lib/utils";

import { KoboMark, type MascotMood } from "./kobo-mark";

export type { MascotMood };

type KoboMascotProps = {
  mood?: MascotMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  speech?: string;
  /** Hide speech bubble on very small screens */
  compact?: boolean;
};

const sizes = {
  sm: "size-14 sm:size-16",
  md: "size-20 sm:size-24",
  lg: "size-24 sm:size-32",
  xl: "size-32 sm:size-44",
};

export function KoboMascot({
  mood = "idle",
  size = "md",
  className,
  speech,
  compact = false,
}: KoboMascotProps) {
  return (
    <div className={cn("relative inline-flex flex-col items-center gap-2 sm:gap-3", className)}>
      {speech && (
        <div
          className={cn(
            "relative max-w-[min(240px,calc(100vw-2rem))] animate-bounce-soft rounded-xl border-2 border-hairline-strong bg-paper px-3 py-2.5 text-center text-xs font-bold lowercase text-ink shadow-soft-lift sm:px-4 sm:py-3 sm:text-sm",
            compact && "hidden sm:block"
          )}
        >
          {speech}
          <span className="absolute -bottom-2 left-1/2 size-3 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-hairline-strong bg-paper" />
        </div>
      )}
      <div
        className={cn(
          sizes[size],
          "relative animate-float drop-shadow-md",
          mood === "celebrate" && "animate-wiggle",
          mood === "sad" && "opacity-90"
        )}
      >
        <KoboMark mood={mood} className="size-full" />
        {mood === "celebrate" && (
          <>
            <span className="absolute left-0 top-2 size-2 animate-sparkle rounded-full bg-accent-lime" />
            <span className="absolute right-0 top-1 size-1.5 animate-sparkle rounded-full bg-[#58cc02]" />
            <span className="absolute bottom-6 left-1 size-2 animate-sparkle rounded-sm bg-[#84d8ff]" />
          </>
        )}
      </div>
    </div>
  );
}
