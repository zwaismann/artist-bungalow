"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import HexGlyph from "@/components/HexGlyph";
import RadialLabels from "@/components/RadialLabels";
import { Chrome } from "@/components/Chrome";
import { SectionPanel } from "@/components/SectionPanel";
import { SelectorReadout } from "@/components/SelectorReadout";
import { GlyphBox, useEscape } from "@/components/Stage";
import { SECTIONS } from "@/lib/sections";
import { rotationToTop } from "@/lib/hex";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * VERSION 05 — NAVIGATION DEVICE  (Gen A: faithful, hardened)  ★ core hypothesis
 *
 * Animation architecture
 * ----------------------
 * Two pieces of state drive everything:
 *   `focus`  — the segment under hover/keyboard focus (drives rotation+highlight)
 *   `open`   — the committed section after a click (drives content expansion)
 *
 * Rotation: the rotor is rotated by rotationToTop(focus) via the HexGlyph
 * `rotation` prop. When gsapDriven is false the glyph's own CSS dock-ease
 * handles the 900ms turn — that IS the command-selector feel, so we keep it.
 *
 * Open/close: a small GSAP tween parks the whole glyph box to the left and
 * scales it down so the content has room — like a selector dial that steps
 * aside once a command is committed. Escape / BACK reverses it.
 *
 * Keyboard: arrow keys move focus around the ring; Enter commits; Esc closes.
 * Reduced motion: rotation + park are skipped (instant state swaps).
 */
export default function V05Nav() {
  const boxWrap = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<number>(0);
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const activeForTelemetry = open ?? focus;
  const rotation = reduced ? 0 : rotationToTop(focus);

  // park / restore the glyph when a section opens
  useLayoutEffect(() => {
    const el = boxWrap.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(el, { x: 0, scale: 1, opacity: open != null ? 0.18 : 1 });
        return;
      }
      if (open != null) {
        gsap.to(el, {
          xPercent: -26,
          scale: 0.74,
          opacity: 0.5,
          duration: 0.9,
          ease: "power3.inOut",
        });
      } else {
        gsap.to(el, { xPercent: 0, scale: 1, opacity: 1, duration: 0.9, ease: "power3.inOut" });
      }
    }, el);
    return () => ctx.revert();
  }, [open, reduced]);

  useEscape(() => setOpen(null), open != null);

  // keyboard ring navigation
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (open != null) return;
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

  return (
    <div
      className="absolute inset-0 outline-none"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Hex navigation device. Arrow keys to select, Enter to open, Escape to close."
    >
      <Chrome active={SECTIONS[activeForTelemetry]} versionLabel="V05 · NAV" />

      <div ref={boxWrap} className="absolute inset-0">
        <GlyphBox>
          <HexGlyph
            rotation={rotation}
            breatheHub={open == null}
            hoverIndex={focus}
            activeIndex={open}
            onHover={(i) => i != null && open == null && setFocus(i)}
            onSelect={(i) => setOpen(i)}
            className="absolute inset-0 h-full w-full"
          />
          {/* Labels are fixed positional markers around the dial; the glyph
              rotates the chosen wedge to the top and the matching label lights
              in place (per brief). The channel readout below names the active
              section so the top wedge is never ambiguous. */}
          <RadialLabels
            hoverIndex={focus}
            activeIndex={open}
            onHover={(i) => i != null && open == null && setFocus(i)}
            onSelect={(i) => setOpen(i)}
            radius={104}
          />
        </GlyphBox>
      </div>

      {open == null && (
        <SelectorReadout
          section={SECTIONS[activeForTelemetry]}
          hint="[ hover or ◄ ► to aim · enter to engage ]"
        />
      )}

      <SectionPanel section={open != null ? SECTIONS[open] : null} onClose={() => setOpen(null)} reduced={reduced} />
    </div>
  );
}
