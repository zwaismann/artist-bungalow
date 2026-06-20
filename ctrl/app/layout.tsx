import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CTRL SYSTEMS — Comparison Lab",
  description:
    "Retro-futuristic landing page prototypes for CTRL Systems Inc. A comparison lab of eight directions built around a segmented hexagon navigation glyph.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Fonts are linked rather than bundled so the build never depends on
          network access. CSS variables fall back to system fonts when Google
          Fonts is unreachable. Display = geometric grotesque, Mono = labels.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
