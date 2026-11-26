"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

/**
 * Inertia ("buttery") scrolling for the landing page only.
 * Skipped entirely for visitors who prefer reduced motion.
 * In-page links (#path, #try, …) glide too and land just below the sticky nav.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      // sections already set scroll-margin-top for the sticky nav; Lenis honours it
      anchors: true,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
