"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  LineChart,
} from "lucide-react";

import { AppStatPills } from "@/components/app/app-ui";
import { Logo } from "@/components/marketing/site-chrome";
import { hapticPress } from "@/lib/haptics";
import { useProgressStore } from "@/lib/store/progress-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "home", icon: LayoutDashboard },
  { href: "/learn", label: "learn", icon: BookOpen },
  { href: "/practice", label: "practice", icon: LineChart },
];

function SidebarNavLinks({ pathname }: { pathname: string }) {
  return (
    <>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            data-tour={href === "/learn" ? "nav-learn" : href === "/practice" ? "nav-practice" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl border-2 border-b-4 px-3 py-2.5 text-sm font-extrabold lowercase transition-all duration-100",
              "active:translate-y-0.5 active:border-b-2",
              active
                ? "border-b-[#46a302] bg-[#58cc02] text-white shadow-[0_2px_0_#46a302]"
                : "border-transparent border-b-transparent bg-primary/20 text-on-ink/80 hover:bg-primary/30"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r-2 border-primary-deep bg-primary md:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-4">
          <Logo inverted />
        </div>
        <div className="border-b border-white/10 p-4">
          <AppStatPills streak={streak} xp={xp} />
        </div>
        <nav className="flex flex-1 flex-col gap-2 p-4">
          <SidebarNavLinks pathname={pathname} />
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="text-xs lowercase text-on-ink/60">
            guest mode · progress saved on this device
          </p>
        </div>
      </aside>

      {/* Mobile top bar — logo + stats only (Duolingo-style) */}
      <header
        className="fixed inset-x-0 top-0 z-40 border-b-2 border-primary-deep bg-primary md:hidden"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex h-14 items-center justify-between gap-2 px-3">
          <Logo inverted compact />
          <AppStatPills streak={streak} xp={xp} compact />
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-hairline-strong bg-paper md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Main navigation"
      >
        <div className="flex h-[var(--app-tabbar-h)] items-stretch">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                data-tour={href === "/learn" ? "nav-learn" : href === "/practice" ? "nav-practice" : undefined}
                onClick={() => hapticPress()}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 px-1",
                  "text-[10px] font-extrabold uppercase touch-manipulation",
                  "active:opacity-80",
                  active ? "text-[#58cc02]" : "text-ink-soft"
                )}
              >
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl border-2 border-b-4 transition-all duration-100",
                    active
                      ? "border-b-[#46a302] bg-[#d7ffb8] text-[#58cc02]"
                      : "border-transparent border-b-transparent bg-transparent",
                    "active:translate-y-0.5 active:border-b-2"
                  )}
                >
                  <Icon className="size-6" strokeWidth={active ? 2.5 : 2} />
                </span>
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function AppTopBar() {
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);

  return (
    <header className="hidden h-16 items-center justify-between border-b-2 border-hairline bg-paper px-6 md:flex">
      <div>
        <h1 className="text-lg font-extrabold lowercase text-[#58cc02]">
          kobopilot
        </h1>
        <p className="text-sm lowercase text-ink-soft">
          learn · practice · trade
        </p>
      </div>
      <div className="flex items-center gap-3">
        <AppStatPills streak={streak} xp={xp} compact />
        <span className="rounded-xl border-2 border-b-4 border-[#46a302] bg-[#d7ffb8] px-3 py-1.5 text-xs font-extrabold uppercase text-[#58cc02]">
          paper mode
        </span>
      </div>
    </header>
  );
}
