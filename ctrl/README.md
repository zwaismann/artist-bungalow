# CTRL SYSTEMS — Landing Page Comparison Lab

A retro-futuristic landing-page prototype for **CTRL**, a fictional aerospace-systems
company. The identity is a **segmented hexagon glyph** treated not as a logo but as a
*navigation device, a ritual, and a visual language*. The lab ships **eight directions**
behind a persistent switcher so they can be compared side by side.

Target feeling: a 1978 aerospace control system, a NASA identity manual, a spacecraft
boot sequence — a machine waking up. **Not** modern SaaS, not cyberpunk, not gamer UI.

---

## Running locally

```bash
cd ctrl
pnpm install      # or: npm install
pnpm dev          # http://localhost:3000
```

Production build:

```bash
pnpm build && pnpm start
```

Requires Node 18+. Fonts (Space Grotesk / Space Mono) load from Google Fonts at runtime
with system-mono fallbacks, so the build never needs network access and the page still
reads correctly offline.

---

## Stack

- **Next.js 14** (App Router) · **React 18** · **TypeScript**
- **Tailwind CSS** for layout + design tokens
- **GSAP** for all choreography (boot timelines, docking, hover-rotation, overlays)
- **Framer Motion** only where it earns its place — the section-content overlay and the
  notes slide-over (clean mount/unmount + reduced-motion awareness)
- **Zustand** for the small amount of lab UI state (active version, compare view, FX toggle)
- **SVG** for the six-wedge hex glyph; **CSS variables** for the palette

Audio (Howler) and smooth-scroll (Lenis) were scoped out — neither added value to a
single-viewport instrument, and audio-on-by-default contradicts the brief. The FX toggle
is wired and ready if interface audio is added later.

---

## How it's built

```
ctrl/
├─ app/                  layout, globals.css (palette + analog FX layers), page
├─ lib/
│  ├─ hex.ts             glyph geometry — flat-top hex, six wedge paths, rotation math
│  ├─ sections.ts        the six sections + per-section telemetry + brand copy
│  ├─ versions.ts        catalogue + "what each version tests" + selected A/B/C direction
│  ├─ store.ts           zustand lab state
│  └─ useReducedMotion.ts
├─ components/
│  ├─ HexGlyph.tsx       six SVG wedges + hub. Dumb geometry; parents drive motion via GSAP
│  ├─ RadialLabels.tsx   desktop ring of labels + portalled mobile vertical selector
│  ├─ Chrome.tsx         four-corner instrumentation (brand / status / id / readout)
│  ├─ SectionPanel.tsx   the minimal expanded content state
│  ├─ Stage.tsx          centered glyph box + Escape helper
│  ├─ NotesPanel.tsx     slide-over notes
│  ├─ CompareGrid.tsx    still-frame thumbnails of all eight
│  └─ versions/V01..V08  the eight prototypes
└─ components/Lab.tsx     the shell: switcher, compare, notes, FX toggle
```

### Animation architecture

Every animated version builds its choreography inside a **`gsap.context()` scoped to the
component root**, so selectors (`.hex-seg`, `.hex-label`, `.hex-rotor`, `.hex-hub`,
`.hex-outline`) stay local and cleanup is automatic on unmount/version-switch. The glyph
is intentionally a *dumb* renderer — it draws geometry and forwards interaction; parents
own the timelines. Each version's file opens with a comment describing its specific
timeline. Easing is deliberately mechanical (`power3/power4.out`, `cubic-bezier(0.16,1,0.3,1)`)
— docking and magnetic alignment, never bounce. Default transitions sit in the 600–1200 ms
band; the boot sequence is longer but skippable.

### Accessibility & responsiveness

- **`prefers-reduced-motion`** is honored everywhere: timelines collapse to instant/cross-fade
  states, the CRT layers stop animating, and the ritual gate jumps straight to the live interface.
- **Keyboard:** the navigation device (V05) and hybrid (V08) support arrow-key aiming around
  the ring, Enter to engage, Escape to return. Segments and labels are focusable buttons.
- **Mobile:** the radial label ring is replaced by a **central glyph + vertical selector**
  (portalled to the viewport so it isn't dragged around by the glyph's transforms).

---

## The eight versions

| # | Name | What it tests |
|---|------|---------------|
| 01 | **Boot Sequence** | A character-by-character power-on that assembles the glyph from darkness. Skippable. |
| 02 | **Physical Docking** | Wedges as spacecraft: approach → decelerate → micro-rotate → snap → settle, with contact glow. Replayable. |
| 03 | **Orbiting Labels** | Glyph dead-still; labels orbit on invisible rings; selecting one drifts it to the priority slot. |
| 04 | **CRT Terminal** | Restrained analog veil — scanlines, bloom, flicker, drift, amber grade — behind the FX toggle. |
| 05 | **Navigation Device** ★ | The core hypothesis: the hex *is* the menu. Hover rotates the chosen wedge to top; click expands content like a command selector. |
| 06 | **Ritual Entry** | "PRESS ENTER TO INITIALIZE" → boot → live system. Entering feels like operating a machine. |
| 07 | **Aerospace Graphics** | Transient engineering overlays (orbits, reticles, vectors, alignment %) bloom on selection, then decay to a clean resting state. |
| 08 | **Best Hybrid** ★ | The synthesis: ritual → boot/docking → navigation device → brief aerospace overlay → faint CRT veil. |

The **Notes** panel (top bar) documents, per version, what it's testing and which
A / B / C direction (faithful / minimal / cinematic) was selected during the review loop.
**Compare** shows still frames of all eight at once.

---

## Design rationale

The brief's hardest constraint is tonal: it must read **1978, not 2025**. The levers used
to stay on the right side of that line:

- **One accent, warm inks, no gradients.** A single oxidized orange against charcoal and
  two paper tones. Color is a *signal*, reserved for the active element — so highlighting a
  wedge means something. Glow is a thin drop-shadow, never a neon bloom.
- **The hex is manufactured, not drawn.** Six separately-milled wedges with thin machined
  seams (geometry inset toward each wedge's centroid), a frame, and a hub — so it reads as a
  panel of plates that can dock, rotate and lock, not a flat mark.
- **Mechanical motion with weight.** Long, decelerating eases and tiny settle frames. Nothing
  overshoots playfully. Boot is unhurried but never traps you (always skippable).
- **Negative space + corner instrumentation.** The center stays sparse; brand, status, system
  ID and page readout live in the four corners and update with the active section, which is
  what makes the empty middle feel like an *instrument* rather than an unfinished page.
- **Analog imperfection, dialed to ~30%.** Grain, scanlines and flicker are present but
  tasteful and toggleable — texture, not costume.

### Strongest version

**V05 — Navigation Device** is the strongest single idea: it's the only one where the hex
does real work (the glyph *is* the menu), and the hover-rotate-to-top + command-selector
expansion is the most novel, most "CTRL" interaction.

**V08 — Best Hybrid** is the recommended final candidate. It keeps V05's navigation core but
wraps it in just enough ritual (the entry gate), payoff (boot + docking assembly) and
engineering flavor (a brief aerospace overlay on commit, a faint CRT veil) to feel like a
*system you enter* — without tipping into busyness. Every borrowed idea is tuned down so the
composite stays calm, legible and operable. It is meaningfully stronger than any individual
version because it sequences them: you earn the navigation device by booting into it.
