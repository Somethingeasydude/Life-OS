"use client";

import { useState } from "react";
import Image from "next/image";
import type { FoodImage as FoodImageData } from "@/lib/types";

/**
 * THE PHOTO SYSTEM — the owner's specific complaint, solved once and shared by all
 * three prototypes so it is never what distinguishes them.
 *
 * His words: some images are cut off or don't display the food properly. Three
 * things cause that and all three are handled here.
 *
 *  1. FIXED ASPECT RATIO per slot. A grid of photos at random dimensions is what
 *     makes a menu look broken. Fixing the box makes the grid calm regardless of
 *     what the kitchen sends over.
 *  2. FOCAL POINT per photo. `object-cover` fills the box without ever squashing
 *     the food, and `focal` decides what survives the crop — a tall stacked burger
 *     keeps its top, a wide platter keeps its middle. Nothing gets decapitated.
 *  3. GRACEFUL DEGRADATION. No photo yet means a designed panel, not a broken icon
 *     or a grey hole, and no layout shift when the real photo arrives. A photo that
 *     is set but fails to load — a dead CDN, a viewer that blocks third-party
 *     images — falls back to that same panel rather than spilling its alt text
 *     across the page, which is what a broken <img> does by default.
 *
 * Next/Image handles responsive sizing, lazy loading and modern formats.
 */

const RATIOS = {
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "16/9": "aspect-video",
  "16/10": "aspect-[16/10]",
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
} as const;

export type Ratio = keyof typeof RATIOS;

type Props = {
  image?: FoodImageData;
  /** Item name — drives the placeholder monogram and the fallback label. */
  name: string;
  ratio?: Ratio;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Smaller placeholder treatment for compact cards. */
  compact?: boolean;
  /**
   * Full-bleed use, e.g. a hero behind headline type. Renders the empty state as a
   * plain ground with no monogram or label — that chrome reads as a broken image
   * when type sits on top of it.
   */
  bleed?: boolean;
};

function monogram(name: string): string {
  return name
    .replace(/^the\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

export default function FoodImage({
  image,
  name,
  ratio = "4/3",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  className = "",
  compact = false,
  bleed = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const box = `relative overflow-hidden bg-char-2 ${RATIOS[ratio]} ${className}`;

  if (image && !failed) {
    return (
      <div className={box}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover"
          /* Everything above is routine. This line is the fix. */
          style={{ objectPosition: image.focal ?? "50% 50%" }}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`photo-slot ${box} bg-[radial-gradient(118%_88%_at_50%_0%,var(--color-char-3)_0%,var(--color-char-2)_66%,var(--color-char)_100%)]`}
      role={bleed ? "presentation" : "img"}
      aria-label={bleed ? undefined : `Photograph of ${name} not yet available`}
    >
      <div
        hidden={bleed}
        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
      >
        <span
          aria-hidden
          className={`photo-slot-mark grid place-items-center rounded-full border border-dashed border-cream/20 font-display font-bold text-cream/30 ${
            compact ? "size-12 text-sm" : "aspect-square w-[30%] max-w-20 text-base sm:text-xl"
          }`}
        >
          {monogram(name)}
        </span>
        {!compact && (
          <span className="photo-slot-cap text-[10px] font-bold uppercase tracking-[0.14em] text-ash/80">
            Photo
          </span>
        )}
      </div>
    </div>
  );
}
