"use client";

import { useEffect, useState } from "react";

/**
 * Tracks prefers-reduced-motion. Every version reads this and, when true,
 * collapses choreography to instant/cross-fade states. Returns `true` until
 * mounted-as-false to keep SSR output static and avoid hydration flashes.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
