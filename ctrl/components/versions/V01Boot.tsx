"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import HexGlyph from "@/components/HexGlyph";
import RadialLabels from "@/components/RadialLabels";
import { Chrome } from "@/components/Chrome";
import { GlyphBox } from "@/components/Stage";
import { SECTIONS } from "@/lib/sections";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * VERSION 01 — BOOT SEQUENCE  (Gen C: cinematic)
 *
 * Animation architecture
 * ----------------------
 * One master GSAP timeline (`tl`) owns the whole power-on:
 *   1. core dot fades up and pulses
 *   2. boot lines reveal one character-set at a time (steps tween on width)
 *   3. the six wedges fly in, each from its own vector, and lock with a snap
 *   4. the labels fade up around the assembled glyph
 *
 * The timeline is built inside a gsap.context scoped to this component so
 * selectors stay local and cleanup is automatic. Clicking / any key seeks the
 * timeline to the end (skip). prefers-reduced-motion renders the final state
 * with no timeline at all.
 */

const BOOT_LINES = [
  "CTRL SYSTEMS",
  "INITIALIZING…",
  "ALIGNING NODES…",
  "CALIBRATING INTERFACE…",
];

export default function V01Boot() {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([".hex-seg", ".hex-label", ".boot-line", ".hex-hub", ".hex-outline"], {
          opacity: 1,
          clearProps: "transform",
        });
        gsap.set(".boot-line span", { width: "100%" });
        setDone(true);
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setDone(true),
      });
      tlRef.current = tl;

      // initial hidden states
      gsap.set(".hex-outline", { opacity: 0 });
      gsap.set(".hex-hub", { opacity: 0, scale: 0.4, transformOrigin: "50px 50px" });
      gsap.set(".hex-label", { opacity: 0, y: 6 });
      gsap.set(".boot-line span", { width: 0 });
      // each wedge parked along its outward vector, slightly rotated
      gsap.utils.toArray<SVGPathElement>(".hex-seg").forEach((seg, i) => {
        const ang = (-90 + 60 * i) * (Math.PI / 180);
        gsap.set(seg, {
          opacity: 0,
          x: Math.cos(ang) * 60,
          y: Math.sin(ang) * 60,
          rotation: i % 2 === 0 ? 22 : -22,
          scale: 0.8,
          transformOrigin: "50px 50px",
        });
      });

      // 1. core
      tl.to(".hex-hub", { opacity: 1, scale: 1, duration: 0.6 }, 0.2);

      // 2. boot lines type in (width reveal = monospace "teletype")
      BOOT_LINES.forEach((_, i) => {
        tl.to(`.boot-line-${i} span`, { width: "100%", duration: 0.5, ease: "steps(18)" }, 0.5 + i * 0.45);
      });

      // 3. wedges dock in, staggered, with a decelerate + tiny settle
      tl.addLabel("assemble", "+=0.15");
      gsap.utils.toArray<SVGPathElement>(".hex-seg").forEach((seg, i) => {
        tl.to(
          seg,
          { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.9, ease: "power4.out" },
          `assemble+=${i * 0.12}`
        )
          // lock-in snap: a single-frame overshoot then settle
          .to(seg, { scale: 1.015, duration: 0.06 }, `assemble+=${i * 0.12 + 0.9}`)
          .to(seg, { scale: 1, duration: 0.12 }, `assemble+=${i * 0.12 + 0.96}`);
      });
      tl.to(".hex-outline", { opacity: 1, duration: 0.6 }, "assemble+=0.4");

      // 4. labels settle in
      tl.to(".hex-label", { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, ">-0.1");
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  const skip = () => {
    if (tlRef.current && tlRef.current.progress() < 1) {
      tlRef.current.progress(1);
    }
  };

  return (
    <div
      ref={root}
      className="absolute inset-0"
      onClick={skip}
      role="presentation"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") skip();
      }}
    >
      <Chrome active={hover != null ? SECTIONS[hover] : null} versionLabel="V01 · BOOT" />

      <GlyphBox>
        <HexGlyph
          gsapDriven
          hoverIndex={hover}
          onHover={setHover}
          className="absolute inset-0 h-full w-full"
        />
        <RadialLabels hoverIndex={hover} onHover={setHover} radius={104} />
      </GlyphBox>

      {/* boot console — hidden once assembly completes */}
      {!done && (
        <div className="pointer-events-none absolute left-1/2 top-[calc(50%+min(39vw,39vh,320px)+28px)] -translate-x-1/2 -translate-y-1/2 space-y-1 text-center">
          {BOOT_LINES.map((line, i) => (
            <div
              key={i}
              className={`boot-line boot-line-${i} font-mono text-[11px] uppercase tracking-widest2 ${
                i === 0 ? "text-orange" : "text-paper/80"
              }`}
            >
              <span className="inline-block overflow-hidden whitespace-nowrap align-bottom">
                {line}
              </span>
            </div>
          ))}
        </div>
      )}

      {!done && !reduced && (
        <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest2 text-paper/40">
          [ click / space to skip ]
        </div>
      )}
    </div>
  );
}
