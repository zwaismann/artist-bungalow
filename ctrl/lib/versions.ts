/** Catalogue of the eight prototypes shown in the comparison lab. */

export type VersionMeta = {
  id: string;
  num: string;
  title: string;
  /** Notes panel: what this version is testing. */
  testing: string;
  /** The A/B/C direction that was selected, and why (design-review output). */
  direction: string;
};

export const VERSIONS: VersionMeta[] = [
  {
    id: "boot",
    num: "01",
    title: "BOOT SEQUENCE",
    testing:
      "Whether a character-by-character power-on ritual earns enough trust to justify a few seconds of delay before the navigation appears.",
    direction:
      "Selected Gen C (cinematic): the assembly is the payoff. Each wedge flies in on its own vector and locks. Skippable on click/key.",
  },
  {
    id: "docking",
    num: "02",
    title: "PHYSICAL DOCKING",
    testing:
      "Whether mechanical motion (approach → decelerate → micro-rotate → snap → settle) makes the hex read as a manufactured object rather than a drawn logo.",
    direction:
      "Selected Gen A (faithful): full docking choreography with contact glow and a one-frame settle. Replayable.",
  },
  {
    id: "orbit",
    num: "03",
    title: "ORBITING LABELS",
    testing:
      "Whether labels-as-satellites can stay legible while in continuous slow motion, and whether 'priority position' reads as selection.",
    direction:
      "Selected Gen B (minimal): glyph dead-still, labels orbit on invisible rings, selected label eases to 12 o'clock. Almost-still but alive.",
  },
  {
    id: "crt",
    num: "04",
    title: "CRT TERMINAL",
    testing:
      "How much analog imperfection (scanlines, bloom, flicker, drift, noise) the page can carry before it tips from 'instrument' into 'kitsch'.",
    direction:
      "Selected Gen B (restrained): effects dialed to roughly 30%, amber-warm, with a master toggle. Tasteful over loud.",
  },
  {
    id: "nav",
    num: "05",
    title: "NAVIGATION DEVICE",
    testing:
      "The core hypothesis: the hex IS the menu. Hover rotates the chosen wedge to top, telemetry reflects it, click expands content like a command selector.",
    direction:
      "Selected Gen A (faithful) hardened for keyboard + reduced motion. This is the primary candidate the hybrid is built on.",
  },
  {
    id: "ritual",
    num: "06",
    title: "RITUAL ENTRY",
    testing:
      "Whether a 'PRESS ENTER TO INITIALIZE' gate makes entering the site feel like operating a machine rather than loading a page.",
    direction:
      "Selected Gen C (cinematic): black screen, breathing cursor, then a boot hand-off into the assembled glyph. Enter / click / tap all arm it.",
  },
  {
    id: "aerospace",
    num: "07",
    title: "AEROSPACE GRAPHICS",
    testing:
      "Whether transient engineering overlays (orbits, grids, reticles, vectors, alignment %) can add weight during transitions yet leave a clean resting state.",
    direction:
      "Selected Gen C: overlays bloom in on selection, run an alignment count-up, then decay back to minimalism within ~1s.",
  },
  {
    id: "hybrid",
    num: "08",
    title: "BEST HYBRID",
    testing:
      "The synthesis: ritual entry → boot assembly → docking → navigation device → brief aerospace overlays, under a faint CRT veil.",
    direction:
      "The recommended final candidate. Each borrowed idea is tuned down so the composite stays calm, legible and operable.",
  },
];
