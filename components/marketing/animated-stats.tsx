"use client";

import { useEffect, useRef, useState } from "react";

function parseStatValue(value: string): { prefix: string; number: number; suffix: string } {
  const match = value.match(/^([^0-9]*)([0-9,.]+)(.*)$/);
  if (!match) return { prefix: "", number: 0, suffix: value };
  return {
    prefix: match[1],
    number: parseFloat(match[2].replace(/,/g, "")),
    suffix: match[3],
  };
}

function formatCount(n: number, original: string): string {
  const parsed = parseStatValue(original);
  const hasDecimal = original.includes(".");
  const formatted = hasDecimal
    ? n.toFixed(1)
    : n >= 1000
      ? Math.round(n).toLocaleString("en-US")
      : Math.round(n).toString();
  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}

export function AnimatedStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const { number } = parseStatValue(value);
        const duration = 1400;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(formatCount(number * eased, value));
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-extrabold lowercase tracking-tight text-ink sm:text-5xl lg:text-6xl">
        {display}
      </p>
      <p className="mt-2 text-sm font-bold uppercase tracking-wide text-ink-soft sm:text-base">
        {label}
      </p>
    </div>
  );
}
