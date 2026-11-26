"use client";

import Link from "next/link";
import { type ComponentProps, type ReactNode } from "react";

import { hapticPress, hapticTap } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type DuoButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger";

const variantStyles: Record<
  DuoButtonVariant,
  { face: string; shadow: string; text: string }
> = {
  primary: {
    face: "bg-primary hover:brightness-110",
    shadow: "border-b-primary-deep",
    text: "text-on-primary",
  },
  secondary: {
    face: "bg-cloud hover:bg-hairline",
    shadow: "border-b-hairline-strong",
    text: "text-ink",
  },
  ghost: {
    face: "bg-paper hover:bg-cloud",
    shadow: "border-b-hairline-strong",
    text: "text-ink",
  },
  success: {
    face: "bg-[#58cc02] hover:brightness-110",
    shadow: "border-b-[#46a302]",
    text: "text-white",
  },
  danger: {
    face: "bg-destructive hover:brightness-110",
    shadow: "border-b-[#8b1220]",
    text: "text-white",
  },
};

type DuoButtonProps = {
  variant?: DuoButtonVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  href?: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<"button">, "children">;

export function DuoButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  href,
  children,
  className,
  onClick,
  disabled,
  ...props
}: DuoButtonProps) {
  const styles = variantStyles[variant];

  const sizeClass =
    size === "sm"
      ? "min-h-11 px-4 text-sm"
      : size === "lg"
        ? "min-h-14 px-6 text-base sm:min-h-14 sm:px-8 sm:text-lg"
        : "min-h-12 px-5 text-base";

  const classes = cn(
    "duo-btn inline-flex items-center justify-center gap-2 rounded-xl border-b-4 font-extrabold uppercase tracking-wide transition-[transform,border-bottom-width,filter] duration-100 select-none touch-manipulation",
    "active:translate-y-0.5 active:border-b-2 disabled:pointer-events-none disabled:opacity-50",
    styles.face,
    styles.shadow,
    styles.text,
    sizeClass,
    fullWidth && "w-full",
    className
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    hapticTap();
    onClick?.(e);
  };

  // In-page anchors stay plain <a>: next/link scrolls hashes itself, which
  // bypasses the landing page's smooth scroller (Lenis) and lands off-target.
  if (href?.startsWith("#") && !disabled) {
    return (
      <a href={href} className={classes} onClick={() => hapticTap()}>
        {children}
      </a>
    );
  }

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} onClick={() => hapticTap()}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export type DuoSelectState = "idle" | "selected" | "correct" | "wrong" | "disabled";

type DuoSelectButtonProps = {
  children: ReactNode;
  state?: DuoSelectState;
  index?: number;
  fullWidth?: boolean;
  className?: string;
  onSelect?: () => void;
};

export function DuoSelectButton({
  children,
  state = "idle",
  index = 0,
  fullWidth = true,
  className,
  onSelect,
}: DuoSelectButtonProps) {
  const isLocked = state === "correct" || state === "wrong" || state === "disabled";

  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={() => {
        if (isLocked) return;
        hapticPress();
        onSelect?.();
      }}
      style={{ animationDelay: `${index * 60}ms` }}
      className={cn(
        "duo-select animate-fade-up min-h-[52px] rounded-xl border-2 border-b-4 px-4 py-3.5 text-left text-base font-bold text-ink transition-[transform,border-color,background-color,border-bottom-width] duration-100 touch-manipulation sm:py-4",
        "active:translate-y-0.5 active:border-b-2",
        fullWidth && "w-full",
        state === "idle" &&
          "border-hairline-strong border-b-hairline-strong bg-paper hover:bg-cloud",
        state === "selected" &&
          "border-[#84d8ff] border-b-[#84d8ff] bg-[#ddf4ff]",
        state === "correct" &&
          "duo-select-correct border-success border-b-success bg-[#d7ffb8] text-success",
        state === "wrong" &&
          "duo-select-wrong border-destructive border-b-destructive bg-[#ffdfe0] text-destructive animate-shake",
        state === "disabled" && "opacity-40",
        className
      )}
    >
      {children}
    </button>
  );
}
