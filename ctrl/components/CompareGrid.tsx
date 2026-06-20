"use client";

import HexGlyph from "@/components/HexGlyph";
import { VERSIONS } from "@/lib/versions";

/**
 * COMPARE MODE — still thumbnails of all eight versions side by side.
 *
 * These are deliberately static "frozen frames", not live instances: running
 * eight boot timelines at once would be noisy and expensive. Each thumbnail
 * fakes its version's signature treatment with cheap CSS so the directions can
 * be judged at a glance. Clicking a tile opens that version live.
 */
function thumbDressing(id: string): {
  wrap: string;
  active: number | null;
  ring?: boolean;
  note: string;
} {
  switch (id) {
    case "boot":
      return { wrap: "", active: null, note: "assembles from darkness" };
    case "docking":
      return { wrap: "", active: 2, note: "wedges dock + lock" };
    case "orbit":
      return { wrap: "", active: 0, ring: true, note: "labels orbit, glyph still" };
    case "crt":
      return { wrap: "fx-scanlines fx-bloom", active: 4, note: "amber tube, scanlines" };
    case "nav":
      return { wrap: "", active: 0, note: "hex = the menu" };
    case "ritual":
      return { wrap: "bg-black", active: null, note: "press enter to initialize" };
    case "aerospace":
      return { wrap: "bg-grid", active: 1, ring: true, note: "transient diagram" };
    case "hybrid":
      return { wrap: "fx-scanlines", active: 3, note: "the synthesis" };
    default:
      return { wrap: "", active: null, note: "" };
  }
}

export function CompareGrid({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-black px-4 pb-10 pt-20 no-scrollbar">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-1 font-mono text-[12px] uppercase tracking-widest2 text-orange">
          COMPARE · 08 DIRECTIONS
        </h1>
        <p className="mb-6 font-mono text-[11px] uppercase tracking-widest2 text-paper/50">
          Still frames — select a tile to run it live
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {VERSIONS.map((v) => {
            const d = thumbDressing(v.id);
            return (
              <button
                key={v.id}
                onClick={() => onPick(v.id)}
                className="group relative aspect-[4/3] overflow-hidden border border-paper/15 bg-charcoal text-left transition-colors hover:border-orange"
              >
                <div className={`absolute inset-0 ${d.wrap}`} />
                {v.id === "ritual" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-[8px] uppercase tracking-widest2 text-orange">
                      ▍ PRESS ENTER
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  {v.id !== "ritual" && (
                    <div className="relative h-3/4 w-3/4">
                      {d.ring && (
                        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
                          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--grid)" strokeWidth="0.4" />
                        </svg>
                      )}
                      <HexGlyph
                        activeIndex={d.active}
                        frame
                        numerals={v.id === "crt"}
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-2 py-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ivory group-hover:text-orange">
                    {v.num} {v.title}
                  </span>
                </div>
                <div className="absolute left-2 top-2 font-mono text-[8px] uppercase tracking-widest text-paper/50">
                  {d.note}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
