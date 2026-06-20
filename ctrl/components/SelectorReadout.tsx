"use client";

import { type Section } from "@/lib/sections";

/**
 * The "channel window" for the navigation device / hybrid (desktop only —
 * mobile uses the vertical selector, which already names the active section).
 *
 * The dial rotates the active wedge to 12 o'clock; this readout sits at the
 * foot of the stage with a marker pointing UP at that wedge and names the
 * active section in full, removing the "orange wedge at top, but which
 * section?" ambiguity. It is anchored to the stage (not the glyph) so it never
 * collides with the 6 o'clock ring label, and it absorbs the control hint so
 * the bottom of the screen stays a single calm readout instead of two.
 */
export function SelectorReadout({ section, hint }: { section: Section; hint?: string }) {
  return (
    <div className="pointer-events-none absolute bottom-10 left-1/2 hidden -translate-x-1/2 text-center sm:block">
      <div className="font-mono text-[10px] leading-none text-orange">▲</div>
      <div className="mt-1.5 font-mono text-[14px] uppercase tracking-widest2 text-ivory">
        <span className="text-dim-orange">{section.num}</span>{" "}
        <span className="text-orange">{section.label}</span>
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest2 text-paper/55">
        SYS {section.telemetry.sys} · {section.telemetry.status}
      </div>
      {hint && (
        <div className="mt-2.5 font-mono text-[10px] uppercase tracking-widest2 text-paper/35">
          {hint}
        </div>
      )}
    </div>
  );
}
