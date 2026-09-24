/**
 * Content schema for the Over the Top Burger Bar prototypes.
 *
 * Every meaningful field carries provenance. This is not bureaucracy — the owner
 * will read this demo as a claim about his own restaurant, and a wrong price or an
 * invented dish costs more trust than a missing one. Anything not `verified` is
 * either visibly marked or not rendered at all.
 */

export type Provenance =
  /** Confirmed on the restaurant's own site or a consistent public listing. */
  | "verified"
  /** Stand-in content for the demo. Must be visibly distinguishable in the UI. */
  | "demo"
  /** Known to exist, detail not established. Never rendered as fact. */
  | "unknown";

export type Sourced<T> = {
  value: T;
  provenance: Provenance;
  /** Where it came from. Internal only — never rendered. */
  source?: string;
};

export function verified<T>(value: T, source: string): Sourced<T> {
  return { value, provenance: "verified", source };
}

/**
 * A food photograph.
 *
 * `focal` is the answer to the owner's complaint that his menu pictures come out
 * cropped. Cards use fixed aspect ratios so the grid stays even; `focal` lets each
 * photo decide which part of itself survives that crop.
 */
export type FoodImage = {
  src: string;
  /** Describe the food, not the item name — screen readers read this aloud. */
  alt: string;
  /** CSS object-position, e.g. "50% 30%" to protect the top of a tall burger. */
  focal?: string;
  /** Internal provenance for the asset itself. */
  credit?: string;
};

export type PriceVariant = { label: string; price: number };

export type DietaryFlag = "spicy" | "vegetarian" | "contains-pork" | "seafood";

export type MenuItem = {
  /** Slug. Also the expected photo filename: /public/menu/<id>.jpg */
  id: string;
  name: string;
  category: CategoryId;

  /** Omitted entirely unless verified. Never fill this with a guess. */
  description?: string;
  descriptionProvenance?: Provenance;

  price?: number;
  priceVariants?: PriceVariant[];
  priceProvenance?: Provenance;

  image?: FoodImage;
  /** Only set from confirmed menu information. */
  dietary?: DietaryFlag[];
  /** Short, factual accolade. Only where publicly verifiable. */
  accolade?: string;
  /** Surfaces the item in signature/featured positions. */
  signature?: boolean;

  source?: string;
};

/**
 * The restaurant prints sixteen menu sections. The data keeps them faithfully —
 * renaming or merging their sections would misrepresent their menu — and the UI
 * collapses them into a handful of browsing GROUPS. Presentation decides grouping;
 * data stays true to the printed menu.
 */
export type CategoryId =
  | "burgers"
  | "entrees"
  | "shareables"
  | "wings"
  | "sides"
  | "pastas"
  | "salads"
  | "shakes"
  | "desserts"
  | "kids"
  | "brunch"
  | "wine"
  | "margaritas"
  | "filipino";

export type GroupId =
  | "burgers"
  | "mains"
  | "starters"
  | "sweets"
  | "drinks"
  | "filipino";

export type MenuGroup = {
  id: GroupId;
  name: string;
  blurb: string;
};

export type MenuCategory = {
  id: CategoryId;
  /** Which browsing group the UI files this section under. */
  group: GroupId;
  name: string;
  /** One factual line. Appears under the category heading. */
  blurb: string;
  /** Printed on the restaurant's own section header, where they have one. */
  note?: string;
  /** True when the section is confirmed to exist but its items aren't sourced. */
  awaitingContent?: boolean;
  emptyState?: { title: string; body: string };
};

export type RestaurantEvent = {
  id: string;
  name: string;
  description: string;
  /** ISO date. Undefined on purpose — no event dates are verifiable. */
  date?: string;
  cadence?: string;
  href?: string;
  provenance: Provenance;
  source?: string;
};

export type PressMention = {
  name: string;
  /** Short label if the outlet needs one. */
  note?: string;
  source: string;
};
