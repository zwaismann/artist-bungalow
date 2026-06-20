"use client";

import { AnimatePresence, motion } from "framer-motion";
import { VERSIONS } from "@/lib/versions";
import { useLab } from "@/lib/store";

/**
 * Slide-over notes panel. Documents what each version is testing and which
 * A/B/C direction was selected during the design-review loop. Doubles as a
 * second way to switch versions.
 */
export function NotesPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { versionId, setVersion } = useLab();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute right-0 top-0 z-[61] h-full w-[min(92vw,440px)] overflow-y-auto border-l border-paper/15 bg-charcoal p-6 no-scrollbar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Version notes"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-mono text-[12px] uppercase tracking-widest2 text-orange">
                LAB NOTES
              </h2>
              <button
                onClick={onClose}
                className="font-mono text-[11px] uppercase tracking-widest2 text-paper/60 hover:text-ivory"
              >
                CLOSE ✕
              </button>
            </div>

            <p className="mb-6 font-mono text-[11px] leading-relaxed text-paper/70">
              Eight directions for the CTRL landing glyph. For each, an A
              (faithful) / B (minimal) / C (cinematic) pass was reviewed against
              the brief; the selected direction is noted below. Recommended
              final candidate: <span className="text-orange">V08 — BEST HYBRID</span>.
            </p>

            <ol className="space-y-5">
              {VERSIONS.map((v) => (
                <li key={v.id} className="border-t border-paper/10 pt-4">
                  <button
                    onClick={() => {
                      setVersion(v.id);
                    }}
                    className="group block w-full text-left"
                  >
                    <div className="flex items-baseline justify-between">
                      <span
                        className={`font-mono text-[12px] uppercase tracking-widest2 ${
                          v.id === versionId ? "text-orange" : "text-ivory group-hover:text-orange"
                        }`}
                      >
                        {v.num} · {v.title}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-paper/40">
                        OPEN →
                      </span>
                    </div>
                  </button>
                  <p className="mt-2 font-mono text-[11px] leading-relaxed text-paper/70">
                    <span className="text-paper/50">TESTING — </span>
                    {v.testing}
                  </p>
                  <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-ivory/60">
                    <span className="text-paper/50">DIRECTION — </span>
                    {v.direction}
                  </p>
                </li>
              ))}
            </ol>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
