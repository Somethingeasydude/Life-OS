import type { NextConfig } from "next";

/**
 * Static export, served from two different places.
 *
 * DEFAULT (no BASE_PATH): relative asset URLs. The prototypes get reviewed as
 * static files hosted under an arbitrary sub-path, where absolute "/_next/..."
 * URLs would 404. `assetPrefix: "./assets"` is the supported way to make Next
 * emit relative ones — hand-rewriting the output breaks hydration, because Next
 * also embeds asset paths in its bootstrap data.
 *
 * WITH BASE_PATH (e.g. "/overthetop"): Next prefixes every route and asset URL
 * itself, which is what the demo hub at demo.ram-strategicsystems.com needs.
 * The hub rewrites /overthetop/* to this deployment and strips the prefix, so a
 * request for /overthetop/_next/x.js arrives here as /_next/x.js and resolves.
 * Relative URLs would only work if the visitor happened to land on a trailing
 * slash, and people paste links without one.
 *
 * `unoptimized` is required by `output: "export"`.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  /**
   * With a basePath, Next already prefixes every asset URL, and Vercel serves
   * the export at that path — so no assetPrefix, or the two stack and the
   * chunk loader asks for a directory that was never written.
   */
  ...(basePath ? { basePath } : { assetPrefix: "./assets" }),
  images: {
    unoptimized: true,
    /**
     * The photographs are loaded from the restaurant's own Cloudflare Images
     * CDN rather than copied into this repo — they stay unambiguously theirs,
     * and the build container's egress policy refuses that host anyway.
     * next/image validates remote hosts even when optimization is off.
     * `scripts/fetch-manifest-images.mjs` localises them when that is wanted.
     */
    remotePatterns: [{ protocol: "https", hostname: "imagedelivery.net" }],
  },
};

export default nextConfig;
