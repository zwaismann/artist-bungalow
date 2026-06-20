"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import HexGlyph from "@/components/HexGlyph";
import RadialLabels from "@/components/RadialLabels";
import { Chrome } from "@/components/Chrome";
import { GlyphBox } from "@/components/Stage";
import { SECTIONS } from "@/lib/sections";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * VERSION 02 — PHYSICAL DOCKING  (Gen A: faithful)
 *
 * Each wedge performs a spacecraft docking maneuver, modeled as five phases
 * inside a per-segment sub-timeline:
 *   approach  — long translate along the inbound vector (constant-ish speed)
 *   decel     — power4 ease-out into proximity, with a micro-rotation
 *   align     — last few units of travel, rotation zeroes out
 *   snap      — single-frame scale overshoot = the magnetic lock-in
 *   settle    — tiny damped counter-move, the mechanical "clunk"
 * A contact glow flashes on the segment at the snap frame.
 *
 * The whole thing is replayable via the DOCK button (rebuilds the timeline).
 */
export default function V02Docking() {
  const root = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const [nonce, setNonce] = useState(0);

  const build = useCallback(() => {
    const el = root.current;
    if (!el) return () => {};
    const ctx = gsap.context(() => {
      const segs = gsap.utils.toArray<SVGPathElement>(".hex-seg");

      if (reduced) {
        gsap.set([segs, ".hex-label", ".hex-outline"], { opacity: 1, clearProps: "transform" });
        return;
      }

      gsap.set(".hex-outline", { opacity: 0.001 });
      gsap.set(".hex-label", { opacity: 0 });

      const master = gsap.timeline();

      segs.forEach((seg, i) => {
        const ang = (-90 + 60 * i) * (Math.PI / 180);
        const dist = 120;
        gsap.set(seg, {
          opacity: 0,
          x: Math.cos(ang) * dist,
          y: Math.sin(ang) * dist,
          rotation: i % 2 === 0 ? 30 : -30,
          transformOrigin: "50px 50px",
        });

        const sub = gsap.timeline();
        sub
          // approach: become visible, cover most of the distance, linear-ish
          .to(seg, { opacity: 1, duration: 0.2 }, 0)
          .to(seg, {
            x: Math.cos(ang) * 24,
            y: Math.sin(ang) * 24,
            duration: 0.7,
            ease: "power1.in",
          }, 0)
          // decel + micro-rotation as it nears the port
          .to(seg, {
            x: Math.cos(ang) * 4,
            y: Math.sin(ang) * 4,
            rotation: i % 2 === 0 ? -3 : 3,
            duration: 0.55,
            ease: "power4.out",
          })
          // align: seat fully, rotation to zero
          .to(seg, { x: 0, y: 0, rotation: 0, duration: 0.28, ease: "power2.out" })
          // snap: magnetic lock-in overshoot
          .to(seg, { scale: 1.025, duration: 0.06, ease: "none", transformOrigin: "50px 50px" })
          // contact glow flash
          .to(seg, {
            filter: "drop-shadow(0 0 4px rgba(216,90,26,0.95))",
            duration: 0.06,
          }, "<")
          // settle: damped clunk back to rest
          .to(seg, { scale: 0.992, duration: 0.09 })
          .to(seg, { scale: 1, filter: "drop-shadow(0 0 0px rgba(216,90,26,0))", duration: 0.18 });

        master.add(sub, i * 0.28);
      });

      master.to(".hex-outline", { opacity: 1, duration: 0.5 }, ">-0.3");
      master.to(".hex-label", { opacity: 1, stagger: 0.07, duration: 0.5 }, ">-0.2");
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  useLayoutEffect(() => build(), [build, nonce]);

  return (
    <div ref={root} className="absolute inset-0">
      <Chrome active={hover != null ? SECTIONS[hover] : null} versionLabel="V02 · DOCKING" />

      <GlyphBox>
        <HexGlyph
          gsapDriven
          hoverIndex={hover}
          onHover={setHover}
          className="absolute inset-0 h-full w-full"
        />
        <RadialLabels hoverIndex={hover} onHover={setHover} radius={104} />
      </GlyphBox>

      {!reduced && (
        <button
          onClick={() => setNonce((n) => n + 1)}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 border border-paper/30 px-4 py-2 font-mono text-[10px] uppercase tracking-widest2 text-paper transition-colors hover:border-orange hover:text-orange"
        >
          ⟲ RUN DOCK SEQUENCE
        </button>
      )}
    </div>
  );
}
