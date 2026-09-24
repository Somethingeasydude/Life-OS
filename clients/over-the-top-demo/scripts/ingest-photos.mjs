#!/usr/bin/env node
/**
 * PHOTO INGEST
 *
 * The prototypes are finished except for one thing: real photographs. This
 * script is the receiving end. Point it at a folder of images — a Google Drive
 * download, an AirDrop, a browser bulk-save off the restaurant's own menu page —
 * and it files them, names them, and regenerates `data/photos.ts` so every
 * concept picks them up on the next build.
 *
 *     node scripts/ingest-photos.mjs ~/Downloads/otb-photos
 *
 * Matching is deliberately forgiving, because files coming off a website are
 * named things like "Georgia Summer (1).jpg" or "flaming_avalanche-720x720.webp".
 * Anything it cannot match with confidence is reported, never guessed at.
 */

import { readdirSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const MENU = join(ROOT, "data", "menu.ts");
const DEST = join(ROOT, "public", "menu");
const OUT = join(ROOT, "data", "photos.ts");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

/**
 * Where each photo should be anchored when a card crops it. Tall stacked burgers
 * lose their crown to a centred crop, so they sit high; plated and flat-lay food
 * centres fine. Tune these once the real photographs are in and you can see them.
 */
const FOCAL = {
  "the-hangover": "50% 38%",
  "flaming-avalanche": "50% 38%",
  "georgia-summer": "50% 42%",
  "bobs-your-uncle": "50% 38%",
  "buford-blue": "50% 42%",
  "hog-wild": "50% 40%",
  "the-big-catch": "50% 42%",
  "unoriginal": "50% 45%",
  "cracked-rear-view": "50% 40%",
};

/** Filenames that mean "the big one at the top of the page", not a menu item. */
const HERO_NAMES = new Set(["hero", "banner", "header", "cover", "dining-room", "interior"]);

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/'|’/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Strip the noise a download adds: copy counters, CDN size suffixes, scale tags. */
function normalizeFilename(name) {
  return slugify(
    basename(name, extname(name))
      .replace(/\(\d+\)/g, "")
      .replace(/[-_]?\d{2,4}x\d{2,4}/gi, "")
      .replace(/@\d+x/gi, "")
      .replace(/[-_](small|medium|large|thumb|thumbnail|full|orig|original)\b/gi, "")
      .replace(/[-_]?\d{6,}/g, "")
  );
}

/** Pull every item id and its description straight out of the menu data. */
function readMenu() {
  const source = readFileSync(MENU, "utf8");
  const body = source.slice(source.indexOf("export const menuItems"));
  const items = new Map();

  for (const match of body.matchAll(/\bB\(\s*"([a-z0-9-]+)"\s*,\s*"[^"]*"\s*,\s*\n?\s*"((?:[^"\\]|\\.)*)"/g)) {
    items.set(match[1], match[2]);
  }
  for (const match of body.matchAll(/\{\s*id:\s*"([a-z0-9-]+)"[\s\S]{0,400}?\}/g)) {
    const description = match[0].match(/description:\s*"((?:[^"\\]|\\.)*)"/);
    if (!items.has(match[1])) items.set(match[1], description ? description[1] : "");
  }
  return items;
}

/**
 * Alt text describes the food, not the dish's name — a screen reader user gets
 * nothing from "Flaming Avalanche". The menu descriptions are already literal
 * ingredient lists written by the restaurant, so they make honest alt text.
 */
function altFor(id, description) {
  if (!description) return null;
  const text = description.replace(/\\"/g, '"').replace(/\s+/g, " ").trim();
  const trimmed = text.length > 150 ? `${text.slice(0, 147).replace(/[\s,]+$/, "")}…` : text;
  return trimmed.replace(/\.$/, "");
}

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error("usage: node scripts/ingest-photos.mjs <folder-of-images>");
  process.exit(1);
}
if (!existsSync(sourceDir)) {
  console.error(`No such folder: ${sourceDir}`);
  process.exit(1);
}

const menu = readMenu();
const bySlug = new Map([...menu.keys()].map((id) => [id, id]));
/** Also accept the pretty name a website download leaves behind. */
for (const id of menu.keys()) bySlug.set(id.replace(/-/g, ""), id);

mkdirSync(DEST, { recursive: true });

const matched = new Map();
const unmatched = [];
let hero = null;

for (const file of readdirSync(sourceDir).sort()) {
  const ext = extname(file).toLowerCase();
  if (!IMAGE_EXT.has(ext)) continue;

  const slug = normalizeFilename(file);
  if (HERO_NAMES.has(slug)) {
    hero = `hero${ext}`;
    copyFileSync(join(sourceDir, file), join(DEST, hero));
    continue;
  }

  const id = bySlug.get(slug) ?? bySlug.get(slug.replace(/-/g, "")) ?? null;
  if (!id) {
    unmatched.push(file);
    continue;
  }
  if (matched.has(id)) continue;

  const filename = `${id}${ext}`;
  copyFileSync(join(sourceDir, file), join(DEST, filename));
  matched.set(id, filename);
}

const needsAlt = [];
const entries = [...matched.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([id, filename]) => {
    const alt = altFor(id, menu.get(id));
    if (!alt) needsAlt.push(id);
    const focal = FOCAL[id] ?? "50% 45%";
    return [
      `  "${id}": {`,
      `    src: "/menu/${filename}",`,
      `    alt: ${JSON.stringify(alt ?? `A dish served at Over the Top Burger Bar. ALT TEXT NEEDED — describe the food.`)},`,
      `    focal: "${focal}",`,
      `    credit: "Restaurant's own photography",`,
      `  },`,
    ].join("\n");
  });

const generated = `/**
 * GENERATED by scripts/ingest-photos.mjs — do not hand-edit; re-run the script.
 *
 * Photographs keyed by menu item id. \`data/menu.ts\` merges this in, so a photo
 * appears everywhere that item appears without touching the menu data itself.
 * An item with no entry here renders the designed placeholder, not a broken box.
 */

import type { FoodImage } from "@/lib/types";

export const photos: Record<string, FoodImage> = {
${entries.join("\n")}
};

/** The full-bleed photograph at the top of the page, if one has been supplied. */
export const heroPhoto: FoodImage | null = ${
  hero
    ? `{\n  src: "/menu/${hero}",\n  alt: "ALT TEXT NEEDED — describe what this photograph shows.",\n  focal: "50% 50%",\n  credit: "Restaurant's own photography",\n}`
    : "null"
};
`;

writeFileSync(OUT, generated);

console.log(`Filed ${matched.size} photo${matched.size === 1 ? "" : "s"} into public/menu/`);
if (hero) console.log(`Hero image: ${hero}`);
if (needsAlt.length) console.log(`\nAlt text still needed (no menu description to draw on):\n  ${needsAlt.join("\n  ")}`);
if (unmatched.length) {
  console.log(`\nNot matched to a menu item — rename to the item's id and re-run:\n  ${unmatched.join("\n  ")}`);
}
const missing = [...menu.keys()].filter((id) => !matched.has(id));
console.log(`\n${matched.size} of ${menu.size} menu items now have a photograph.`);
if (missing.length && missing.length <= 25) console.log(`Still without one:\n  ${missing.join("\n  ")}`);
