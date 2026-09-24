# Over the Top Burger Bar — Discovery Notes

**Client:** Over the Top Burger Bar, 2685 Buford Hwy NE #800, Buford, GA 30518
**Status:** Unpaid demo / concept redesign. Not a production build. Not authorized to touch the live domain.
**Date:** 2026-09-13

---

## 1. Research constraint (read this first)

This session runs in a sandboxed container whose outbound network is governed by an
egress allowlist. `overthetopburger.com` returns **403 at the egress gateway**, as do the
restaurant aggregators (Zmenu, RestaurantGuru, Yelp, Uber Eats, Grubhub). Direct page
inspection of the live site was **not possible**.

All facts below were assembled from web search result snippets, which surface the
restaurant's own page titles, URL slugs and menu copy as indexed. Every factual claim used
in the build is tagged in `data/` with a `source` string. **Nothing was invented.**

**What this means for the demo:** the copy and menu data are real but *incomplete*. Gaps are
listed in section 5 and are tracked in code, not papered over.

---

## 2. Current site — information architecture (as observed via indexed pages)

| Path | Page | Notes |
| --- | --- | --- |
| `/` | Home | Title: "Over the Top Burger Bar \| Home". Still runs the older "Eat. Share. Live." / established-2020 positioning. |
| `/food` | Food | Title suffix: "BURGERS ARE FOREVER" |
| `/menu/over-the-top-burger-menu-v1?location_id=3857` | Main Menu | Query-string menu route, third-party menu platform |
| `/menu/Special%20Filipino%20Menu` | Special Filipino Menu | URL contains a raw space, encoded as `%20` |
| `/events` | Events | Venue programming |
| `/reservations` | Reservations | Title suffix: "BURGERS ARE FOREVER" |
| `/food-videos` | Food Videos | |
| `/items/<slug>` | Individual item pages | e.g. `/items/the-hangover`, `/items/flaming-avalanche-as-featured-on-food-paradise` |
| `/menu`, `/menus`, `/items/the-boujee` | **404** | Dead routes still indexed and reachable from search |

### Observed UX weaknesses

1. **Split identity.** The homepage sells "Eat. Share. Live." / est. 2020 while interior page
   titles say "BURGERS ARE FOREVER". Two different taglines, neither owned.
2. **Positioning is stale relative to the product.** The menu now spans burgers, a Special
   Filipino Menu, cocktails and specials; the homepage does not reflect that.
3. **Menu lives on a separate platform** behind `?location_id=3857`. The menu is the single
   most-visited thing on a restaurant site and it is an off-brand hand-off.
4. **Broken routes are indexed.** `/menu` and `/menus` — the two URLs a human would guess and
   type — both 404. So does at least one item page (`/items/the-boujee`).
5. **URL hygiene.** `Special%20Filipino%20Menu` as a slug is fragile and unshareable.
6. **Menu photography is inconsistent** — the owner's own complaint: images are cropped or
   cut off and don't show the food. Confirmed as the top-priority fix.
7. **Item pages are orphaned.** Individual items have their own URLs but no evident browse
   path leading to them.
8. **Conversion path is diffuse.** Order, reserve, directions and hours are spread across
   separate pages rather than resolved on first screen.

---

## 3. Verified facts used in the build

| Fact | Value | Source |
| --- | --- | --- |
| Address | 2685 Buford Hwy NE, Ste 800, Buford, GA 30518 | Multiple listings, consistent |
| Phone | (678) 482-7655 | Multiple listings, consistent |
| Hours | Mon–Sat 11a–2a; Sun brunch 11a–3p, dinner 4p–12a | Listing aggregators, consistent |
| Tagline | "BURGERS ARE FOREVER" | Restaurant's own page titles |
| Menu sections | Main Menu, Special Filipino Menu, Special Cocktails, Burger Bar Specials | Restaurant's own site |
| Instagram | @overthetopburgerbar | Indexed profile |
| Facebook | facebook.com/OTTburger | Indexed profile |
| Live music venue | Listed on ReverbNation and Fever as a venue | Indexed listings |
| Karaoke | Recurring Facebook event at this venue | Indexed event |
| Stallone Challenge | Listed on FoodChallenges.com | Indexed listing |
| Food Paradise | Flaming Avalanche described as "as Featured on Food Paradise" | Restaurant's own item URL slug |

Menu items with verified names, descriptions and/or prices are recorded in `data/menu.ts`,
each with its own `source` and verification flags.

---

## 4. Asset availability

**No restaurant photography was obtainable** — the domain and every image host are blocked by
the egress policy, and reusing their photos would need the owner's say-so anyway.

Consequently **no food photography ships in this demo, and no AI-generated food images were
created.** Presenting a synthetic burger as their burger would be the fastest way to lose this
client. Instead the build ships the *photo system* the owner asked for, with honest
placeholders in every slot. See `docs/PHOTO-WORKFLOW.md`.

This is the demo's one real weakness and it is a five-minute fix the moment real photos exist.

---

## 5. Open content gaps (for the owner conversation)

- **Filipino menu items** — the section is confirmed to exist; not one dish name was
  obtainable. Highest-value gap.
- **Prices** — only three verified ($13.99 / $17.99 / $12.99). No price is displayed unless verified.
- **Descriptions** — verified for five burgers; three more are name-only.
- **Cocktails and Burger Bar Specials** — section names confirmed, contents unknown.
- **Event dates** — event *types* are confirmed, specific dates are not. No dates were invented.
- **Ordering provider** — unidentified. See `data/restaurant.ts`.

---

## 6. Proposed V1 information architecture

```
/            Home     Header · Hero · Featured · Categories · Filipino · Events · Visit · Footer
/menu        Menu     Sticky category nav · responsive card grid · full photo system
/events      Events   Recurring programming, date-ready
```

Rationale: three routes, one job each. Every question in the brief's list is answerable
within one tap of the home screen, and `/menu` is a first-party page rather than a hand-off.
