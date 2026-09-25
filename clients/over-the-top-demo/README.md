# Over the Top Burger Bar — concept redesign

An unpaid concept redesign for Over the Top Burger Bar, 2685 Buford Hwy NE #800,
Buford GA. Built to earn a second conversation with the owner, not shipped as
their live site.

Lives here inside `life-os` because the GitHub token available to the build
session is scoped to this repository. It is self-contained and moves out to its
own repo with a `git subtree split` whenever that is wanted.

## What it is

The root is the client build — the Filipino-heritage direction, which is the one
Robert chose. `/concept-d` is the same page with a concept switcher for internal
comparison, and `/lab`, `/v2`, `/concept-a|b|c` are the earlier directions kept
for reference.

Deployed to `demo.ram-strategicsystems.com/overthetop` through a route on the
`ram-demo-hub` Vercel project, so the hub's other client demos are never
redeployed.

## Running it

```
npm install
npm run dev            # http://localhost:3000
npm run build          # static export into out/
```

`NEXT_PUBLIC_BASE_PATH=/overthetop npm run build` produces the hub build, with
absolute asset URLs under that prefix. Without it the export uses relative URLs,
which is what static file hosting and artifact previews need.

## The two rules this project keeps

**Nothing is invented.** Every menu item, price, description, accolade and
opening hour came off the restaurant's own menu. Anything unverified is absent
rather than guessed, and `lib/types.ts` carries provenance on each field. Two of
their own data errors are recorded as printed and flagged rather than silently
corrected — see the comments in `data/menu.ts`.

**No AI-generated food photography, ever.** Showing an owner a synthetic burger
and calling it his is how you lose the account. Photo slots render a designed
placeholder until a real photograph exists. See `docs/PHOTO-WORKFLOW.md`.

## Known gaps

- Six items have no price: Sweet Potato Tots, Tater Tots, Cactus Jack, Jalapeño
  Sugar Rush, Heat Wave, Cactus Nectar. Needs a capture of the Sides, Salads and
  Margaritas sections.
- The Filipino menu has no dishes. Their site advertises it and never lists it.
  This is the largest content gap and the centrepiece of the chosen direction.
- 12 of 67 items have a photograph, loaded from the restaurant's own CDN via
  `ott-demo-image-manifest.json`.
- "Filipino-owned" in the hero is confirmed by Robert, not by the restaurant.
