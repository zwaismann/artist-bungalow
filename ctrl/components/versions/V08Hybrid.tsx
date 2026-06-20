"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import HexGlyph from "@/components/HexGlyph";
import RadialLabels from "@/components/RadialLabels";
import { Chrome } from "@/components/Chrome";
import { SectionPanel } from "@/components/SectionPanel";
import { SelectorReadout } from "@/components/SelectorReadout";
import { GlyphBox, useEscape } from "@/components/Stage";
import { BRAND, SECTIONS } from "@/lib/sections";
import { rotationToTop, hexOutline } from "@/lib/hex";
import { useLab } from "@/lib/store";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * VERSION 08 — BEST HYBRID  ★ recommended final candidate
 *
 * The synthesis of the strongest moves, each tuned DOWN so the composite
 * stays calm:
 *   · RITUAL ENTRY (V06)      — gate → arm
 *   · BOOT + DOCKING (V01/02) — wedges dock in from their vectors on arm
 *   · NAVIGATION DEVICE (V05) — hover rotates the focused wedge to top; click
 *                               commits and parks the glyph aside
 *   · AEROSPACE OVERLAY (V07) — a brief reticle + alignment count on commit
 *   · CRT VEIL (V04)          — faint, master-toggled grain/scanline/bloom
 *
 * Phases: gate → booting → active. See per-block comments for the timelines.
 */
type Phase = "gate" | "booting" | "active";

export default function V08Hybrid() {
  const root = useRef<HTMLDivElement>(null);
  const boxWrap = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("gate");
  const [focus, setFocus] = useState<number>(0);
  const [open, setOpen] = useState<number | null>(null);
  const [pct, setPct] = useState(0);
  const effectsOn = useLab((s) => s.effectsOn);
  const reduced = useReducedMotion();
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const arm = useCallback(() => {
    if (phaseRef.current !== "gate") return;
    setPhase(reduced ? "active" : "booting");
  }, [reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && phaseRef.current === "gate") arm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [arm]);

  // ---- boot + docking assembly (runs once on arm) ----
  useLayoutEffect(() => {
    if (phase !== "booting") return;
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const segs = gsap.utils.toArray<SVGPathElement>(".hex-seg");
      gsap.set(".hex-outline", { opacity: 0 });
      gsap.set(".hex-label", { opacity: 0, y: 6 });
      segs.forEach((seg, i) => {
        const ang = (-90 + 60 * i) * (Math.PI / 180);
        gsap.set(seg, {
          opacity: 0,
          x: Math.cos(ang) * 90,
          y: Math.sin(ang) * 90,
          rotation: i % 2 ? -18 : 18,
          transformOrigin: "50px 50px",
        });
      });

      const tl = gsap.timeline({ onComplete: () => setPhase("active") });
      segs.forEach((seg, i) => {
        // condensed docking: approach → decel/snap → settle
        tl.to(seg, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.7, ease: "power4.out" }, i * 0.08)
          .to(seg, { scale: 1.018, duration: 0.06 }, i * 0.08 + 0.7)
          .to(seg, { scale: 1, duration: 0.14 }, i * 0.08 + 0.76);
      });
      tl.to(".hex-outline", { opacity: 1, duration: 0.5 }, ">-0.2")
        .to(".hex-label", { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, ">-0.1");
    }, el);
    return () => ctx.revert();
  }, [phase]);

  // ---- park glyph + run aerospace overlay on commit ----
  useLayoutEffect(() => {
    const el = boxWrap.current;
    if (!el || phase !== "active") return;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(el, { xPercent: open != null ? -24 : 0, scale: open != null ? 0.8 : 1, opacity: open != null ? 0.4 : 1 });
        if (open != null) {
          gsap.set(".ovl08", { opacity: 1 });
          setPct(100);
          gsap.to(".ovl08", { opacity: 0, duration: 0.3, delay: 0.5 });
        }
        return;
      }
      if (open != null) {
        gsap.to(el, { xPercent: -24, scale: 0.78, opacity: 0.5, duration: 0.9, ease: "power3.inOut" });
        // brief aerospace flourish
        const counter = { v: 0 };
        gsap.set(".ovl08", { opacity: 1 });
        gsap.fromTo(".ovl08-reticle", { opacity: 0, rotate: -16, transformOrigin: "50px 50px" }, { opacity: 1, rotate: 0, duration: 0.6, ease: "power2.out" });
        gsap.to(counter, { v: 100, duration: 0.7, onUpdate: () => setPct(Math.round(counter.v)) });
        gsap.to(".ovl08", { opacity: 0, duration: 0.7, delay: 0.7, ease: "power2.in" });
      } else {
        gsap.to(el, { xPercent: 0, scale: 1, opacity: 1, duration: 0.9, ease: "power3.inOut" });
      }
    }, el);
    return () => ctx.revert();
  }, [open, phase, reduced]);

  useEscape(() => setOpen(null), open != null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (phase !== "active" || open != null) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setFocus((f) => (f + 1) % SECTIONS.length);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setFocus((f) => (f - 1 + SECTIONS.length) % SECTIONS.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(focus);
    }
  };

  const rotation = reduced || phase !== "active" ? 0 : rotationToTop(focus);
  const fx = effectsOn && !reduced;

  return (
    <div
      ref={root}
      className={`absolute inset-0 bg-black outline-none ${fx ? "fx-grain fx-scanlines fx-bloom" : ""}`}
      onClick={phase === "gate" ? arm : undefined}
      tabIndex={0}
      onKeyDown={(e) => {
        if (phase === "gate" && e.key === " ") arm();
        else onKeyDown(e);
      }}
      aria-label="CTRL hybrid interface"
    >
      {phase === "gate" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center">
          <div className="font-mono text-[11px] uppercase tracking-widest2 text-paper/60">{BRAND.name}</div>
          <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-widest2 text-orange">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-orange" />
            PRESS ENTER TO INITIALIZE
            <span className="cursor-blink">▍</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-paper/30">{BRAND.motto}</div>
        </div>
      ) : (
        <>
          <Chrome active={SECTIONS[open ?? focus]} versionLabel="V08 · HYBRID" />

          <div ref={boxWrap} className="absolute inset-0">
            <GlyphBox>
              {/* aerospace overlay (brief, on commit) */}
              <svg viewBox="0 0 100 100" className="ovl08 pointer-events-none absolute inset-0 h-full w-full opacity-0" aria-hidden style={{ overflow: "visible" }}>
                <path className="ovl08-reticle" d={hexOutline(49)} fill="none" stroke="var(--orange)" strokeWidth="0.4" strokeDasharray="3 4" />
                <ellipse cx="50" cy="50" rx="48" ry="20" fill="none" stroke="var(--grid)" strokeWidth="0.3" />
              </svg>

              <HexGlyph
                gsapDriven={phase === "booting"}
                breatheHub={phase === "active" && open == null}
                rotation={rotation}
                hoverIndex={phase === "active" ? focus : null}
                activeIndex={open}
                onHover={(i) => phase === "active" && i != null && open == null && setFocus(i)}
                onSelect={(i) => phase === "active" && setOpen(i)}
                className="absolute inset-0 h-full w-full"
              />
              <RadialLabels
                hoverIndex={phase === "active" ? focus : null}
                activeIndex={open}
                onHover={(i) => phase === "active" && i != null && open == null && setFocus(i)}
                onSelect={(i) => phase === "active" && setOpen(i)}
                radius={104}
              />
            </GlyphBox>
          </div>

          {phase === "active" && open == null && (
            <SelectorReadout
              section={SECTIONS[focus]}
              hint="[ hover or ◄ ► to aim · enter to engage · esc to return ]"
            />
          )}

          <SectionPanel section={open != null ? SECTIONS[open] : null} onClose={() => setOpen(null)} reduced={reduced} />

          {phase === "active" && open != null && (
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest2 text-orange sm:right-8">
              ALIGNMENT {pct.toString().padStart(3, "0")}%
            </div>
          )}
        </>
      )}
    </div>
  );
}
