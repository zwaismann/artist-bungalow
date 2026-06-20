"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import HexGlyph from "@/components/HexGlyph";
import RadialLabels from "@/components/RadialLabels";
import { Chrome } from "@/components/Chrome";
import { GlyphBox } from "@/components/Stage";
import { SECTIONS } from "@/lib/sections";
import { segmentCentroid, hexOutline } from "@/lib/hex";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * VERSION 07 — AEROSPACE GRAPHICS  (Gen C: cinematic overlays)
 *
 * Animation architecture
 * ----------------------
 * The resting state is deliberately bare: just the glyph + labels. All the
 * engineering apparatus lives in an overlay <g class="overlay"> that is
 * invisible at rest. Whenever the focused section changes, a GSAP timeline:
 *   - blooms in orbital ellipses, a coordinate crosshair and a corner reticle
 *   - draws a vector arrow from centre toward the focused wedge (strokeDashoffset)
 *   - counts an "ALIGNMENT" readout 0 → 100%
 *   - holds briefly, then decays the whole overlay back to nothing (~1s)
 * so the apparatus is felt during the transition but never clutters the rest.
 */
export default function V07Aerospace() {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [pct, setPct] = useState(0);
  const reduced = useReducedMotion();

  // run the overlay flourish whenever focus changes
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || focus == null) return;
    const ctx = gsap.context(() => {
      tlRef.current?.kill();
      const counter = { v: 0 };
      const tl = gsap.timeline();
      tlRef.current = tl;

      if (reduced) {
        gsap.set(".overlay", { opacity: 1 });
        setPct(100);
        gsap.to(".overlay", { opacity: 0, duration: 0.3, delay: 0.6 });
        return;
      }

      gsap.set(".overlay", { opacity: 1 });
      gsap.set(".ovl-orbit", { scale: 0.82, opacity: 0, transformOrigin: "50px 50px" });
      gsap.set(".ovl-vector", { strokeDashoffset: 60 });
      gsap.set(".ovl-reticle", { opacity: 0, rotate: -20, transformOrigin: "50px 50px" });
      gsap.set(".ovl-cross", { opacity: 0 });

      tl.to(".ovl-orbit", { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.06 })
        .to(".ovl-cross", { opacity: 1, duration: 0.3 }, "<")
        .to(".ovl-reticle", { opacity: 1, rotate: 0, duration: 0.5, ease: "power2.out" }, "<")
        .to(".ovl-vector", { strokeDashoffset: 0, duration: 0.5, ease: "power2.inOut" }, "<0.1")
        .to(counter, { v: 100, duration: 0.7, ease: "power1.out", onUpdate: () => setPct(Math.round(counter.v)) }, "<")
        // hold, then decay back to clean minimalism
        .to(".overlay", { opacity: 0, duration: 0.8, ease: "power2.in" }, "+=0.5");
    }, el);
    return () => ctx.revert();
  }, [focus, reduced]);

  // vector arrow endpoint = centroid of focused wedge
  const tip = focus != null ? segmentCentroid(focus, 30) : { x: 50, y: 8 };

  return (
    <div
      ref={root}
      className="absolute inset-0 bg-grid"
      // calmer resting state: a fainter coordinate grid so the apparatus reads
      // as a quiet backdrop until the overlay flourish brings it forward
      style={{ ["--grid" as string]: "rgba(232,221,199,0.06)" }}
    >
      <Chrome active={focus != null ? SECTIONS[focus] : null} versionLabel="V07 · AEROSPACE" />

      <GlyphBox>
        {/* transient engineering overlay (invisible at rest) */}
        <svg viewBox="0 0 100 100" className="overlay pointer-events-none absolute inset-0 h-full w-full opacity-0" aria-hidden style={{ overflow: "visible" }}>
          {/* orbital ellipses */}
          <ellipse className="ovl-orbit" cx="50" cy="50" rx="48" ry="48" fill="none" stroke="var(--dim-orange)" strokeWidth="0.3" />
          <ellipse className="ovl-orbit" cx="50" cy="50" rx="48" ry="20" fill="none" stroke="var(--grid)" strokeWidth="0.3" />
          <ellipse className="ovl-orbit" cx="50" cy="50" rx="20" ry="48" fill="none" stroke="var(--grid)" strokeWidth="0.3" />
          {/* coordinate crosshair */}
          <g className="ovl-cross" stroke="var(--grid)" strokeWidth="0.3">
            <line x1="2" y1="50" x2="98" y2="50" />
            <line x1="50" y1="2" x2="50" y2="98" />
          </g>
          {/* corner reticle */}
          <path className="ovl-reticle" d={hexOutline(49)} fill="none" stroke="var(--orange)" strokeWidth="0.4" strokeDasharray="3 4" />
          {/* vector arrow centre → focused wedge */}
          <line className="ovl-vector" x1="50" y1="50" x2={tip.x} y2={tip.y} stroke="var(--orange)" strokeWidth="0.6" strokeDasharray="60" markerEnd="url(#arrow)" />
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--orange)" />
            </marker>
          </defs>
        </svg>

        <HexGlyph hoverIndex={focus} onHover={setFocus} onSelect={() => {}} breatheHub className="absolute inset-0 h-full w-full" />
        <RadialLabels hoverIndex={focus} onHover={setFocus} radius={104} />
      </GlyphBox>

      {/* alignment readout + data bars */}
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 space-y-2 font-mono text-[10px] uppercase tracking-widest2 text-paper/70 sm:right-8">
        <div className="text-orange">ALIGNMENT {pct.toString().padStart(3, "0")}%</div>
        <div className="h-1 w-28 bg-charcoal">
          <div className="h-full bg-orange transition-[width] duration-100" style={{ width: `${pct}%` }} />
        </div>
        {focus != null && (
          <>
            <div>SYS {SECTIONS[focus].telemetry.sys}</div>
            <div>VEC {SECTIONS[focus].telemetry.vector}</div>
          </>
        )}
      </div>
    </div>
  );
}
