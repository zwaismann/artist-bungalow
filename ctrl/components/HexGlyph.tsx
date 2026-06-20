"use client";

import { forwardRef } from "react";
import { SECTIONS } from "@/lib/sections";
import { segmentPath, segmentCentroid, hexOutline, HEX_CENTER } from "@/lib/hex";

/**
 * The CTRL mark, rendered as six independent SVG wedges plus a hub.
 *
 * It is deliberately "dumb": it draws geometry and forwards interaction
 * events. All choreography (boot assembly, docking, hover-rotation,
 * expansion) is driven from the parent version via GSAP, which targets the
 * segments by the stable classes/attributes exposed here:
 *
 *   .hex-seg            every wedge <path>           (data-index, data-id)
 *   .hex-rotor          the rotating <g> group       (rotate the whole glyph)
 *   .hex-hub            the centre node
 *   .hex-outline        the full hexagon frame path
 *
 * The forwarded ref points at the root <svg> so a parent can scope a
 * gsap.context() to this instance.
 */

export type HexGlyphProps = {
  activeIndex?: number | null;
  hoverIndex?: number | null;
  onHover?: (i: number | null) => void;
  onSelect?: (i: number) => void;
  /** rotation in degrees applied to the rotor group (nav device uses this) */
  rotation?: number;
  /** show the thin outer frame */
  frame?: boolean;
  /** show the small segment index numerals on the wedges */
  numerals?: boolean;
  className?: string;
  /** disable transitions (parent drives motion via GSAP instead of CSS) */
  gsapDriven?: boolean;
  ariaLabel?: string;
};

const HexGlyph = forwardRef<SVGSVGElement, HexGlyphProps>(function HexGlyph(
  {
    activeIndex = null,
    hoverIndex = null,
    onHover,
    onSelect,
    rotation = 0,
    frame = true,
    numerals = false,
    className = "",
    gsapDriven = false,
    ariaLabel = "CTRL navigation glyph",
  },
  ref
) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      className={className}
      role="group"
      aria-label={ariaLabel}
      style={{ overflow: "visible" }}
    >
      {/* Rotor group — rotate this to bring a wedge to the top. */}
      <g
        className="hex-rotor"
        style={{
          transformOrigin: "50px 50px",
          transform: `rotate(${rotation}deg)`,
          transition: gsapDriven ? "none" : "transform 900ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {frame && (
          <path
            className="hex-outline"
            d={hexOutline(46)}
            fill="none"
            stroke="var(--grid)"
            strokeWidth={0.5}
          />
        )}

        {SECTIONS.map((s) => {
          const isActive = activeIndex === s.index;
          const isHover = hoverIndex === s.index;
          const lit = isActive || isHover;
          return (
            <path
              key={s.id}
              className="hex-seg"
              data-index={s.index}
              data-id={s.id}
              d={segmentPath(s.index)}
              role="button"
              tabIndex={onSelect ? 0 : -1}
              aria-label={`${s.num} ${s.label}`}
              aria-pressed={isActive}
              fill={lit ? "var(--orange)" : "var(--charcoal)"}
              stroke={lit ? "var(--orange)" : "rgba(232,221,199,0.25)"}
              strokeWidth={lit ? 0.8 : 0.5}
              style={{
                cursor: onSelect ? "pointer" : "default",
                transition: gsapDriven
                  ? "none"
                  : "fill 320ms ease, stroke 320ms ease, filter 320ms ease",
                filter: lit ? "drop-shadow(0 0 2.2px rgba(216,90,26,0.7))" : "none",
                outline: "none",
              }}
              onMouseEnter={() => onHover?.(s.index)}
              onMouseLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(s.index)}
              onClick={() => onSelect?.(s.index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.(s.index);
                }
              }}
            />
          );
        })}

        {numerals &&
          SECTIONS.map((s) => {
            const c = segmentCentroid(s.index, 30);
            return (
              <text
                key={`num-${s.id}`}
                x={c.x}
                y={c.y + 1.4}
                textAnchor="middle"
                fontSize={3.4}
                fill={activeIndex === s.index || hoverIndex === s.index ? "var(--black)" : "var(--paper)"}
                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em", pointerEvents: "none" }}
              >
                {s.num}
              </text>
            );
          })}

        {/* Centre hub — the "core". */}
        <circle
          className="hex-hub"
          cx={HEX_CENTER.x}
          cy={HEX_CENTER.y}
          r={2.4}
          fill="var(--orange)"
          style={{ filter: "drop-shadow(0 0 2px rgba(216,90,26,0.8))" }}
        />
      </g>
    </svg>
  );
});

export default HexGlyph;
