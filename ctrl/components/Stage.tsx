"use client";

import { useEffect } from "react";

/** Centers a square "glyph box" in the viewport stage. The box is the shared
 *  coordinate frame for the glyph + its ring of labels. */
export function GlyphBox({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className={`relative aspect-square w-[min(60vw,34vh,640px)] -translate-y-[12vh] sm:w-[min(68vw,60vh,520px)] sm:translate-y-0 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

/** Binds Escape to a handler while mounted (returns-to-glyph rule). */
export function useEscape(handler: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handler, active]);
}
