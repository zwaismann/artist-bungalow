import type { Config } from "tailwindcss";

/**
 * CTRL design tokens.
 * The palette is intentionally narrow: a charcoal/black ground, two warm
 * "paper" inks, and a single oxidized-orange accent. No blues, no neon.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        black: "#0D0D0B",
        charcoal: "#171713",
        ivory: "#E8DDC7",
        paper: "#CDBF9F",
        orange: "#D85A1A",
        "dim-orange": "#8A3514",
      },
      fontFamily: {
        // Display = geometric grotesque; Mono = system labels / telemetry.
        display: ["var(--font-display)", "Space Grotesk", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Space Mono", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        widest2: "0.35em",
      },
      transitionTimingFunction: {
        // Deliberate, mechanical easing — no overshoot, no bounce.
        dock: "cubic-bezier(0.16, 1, 0.3, 1)",
        settle: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
