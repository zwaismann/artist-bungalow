"use client";

import { create } from "zustand";
import { VERSIONS } from "./versions";

type View = "version" | "compare";

type LabState = {
  /** active version id (or "compare" handled separately) */
  versionId: string;
  view: View;
  /** master toggle for analog CRT veil / audio etc. across versions */
  effectsOn: boolean;
  notesOpen: boolean;
  setVersion: (id: string) => void;
  setView: (v: View) => void;
  toggleEffects: () => void;
  setNotesOpen: (open: boolean) => void;
};

export const useLab = create<LabState>((set) => ({
  versionId: VERSIONS[VERSIONS.length - 1].id, // default to the hybrid
  view: "version",
  effectsOn: true,
  notesOpen: false,
  setVersion: (id) => set({ versionId: id, view: "version" }),
  setView: (view) => set({ view }),
  toggleEffects: () => set((s) => ({ effectsOn: !s.effectsOn })),
  setNotesOpen: (notesOpen) => set({ notesOpen }),
}));
