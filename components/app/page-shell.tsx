import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl";
};

const sizeClass = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-6xl",
} as const;

/** Consistent horizontal padding so content never hugs the screen edge. */
export function PageShell({
  children,
  className,
  size = "lg",
}: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 max-w-full space-y-6 px-4 py-4 sm:px-6 sm:py-6",
        sizeClass[size],
        className
      )}
    >
      {children}
    </div>
  );
}
