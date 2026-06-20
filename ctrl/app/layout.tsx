import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

/**
 * Fonts are self-hosted at build time by next/font (downloaded, subset and
 * served from our own origin) — no runtime CDN dependency and no flash of
 * unstyled text. Exposed as CSS variables consumed by Tailwind + raw SVG.
 *   display = geometric grotesque (hero type)
 *   mono    = system labels / telemetry
 */
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-display",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CTRL SYSTEMS — Comparison Lab",
  description:
    "Retro-futuristic landing page prototypes for CTRL Systems Inc. A comparison lab of eight directions built around a segmented hexagon navigation glyph.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
