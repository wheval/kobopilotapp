"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Fixed action bar above the mobile tab bar */
export function MobileStickyCta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 z-30 border-t-2 border-hairline-strong bg-paper/95 p-4 backdrop-blur-md md:hidden",
        "bottom-[calc(var(--app-tabbar-h)+env(safe-area-inset-bottom,0px))]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function MobileScrollSpacer() {
  return <div className="h-24 md:hidden" aria-hidden />;
}
