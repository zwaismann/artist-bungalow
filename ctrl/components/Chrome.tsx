"use client";

import { BRAND, SECTIONS, type Section } from "@/lib/sections";

/**
 * The persistent corner instrumentation shared by every version:
 *   top-left  : brand lockup
 *   top-right : system status (reflects active section telemetry)
 *   bot-left  : copyright / system ID
 *   bot-right  : page / status readout
 *
 * It is purely presentational; the active section is passed in so the
 * telemetry "reflects the section" per the interaction rules.
 */

function Hex({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
      />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function Chrome({
  active,
  versionLabel,
}: {
  active: Section | null;
  versionLabel: string;
}) {
  const tel = active?.telemetry;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 select-none font-mono text-[10px] uppercase tracking-widest2 text-paper sm:text-[11px]">
      {/* top-left brand lockup */}
      <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-6 sm:top-6">
        <Hex className="h-4 w-4 text-orange" />
        <span className="text-ivory">{BRAND.name}</span>
      </div>

      {/* top-right system status */}
      <div className="absolute right-4 top-4 text-right sm:right-6 sm:top-6">
        <div className="text-orange">SYS {tel?.sys ?? "IDLE"}</div>
        <div className="text-paper/70">STATUS {tel?.status ?? "STANDBY"}</div>
      </div>

      {/* bottom-left copyright / system id */}
      <div className="absolute bottom-4 left-4 text-paper/70 sm:bottom-6 sm:left-6">
        © 2026 CTRL · ID 0x6F2A
      </div>

      {/* bottom-right page / status readout */}
      <div className="absolute bottom-4 right-4 text-right sm:bottom-6 sm:right-6">
        <div className="text-paper/70">{versionLabel}</div>
        <div className="text-orange">
          {active ? `${active.num}/${SECTIONS.length.toString().padStart(2, "0")}` : `--/06`}
          {tel ? ` · LD ${tel.load}` : ""}
        </div>
      </div>
    </div>
  );
}
