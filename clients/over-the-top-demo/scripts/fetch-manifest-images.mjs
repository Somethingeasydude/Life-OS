#!/usr/bin/env node
/**
 * LOCALISE THE MANIFEST IMAGES
 *
 * Downloads every photograph in `ott-demo-image-manifest.json` into
 * `public/images/demo/<slug>.jpg`, then re-points `data/photos.ts` at those files:
 *
 *   node scripts/fetch-manifest-images.mjs
 *
 * This cannot run inside the sandboxed build container — its egress allowlist
 * refuses imagedelivery.net (403 at the proxy on CONNECT), which is why the demo
 * ships pointing at the restaurant's CDN instead. Run it on any machine with
 * ordinary internet access and the demo becomes self-contained.
 *
 * Production note: the manifest itself says these assets need the owner's
 * approval before they are copied and served from somewhere else. Loading them
 * from his own CDN, as the demo does, does not.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DEST = join(ROOT, "public", "images", "demo");

const manifest = JSON.parse(readFileSync(join(ROOT, "ott-demo-image-manifest.json"), "utf8"));
mkdirSync(DEST, { recursive: true });

let ok = 0;
const failed = [];

for (const { slug, name, url } of manifest.images) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 10_000) throw new Error(`only ${bytes.length} bytes — looks like a thumbnail`);
    writeFileSync(join(DEST, `${slug}.jpg`), bytes);
    console.log(`${slug}.jpg  ${(bytes.length / 1024).toFixed(0)} KB`);
    ok += 1;
  } catch (error) {
    failed.push(`${name} (${slug}): ${error.message}`);
  }
}

console.log(`\n${ok} of ${manifest.images.length} downloaded.`);
if (failed.length) {
  console.log(`Failed:\n  ${failed.join("\n  ")}`);
  process.exitCode = 1;
} else {
  execFileSync(process.execPath, [join(ROOT, "scripts", "photos-from-manifest.mjs"), "--local"], {
    stdio: "inherit",
  });
}
