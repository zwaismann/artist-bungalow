"use client";

import { useEffect, useRef, useState } from "react";
import HexGlyph from "@/components/HexGlyph";
import RadialLabels from "@/components/RadialLabels";
import { Chrome } from "@/components/Chrome";
import { GlyphBox } from "@/components/Stage";
import { SECTIONS } from "@/lib/sections";
import { useLab } from "@/lib/store";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * VERSION 04 — CRT TERMINAL  (Gen B: restrained)
 *
 * No GSAP here — the analog character comes entirely from the layered CSS
 * overlays defined in globals.css (grain / scanlines / flicker / drift /
 * bloom) plus a warm amber colour grade. Everything is gated behind the
 * master `effectsOn` toggle and prefers-reduced-motion so it can be dialled
 * to zero. A slow boot log types itself in to sell "live terminal".
 */
const LOG = [
  "> CTRL/term v7.04 online",
  "> phosphor warm-up ............ ok",
  "> vertical hold ............... ok",
  "> sync 50hz ................... locked",
  "> awaiting operator input_",
];

export default function V04CRT() {
  const effectsOn = useLab((s) => s.effectsOn);
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const [lines, setLines] = useState<number>(reduced ? LOG.length : 0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reduced) {
      setLines(LOG.length);
      return;
    }
    setLines(0);
    let n = 0;
    timer.current = setInterval(() => {
      n += 1;
      setLines(n);
      if (n >= LOG.length && timer.current) clearInterval(timer.current);
    }, 420);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reduced]);

  const fx = effectsOn && !reduced;

  return (
    <div className="absolute inset-0 bg-grid">
      {/* amber colour grade — the whole tube is warm */}
      <div
        className="pointer-events-none absolute inset-0 z-[38]"
        style={{ background: "rgba(216,90,26,0.04)", mixBlendMode: "screen" }}
      />

      <div
        className={[
          "absolute inset-0",
          fx ? "fx-grain fx-scanlines fx-bloom" : "",
          fx ? "fx-flicker fx-drift" : "",
        ].join(" ")}
        style={fx ? { textShadow: "0 0 2px rgba(216,90,26,0.45)" } : undefined}
      >
        <Chrome active={hover != null ? SECTIONS[hover] : null} versionLabel="V04 · CRT" />

        <GlyphBox className="[filter:saturate(0.92)]">
          <HexGlyph
            hoverIndex={hover}
            onHover={setHover}
            onSelect={() => {}}
            numerals
            className="absolute inset-0 h-full w-full"
          />
          <RadialLabels hoverIndex={hover} onHover={setHover} radius={104} />
        </GlyphBox>

        {/* terminal boot log, bottom-left */}
        <div className="pointer-events-none absolute bottom-16 left-4 max-w-[70vw] space-y-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-orange/90 sm:left-6 sm:text-[11px]">
          {LOG.slice(0, lines).map((l, i) => (
            <div key={i}>
              {l}
              {i === lines - 1 && i === LOG.length - 1 && (
                <span className="cursor-blink ml-0.5 inline-block">▍</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
