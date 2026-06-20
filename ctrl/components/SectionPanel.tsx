"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type Section } from "@/lib/sections";

/**
 * The minimal "content state" that expands when a section is selected.
 * Used by the navigation-device, aerospace and hybrid versions. Framer
 * Motion is used here (and only here) because it is the cleanest tool for
 * mount/unmount of a single overlay with reduced-motion awareness baked in.
 *
 * Escape / the BACK control returns to glyph mode (handled by parent).
 */
export function SectionPanel({
  section,
  onClose,
  reduced,
}: {
  section: Section | null;
  onClose: () => void;
  reduced: boolean;
}) {
  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key={section.id}
          className="absolute inset-0 z-20 flex items-center justify-center px-6"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: reduced ? 0.2 : 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="max-w-xl">
            <div className="mb-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest2 text-orange">
              <span>SECTION {section.num}</span>
              <span className="h-px w-10 bg-dim-orange" />
              <span className="text-paper/70">{section.telemetry.sys}</span>
            </div>
            <h2 className="font-display text-4xl font-bold uppercase tracking-tight text-ivory sm:text-6xl">
              {section.label}
            </h2>
            <p className="mt-4 font-display text-lg text-paper sm:text-xl">{section.blurb}</p>
            <p className="mt-5 max-w-md font-mono text-[13px] leading-relaxed text-ivory/70">
              {section.body}
            </p>

            <button
              onClick={onClose}
              className="mt-8 inline-flex items-center gap-2 border border-paper/30 px-4 py-2 font-mono text-[11px] uppercase tracking-widest2 text-paper transition-colors hover:border-orange hover:text-orange"
            >
              <span aria-hidden>←</span> BACK · ESC
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
