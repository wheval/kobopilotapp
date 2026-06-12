import Link from "next/link";

import { KoboMark } from "@/components/mascot/kobo-mark";
import { DuoButton } from "@/components/ui/duo-button";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Hide wordmark for tight spaces (e.g. mobile sidebar) */
  compact?: boolean;
  /** Light wordmark for dark backgrounds */
  inverted?: boolean;
};

export function Logo({ className, compact = false, inverted = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5", className)}
      aria-label="kobopilot home"
    >
      <KoboMark variant="head" mood="happy" className="size-10 sm:size-11" />
      {!compact && (
        <span
          className={cn(
            "text-xl font-extrabold lowercase tracking-tight sm:text-2xl",
            inverted ? "text-[#58cc02]" : "text-[#58cc02]"
          )}
        >
          kobopilot
        </span>
      )}
    </Link>
  );
}

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-hairline bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-2 md:flex">
          <a
            href="#features"
            className="rounded-lg px-3 py-2 text-sm font-bold lowercase text-ink-soft transition-colors hover:bg-cloud hover:text-ink"
          >
            features
          </a>
          <a
            href="#how-it-works"
            className="rounded-lg px-3 py-2 text-sm font-bold lowercase text-ink-soft transition-colors hover:bg-cloud hover:text-ink"
          >
            how it works
          </a>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <DuoButton
            href="/learn"
            variant="ghost"
            size="sm"
            className="hidden min-w-0 sm:inline-flex"
          >
            browse
          </DuoButton>
          <DuoButton href="/dashboard" size="sm" variant="success">
            start
          </DuoButton>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t-2 border-hairline bg-ink text-on-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Logo inverted />
        <p className="max-w-md text-sm lowercase text-ink-soft">
          learn trading like a game. paper mode only — no real money at risk.
        </p>
        <p className="text-xs lowercase text-ink-soft">
          © {new Date().getFullYear()} kobopilot
        </p>
      </div>
    </footer>
  );
}
