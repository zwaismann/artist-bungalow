"use client";

import { forwardRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SECTIONS } from "@/lib/sections";

/**
 * Section labels.
 *
 * DESKTOP — six labels arranged on a ring around the glyph. Each label sits at
 * the outward bearing of its wedge (wedge 0 at top, winding clockwise) so the
 * label and its segment agree spatially. Percentage positioning scales with the
 * container; each <li> carries `.hex-label` + data-index for GSAP boot staggers.
 *
 * MOBILE — the radial ring would overflow a narrow viewport, so the brief asks
 * for "a central glyph with labels in a vertical selector". That selector is
 * portalled to <body> so it is anchored to the VIEWPORT, not to the (shifted,
 * transformed) glyph box it would otherwise inherit from.
 */
export type RadialLabelsProps = {
  hoverIndex?: number | null;
  activeIndex?: number | null;
  onHover?: (i: number | null) => void;
  onSelect?: (i: number) => void;
  /** ring radius as a percentage of half the box (0..100) */
  radius?: number;
  className?: string;
};

const RadialLabels = forwardRef<HTMLUListElement, RadialLabelsProps>(function RadialLabels(
  { hoverIndex = null, activeIndex = null, onHover, onSelect, radius = 86, className = "" },
  ref
) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mobileSelector = (
    <ul className="pointer-events-none fixed inset-x-0 bottom-9 z-40 flex flex-col items-center gap-2.5 sm:hidden">
      {SECTIONS.map((s) => {
        const lit = activeIndex === s.index || hoverIndex === s.index;
        return (
          <li key={`m-${s.id}`}>
            <button
              onClick={() => onSelect?.(s.index)}
              onMouseEnter={() => onHover?.(s.index)}
              onFocus={() => onHover?.(s.index)}
              className="pointer-events-auto flex w-44 items-center gap-2 font-mono text-[12px] uppercase tracking-widest"
              style={{ color: lit ? "var(--orange)" : "var(--ivory)" }}
            >
              <span
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  background: lit ? "var(--orange)" : "transparent",
                  boxShadow: lit ? "0 0 5px var(--orange)" : "none",
                  outline: "1px solid var(--dim-orange)",
                }}
              />
              <span style={{ color: lit ? "var(--orange)" : "var(--dim-orange)" }}>{s.num}</span>
              <span className={lit ? "text-orange" : "text-ivory/90"}>{s.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {mounted && createPortal(mobileSelector, document.body)}

      {/* DESKTOP: the radial ring. */}
      <ul
        ref={ref}
        className={`pointer-events-none absolute inset-0 hidden sm:block ${className}`}
        aria-label="Sections"
      >
        {SECTIONS.map((s) => {
          // bearing for wedge i: -90 + 60i degrees (top, clockwise)
          const angle = (-90 + 60 * s.index) * (Math.PI / 180);
          const left = 50 + (radius / 2) * Math.cos(angle);
          const top = 50 + (radius / 2) * Math.sin(angle);
          const lit = activeIndex === s.index || hoverIndex === s.index;
          return (
            <li
              key={s.id}
              className="hex-label absolute -translate-x-1/2 -translate-y-1/2"
              data-index={s.index}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <button
                onMouseEnter={() => onHover?.(s.index)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(s.index)}
                onClick={() => onSelect?.(s.index)}
                className="pointer-events-auto flex items-center gap-1.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest2 transition-colors duration-300 sm:text-[11px]"
                style={{ color: lit ? "var(--orange)" : "var(--paper)" }}
              >
                <span style={{ color: lit ? "var(--orange)" : "var(--dim-orange)" }}>{s.num}</span>
                <span className={lit ? "text-orange" : "text-ivory/80"}>{s.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
});

export default RadialLabels;
