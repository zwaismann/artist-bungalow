"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import HexGlyph from "@/components/HexGlyph";
import { Chrome } from "@/components/Chrome";
import { GlyphBox } from "@/components/Stage";
import { SECTIONS } from "@/lib/sections";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * VERSION 03 — ORBITING LABELS  (Gen B: minimal)
 *
 * Animation architecture
 * ----------------------
 * The glyph is dead still. The labels are satellites on an invisible ring.
 * A single proxy value `orbit.r` is tweened (140s / revolution, linear) and
 * on every frame we recompute each label's absolute position from
 *   angle = base[i] + r
 * Positioning (rather than rotating) the elements keeps the text upright with
 * no counter-rotation needed.
 *
 * Selecting a label kills the continuous spin and eases the ring so that the
 * chosen satellite drifts to the priority slot (top, -90°). Deselecting
 * resumes the slow drift from wherever it rests. The motion is intentionally
 * almost-still: alive, never busy.
 */
export default function V03Orbit() {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const orbit = useRef({ r: 0 });
  const spin = useRef<gsap.core.Tween | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();

  // place labels for a given ring rotation r (degrees)
  const apply = () => {
    const r = orbit.current.r;
    const radiusPct = 64; // % of half-box
    labelRefs.current.forEach((node, i) => {
      if (!node) return;
      const a = ((-90 + 60 * i + r) * Math.PI) / 180;
      const x = 50 + radiusPct * Math.cos(a);
      const y = 50 + radiusPct * Math.sin(a);
      node.style.left = `${x}%`;
      node.style.top = `${y}%`;
    });
  };

  const startDrift = () => {
    spin.current?.kill();
    spin.current = gsap.to(orbit.current, {
      r: "+=360",
      duration: 140,
      ease: "none",
      repeat: -1,
      onUpdate: apply,
    });
  };

  useLayoutEffect(() => {
    apply();
    if (reduced) return; // static ring, no drift
    startDrift();
    return () => {
      spin.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const select = (i: number) => {
    setActive(i);
    if (reduced) {
      // snap selected to top without animation
      orbit.current.r = -60 * i; // base[i]+r ≡ -90 (top) ⇒ r = -60i
      apply();
      return;
    }
    spin.current?.kill();
    // we want base[i] + r ≡ -90 (top). base[i] = -90 + 60i, so r ≡ -60i (mod 360)
    const current = orbit.current.r;
    const target = -60 * i;
    // choose the nearest equivalent angle so it drifts the short way
    const k = Math.round((current - target) / 360);
    gsap.to(orbit.current, {
      r: target + k * 360,
      duration: 2.4,
      ease: "power2.inOut",
      onUpdate: apply,
    });
  };

  const clear = () => {
    setActive(null);
    if (!reduced) startDrift();
  };

  return (
    <div ref={root} className="absolute inset-0">
      <Chrome
        active={active != null ? SECTIONS[active] : hover != null ? SECTIONS[hover] : null}
        versionLabel="V03 · ORBIT"
      />

      <GlyphBox>
        {/* faint orbital rings */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          <circle cx="50" cy="50" r="41" fill="none" stroke="var(--grid)" strokeWidth="0.3" />
        </svg>

        <HexGlyph hoverIndex={hover} activeIndex={active} breatheHub className="absolute inset-0 h-full w-full" />

        <div ref={ring} className="absolute inset-0">
          {SECTIONS.map((s, i) => {
            const lit = active === s.index || hover === s.index;
            return (
              <button
                key={s.id}
                ref={(n) => {
                  labelRefs.current[i] = n;
                }}
                onMouseEnter={() => setHover(s.index)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(s.index)}
                onClick={() => (active === s.index ? clear() : select(s.index))}
                className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest2 transition-colors duration-500 sm:text-[11px]"
                style={{ color: lit ? "var(--orange)" : "var(--ivory)" }}
              >
                <span style={{ color: lit ? "var(--orange)" : "var(--dim-orange)" }}>{s.num} </span>
                {s.label}
              </button>
            );
          })}
        </div>
      </GlyphBox>

      <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest2 text-paper/40">
        {active != null ? "[ select again to release orbit ]" : "[ select a satellite ]"}
      </div>
    </div>
  );
}
