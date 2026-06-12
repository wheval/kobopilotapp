"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  LineChart,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { AppStatPills } from "@/components/app/app-ui";
import { Logo } from "@/components/marketing/site-chrome";
import { hapticPress } from "@/lib/haptics";
import { useProgressStore } from "@/lib/store/progress-store";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "home", icon: LayoutDashboard },
  { href: "/learn", label: "learn", icon: BookOpen },
  { href: "/practice", label: "practice", icon: LineChart },
];

const SIDEBAR_WIDTH = "16rem";

function DesktopSidebarToggle({ className }: { className?: string }) {
  const toggleDesktop = useSidebarStore((s) => s.toggleDesktop);
  const desktopOpen = useSidebarStore((s) => s.desktopOpen);

  return (
    <button
      type="button"
      onClick={() => {
        hapticPress();
        toggleDesktop();
      }}
      aria-label={desktopOpen ? "Close sidebar" : "Open sidebar"}
      aria-expanded={desktopOpen}
      className={cn(
        "micro-press flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-b-4 border-white/10 bg-white/10 text-on-ink transition-colors hover:bg-white/15 active:border-b-2",
        className
      )}
    >
      {desktopOpen ? (
        <PanelLeftClose className="size-5" aria-hidden />
      ) : (
        <PanelLeftOpen className="size-5" aria-hidden />
      )}
    </button>
  );
}

function MobileMenuToggle({ className }: { className?: string }) {
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);

  return (
    <button
      type="button"
      onClick={() => {
        hapticPress();
        toggleMobile();
      }}
      aria-label={mobileOpen ? "Close menu" : "Open menu"}
      aria-expanded={mobileOpen}
      className={cn(
        "micro-press flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-b-4 border-white/10 bg-white/10 text-on-ink transition-colors hover:bg-white/15 active:border-b-2",
        className
      )}
    >
      {mobileOpen ? (
        <PanelLeftClose className="size-5" aria-hidden />
      ) : (
        <PanelLeftOpen className="size-5" aria-hidden />
      )}
    </button>
  );
}

function SidebarNavLinks({
  pathname,
  onNavigate,
  tourTargets = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  tourTargets?: boolean;
}) {
  return (
    <>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => {
              hapticPress();
              onNavigate?.();
            }}
            data-tour={
              tourTargets
                ? href === "/learn"
                  ? "nav-learn"
                  : href === "/practice"
                    ? "nav-practice"
                    : undefined
                : undefined
            }
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl border-2 border-b-4 px-3 py-2.5 text-sm font-extrabold lowercase transition-all duration-100",
              "active:translate-y-0.5 active:border-b-2",
              active
                ? "border-b-[#46a302] bg-[#58cc02] text-white shadow-[0_2px_0_#46a302]"
                : "border-transparent border-b-transparent bg-primary/20 text-on-ink/80 hover:bg-primary/30"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{label}</span>
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
  const desktopOpen = useSidebarStore((s) => s.desktopOpen);
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const closeMobile = useSidebarStore((s) => s.closeMobile);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "app-sidebar-shell relative hidden shrink-0 overflow-hidden border-r-2 border-primary-deep bg-primary md:block",
          desktopOpen ? "w-64" : "w-0 border-r-transparent"
        )}
        aria-hidden={!desktopOpen}
      >
        <div
          className={cn(
            "app-sidebar-panel flex h-full flex-col",
            desktopOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
          )}
          style={{ width: SIDEBAR_WIDTH }}
        >
          <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-3">
            <Logo inverted />
            <DesktopSidebarToggle />
          </div>
          <div className="border-b border-white/10 p-4">
            <AppStatPills streak={streak} xp={xp} />
          </div>
          <nav className="flex flex-1 flex-col gap-2 p-4">
            <SidebarNavLinks pathname={pathname} tourTargets />
          </nav>
          <div className="border-t border-white/10 p-4">
            <p className="text-xs lowercase text-on-ink/60">
              guest mode · add a profile to share your card
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header
        className="fixed inset-x-0 top-0 z-40 border-b-2 border-primary-deep bg-primary md:hidden"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex h-14 items-center justify-between gap-2 px-3">
          <div className="flex min-w-0 items-center gap-2">
            <MobileMenuToggle />
            <Logo inverted compact />
          </div>
          <AppStatPills streak={streak} xp={xp} compact />
        </div>
      </header>

      {/* Mobile slide-out menu */}
      <div className="md:hidden">
        <div
          className={cn(
            "fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300 ease-out",
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          aria-hidden={!mobileOpen}
          onClick={closeMobile}
        />
        <aside
          className={cn(
            "app-sidebar-panel fixed inset-y-0 left-0 z-50 flex w-[min(18rem,calc(100vw-3rem))] flex-col border-r-2 border-primary-deep bg-primary shadow-card transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          aria-hidden={!mobileOpen}
        >
          <div className="flex h-14 items-center justify-between gap-2 border-b border-white/10 px-3">
            <Logo inverted compact />
            <MobileMenuToggle />
          </div>
          <div className="border-b border-white/10 p-4">
            <AppStatPills streak={streak} xp={xp} />
          </div>
          <nav className="flex flex-1 flex-col gap-2 overflow-y-auto overscroll-contain p-4">
            <SidebarNavLinks pathname={pathname} onNavigate={closeMobile} />
          </nav>
          <div
            className="border-t border-white/10 p-4"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <p className="text-xs lowercase text-on-ink/60">
              guest mode · add a profile to share your card
            </p>
          </div>
        </aside>
      </div>

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
                data-tour={
                  href === "/learn"
                    ? "nav-learn-tab"
                    : href === "/practice"
                      ? "nav-practice-tab"
                      : undefined
                }
                onClick={() => {
                  hapticPress();
                  closeMobile();
                }}
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
                      ? "scale-105 border-b-[#46a302] bg-[#d7ffb8] text-[#58cc02]"
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
  const desktopOpen = useSidebarStore((s) => s.desktopOpen);
  const openDesktop = useSidebarStore((s) => s.openDesktop);

  return (
    <header className="hidden h-16 items-center justify-between border-b-2 border-hairline bg-paper px-4 md:flex md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {!desktopOpen && (
          <button
            type="button"
            onClick={() => {
              hapticPress();
              openDesktop();
            }}
            aria-label="Open sidebar"
            className="micro-press flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-b-4 border-hairline-strong bg-paper text-ink transition-colors hover:bg-cloud active:border-b-2"
          >
            <PanelLeftOpen className="size-5" aria-hidden />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold lowercase text-[#58cc02]">
            kobopilot
          </h1>
          <p className="text-sm lowercase text-ink-soft">
            learn · practice · trade
          </p>
        </div>
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
