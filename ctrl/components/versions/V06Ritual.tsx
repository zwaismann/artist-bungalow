"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import HexGlyph from "@/components/HexGlyph";
import RadialLabels from "@/components/RadialLabels";
import { Chrome } from "@/components/Chrome";
import { GlyphBox } from "@/components/Stage";
import { BRAND, SECTIONS } from "@/lib/sections";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * VERSION 06 — RITUAL ENTRY  (Gen C: cinematic)
 *
 * Three phases: `gate` → `booting` → `active`.
 *   gate    : near-black screen, breathing orange cursor, "PRESS ENTER".
 *             Enter / click / tap all arm the system.
 *   booting : a GSAP timeline floods the field, assembles the wedges from the
 *             centre outward, then hands off.
 *   active  : the interface is live (glyph + labels respond to hover).
 *
 * Reduced motion jumps straight from gate to active on arm.
 */
type Phase = "gate" | "booting" | "active";

export default function V06Ritual() {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("gate");
  const [hover, setHover] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const arm = useCallback(() => {
    if (phaseRef.current !== "gate") return;
    setPhase(reduced ? "active" : "booting");
  }, [reduced]);

  // global Enter handler while gated
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && phaseRef.current === "gate") arm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [arm]);

  // boot timeline
  useLayoutEffect(() => {
    if (phase !== "booting") return;
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.set(".hex-hub", { opacity: 0, scale: 0.2, transformOrigin: "50px 50px" });
      gsap.set(".hex-outline", { opacity: 0 });
      gsap.set(".hex-label", { opacity: 0, scale: 0.9 });
      const segs = gsap.utils.toArray<SVGPathElement>(".hex-seg");
      segs.forEach((seg) => {
        gsap.set(seg, { opacity: 0, scale: 0.3, transformOrigin: "50px 50px" });
      });

      const tl = gsap.timeline({ onComplete: () => setPhase("active") });
      tl.to(".ritual-flood", { opacity: 1, duration: 0.25 })
        .to(".hex-hub", { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" })
        .to(".ritual-flood", { opacity: 0, duration: 0.6 }, "<")
        .to(
          segs,
          { opacity: 1, scale: 1, duration: 0.8, ease: "power4.out", stagger: { each: 0.09, from: "center" } },
          "-=0.2"
        )
        .to(".hex-outline", { opacity: 1, duration: 0.5 }, "-=0.3")
        .to(".hex-label", { opacity: 1, scale: 1, duration: 0.5, stagger: 0.07 }, "-=0.2");
    }, el);
    return () => ctx.revert();
  }, [phase]);

  return (
    <div
      ref={root}
      className="absolute inset-0 bg-black"
      onClick={arm}
      role="button"
      tabIndex={0}
      aria-label="Press Enter to initialize the CTRL system"
      onKeyDown={(e) => {
        if (e.key === " ") arm();
      }}
    >
      {/* white-ish flood used during boot hand-off */}
      <div className="ritual-flood pointer-events-none absolute inset-0 z-10 opacity-0" style={{ background: "radial-gradient(circle at center, rgba(216,90,26,0.16), rgba(13,13,11,0) 60%)" }} />

      {phase === "gate" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center">
          <div className="font-mono text-[11px] uppercase tracking-widest2 text-paper/60">
            {BRAND.name}
          </div>
          <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-widest2 text-orange">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-orange" />
            PRESS ENTER TO INITIALIZE
            <span className="cursor-blink">▍</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-paper/30">
            [ click / tap / enter ]
          </div>
        </div>
      ) : (
        <>
          <Chrome active={hover != null ? SECTIONS[hover] : null} versionLabel="V06 · RITUAL" />
          <GlyphBox>
            <HexGlyph
              gsapDriven={phase === "booting"}
              hoverIndex={hover}
              onHover={phase === "active" ? setHover : undefined}
              onSelect={phase === "active" ? () => {} : undefined}
              className="absolute inset-0 h-full w-full"
            />
            <RadialLabels
              hoverIndex={hover}
              onHover={phase === "active" ? setHover : undefined}
              radius={104}
            />
          </GlyphBox>
        </>
      )}
    </div>
  );
}
