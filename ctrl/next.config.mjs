/** @type {import('next').NextConfig} */

// When building for a static host (e.g. GitHub Pages) we export a fully static
// site. BASE_PATH lets project-pages serve correctly from /<repo>/. Both are
// opt-in via env so normal `next dev` / `next start` are unaffected.
const isExport = process.env.NEXT_EXPORT === "1";
const basePath = process.env.BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  ...(isExport
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath || undefined,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
