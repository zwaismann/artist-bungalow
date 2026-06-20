"use client";

import { useState } from "react";
import { useLab } from "@/lib/store";
import { VERSIONS } from "@/lib/versions";
import { NotesPanel } from "@/components/NotesPanel";
import { CompareGrid } from "@/components/CompareGrid";

import V01Boot from "@/components/versions/V01Boot";
import V02Docking from "@/components/versions/V02Docking";
import V03Orbit from "@/components/versions/V03Orbit";
import V04CRT from "@/components/versions/V04CRT";
import V05Nav from "@/components/versions/V05Nav";
import V06Ritual from "@/components/versions/V06Ritual";
import V07Aerospace from "@/components/versions/V07Aerospace";
import V08Hybrid from "@/components/versions/V08Hybrid";

/** id → version component. Keyed remounts on switch reset each version's
 *  internal boot/timeline state, which is exactly what we want in a lab. */
const REGISTRY: Record<string, () => JSX.Element> = {
  boot: V01Boot,
  docking: V02Docking,
  orbit: V03Orbit,
  crt: V04CRT,
  nav: V05Nav,
  ritual: V06Ritual,
  aerospace: V07Aerospace,
  hybrid: V08Hybrid,
};

export default function Lab() {
  const { versionId, view, effectsOn, setVersion, setView, toggleEffects } = useLab();
  const [notesOpen, setNotesOpen] = useState(false);

  const Active = REGISTRY[versionId] ?? V08Hybrid;

  return (
    <main className="fixed inset-0 overflow-hidden bg-black text-ivory no-scrollbar">
      {/* THE STAGE — one version at a time, remounted by key */}
      {view === "version" ? (
        <div key={versionId} className="absolute inset-0">
          <Active />
        </div>
      ) : (
        <CompareGrid onPick={(id) => setVersion(id)} />
      )}

      {/*
        ANALOG CUT — keyed to the current stage, so switching version (or the
        compare toggle) remounts it and replays the scanline/flash wipe. Makes
        the lab feel like one machine changing modes, not pages swapping out.
      */}
      <div
        key={`cut-${view}-${versionId}`}
        className="analog-cut pointer-events-none absolute inset-0 z-[45]"
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(216,90,26,0.05) 0px, rgba(13,13,11,0.85) 2px, rgba(13,13,11,0.85) 3px, rgba(216,90,26,0.05) 4px)",
        }}
      />
      <div
        key={`flash-${view}-${versionId}`}
        className="analog-cut pointer-events-none absolute inset-0 z-[46]"
        style={{ background: "radial-gradient(circle at center, rgba(216,90,26,0.10), rgba(13,13,11,0) 60%)" }}
      />

      {/* ---- PERSISTENT LAB CONTROL BAR (top-center) ---- */}
      <div className="pointer-events-none absolute left-1/2 top-3 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-paper/15 bg-charcoal/80 px-1.5 py-1 backdrop-blur-sm">
          {VERSIONS.map((v) => {
            const isActive = view === "version" && v.id === versionId;
            return (
              <button
                key={v.id}
                onClick={() => setVersion(v.id)}
                title={v.title}
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  isActive ? "bg-orange text-black" : "text-paper/70 hover:text-ivory"
                }`}
              >
                {v.num}
              </button>
            );
          })}
          <span className="mx-1 h-4 w-px bg-paper/15" />
          <button
            onClick={() => setView(view === "compare" ? "version" : "compare")}
            className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              view === "compare" ? "bg-orange text-black" : "text-paper/70 hover:text-ivory"
            }`}
          >
            CMP
          </button>
          <button
            onClick={() => setNotesOpen(true)}
            className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-paper/70 transition-colors hover:text-ivory"
          >
            NOTES
          </button>
          <button
            onClick={toggleEffects}
            title="Toggle analog CRT effects"
            className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              effectsOn ? "text-orange" : "text-paper/40"
            }`}
          >
            FX
          </button>
        </div>
      </div>

      <NotesPanel open={notesOpen} onClose={() => setNotesOpen(false)} />
    </main>
  );
}
