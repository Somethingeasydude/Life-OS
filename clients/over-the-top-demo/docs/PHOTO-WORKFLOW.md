# Adding real food photography

The owner's single strongest request was that every menu item get its own properly
displayed photograph. The system for that is already built — it is just waiting on
files. Here is the whole process.

## Getting the files here

This project is developed inside a sandboxed container whose outbound network is
restricted to an organization allowlist. `overthetopburger.com`, Yelp, and every
restaurant aggregator are refused at the gateway (`EGRESS_BLOCKED`), so the photos
cannot be fetched or scraped from in here. That is a network policy, not a missing
feature, and it is not to be routed around. The files have to be carried in.

Three ways in, fastest first:

1. **Bulk-save off their own pages, then drop the folder in.** Their site has the
   photos already — `/menu`, `/food` and `/gallery`. In Chrome, a bulk image
   downloader extension (or right-click → *Save image as* on each) pulls the whole
   page in one pass. Put them in one folder and run the ingest script below.
2. **Google Drive.** Put the folder in Drive; the session can read it directly.
3. **Drop them into the chat.** Fine for a handful, slow for forty.

Other places their real photography already exists, in rough order of quality:
their own `/gallery` page, Instagram `@overthetopburgerbar`, Yelp (several hundred
customer photos — usable for reference, not for the site), and Google Business.
Anything a customer shot belongs to that customer; only use the restaurant's own.

## Ingest a whole folder at once

```
node scripts/ingest-photos.mjs ~/Downloads/otb-photos
```

It matches each file to a menu item, files it under `public/menu/<id>.<ext>`, and
regenerates `data/photos.ts`, which `data/menu.ts` merges in automatically. Matching
tolerates what a download actually leaves behind — `Georgia Summer (1).jpg`,
`flaming_avalanche-720x720.webp`, `the-hangover@2x.png` all land correctly. A file
named `hero.jpg` becomes the full-bleed hero.

Anything it cannot match with confidence it reports by name rather than guessing.
Rename those to the item's `id` and run it again. It also prints which items still
have no photograph, so the gap is always visible.

The generated alt text comes from the restaurant's own menu descriptions, which are
literal ingredient lists and therefore honest. Items with no printed description are
reported as needing alt text written by hand.

## Add one photo by hand

1. Save the image as `public/menu/<item-id>.jpg`. The `<item-id>` is the `id` field in
   `data/menu.ts` — e.g. `public/menu/georgia-summer.jpg`.
2. In `data/menu.ts`, add an `image` block to that item:

```ts
{
  id: "georgia-summer",
  name: "Georgia Summer",
  // ...
  image: {
    src: "/menu/georgia-summer.jpg",
    alt: "Double burger with pimento cheese and peach jalapeño chutney",
    focal: "50% 40%",           // optional — see below
    credit: "Shot in-house, 2026",
  },
}
```

That is it. The card, the grid, the homepage feature row and the responsive image
sizes all pick it up automatically.

## The `focal` setting — this is the fix for the cropping complaint

Every photo slot is a fixed aspect ratio box. That is what keeps a menu grid looking
even instead of ragged, and it is why the current site's menu looks messy. The
trade-off is that a photo has to be cropped to fill that box — and a naive crop takes
the middle, which is how you end up with the top of a tall burger cut off.

`focal` is a CSS `object-position` value that tells each photo which part of itself to
protect:

| Photo | Use | Why |
| --- | --- | --- |
| Tall stacked burger | `"50% 30%"` | Pulls the crop up so the top bun survives |
| Wide platter or plate | `"50% 50%"` (default) | Centre is the subject |
| Food to one side of frame | `"30% 50%"` | Keeps the food, drops empty table |
| Overhead shot | `"50% 50%"` | Already centred |

Set it once per photo and it is correct at every screen size, forever.

## Aspect ratios in use

- Menu and featured cards — `4/3`
- Hero background, when set — full bleed
- Anything else — pass `ratio` to `FoodImage`

## Before there are photos

Any item without an `image` renders a designed placeholder carrying the item's
monogram and a small "Photo coming soon" chip. No broken image icons, no grey holes,
no layout shift when the real photo lands.

**No AI-generated food images are used anywhere in this project, and none should be.**
Showing an owner a synthetic burger and calling it theirs is how you lose the account.

## Shot list priority

If photography time is limited, shoot in this order — it is the order the site
surfaces them:

1. **One hero shot.** Set it in `heroImage` in `data/restaurant.ts`. Highest impact
   single photo in the whole project.
2. **Flaming Avalanche, Georgia Summer, The Hangover** — the three homepage features.
3. The remaining burgers.
4. Filipino menu items — currently the largest content gap of any kind.
5. Cocktails, shareables, sweets.
