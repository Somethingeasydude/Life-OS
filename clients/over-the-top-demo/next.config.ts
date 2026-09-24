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
 * WITH BASE_PATH (e.g. "/overthetop"): absolute URLs under that prefix, for the
 * demo hub at demo.ram-strategicsystems.com. The hub proxies /overthetop/* to
 * this deployment, so every asset request has to carry the prefix on its way
 * back through — relative URLs would only work if the visitor happened to land
 * on a trailing slash, and people paste links without one.
 *
 * `unoptimized` is required by `output: "export"`.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  ...(basePath ? { basePath } : {}),
  assetPrefix: basePath ? `${basePath}/assets` : "./assets",
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
