import type { PressMention } from "@/lib/types";

/**
 * The business itself. Everything here was read off the restaurant's own website
 * or a consistent public listing. Comments mark anything still open.
 */
export const restaurant = {
  name: "Over the Top Burger Bar",
  short: "Over the Top",
  /** On their logo badge. Their words, not ours. */
  tagline: "Eat. Share. Live.",
  established: 2020,

  /**
   * Assembled from the restaurant's own homepage copy: "the home for stacked
   * gourmet burgers, decked milkshakes, with a drink selection to match" and
   * "a growing list of community curated events, live entertainment, and a cool
   * atmosphere to hang out and dine in."
   */
  intro:
    "Stacked gourmet burgers, decked milkshakes and a drink selection to match — plus a Special Filipino Menu, live entertainment and a room built to hang out in.",

  address: {
    street: "2685 Buford Hwy NE #800",
    city: "Buford",
    state: "GA",
    zip: "30518",
  },
  phone: "(678) 482-7655",
  phoneHref: "tel:+16784827655",
  email: "info@overthetopburger.com",

  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=2685+Buford+Hwy+NE+%23800+Buford+GA+30518",

  /** Read directly off their footer hours table. */
  hours: [
    { days: "Sunday – Thursday", time: "11:00 AM – 12:00 AM" },
    { days: "Friday – Saturday", time: "11:00 AM – 2:00 AM" },
  ],
  hoursNote: "Sunday brunch served from 11:00 AM.",
  lateNight: "Open until 2 AM Friday & Saturday",

  social: {
    instagram: "https://www.instagram.com/overthetopburgerbar/",
    facebook: "https://www.facebook.com/OTTburger/",
  },
} as const;

export const fullAddress = `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zip}`;

/**
 * Press. All four appear on the restaurant's own homepage; the quote is theirs too.
 * Not embellished, not ranked, nothing added.
 */
export const press: PressMention[] = [
  { name: "Food Paradise", source: "Restaurant's own homepage press section" },
  { name: "FOX 5 Atlanta", source: "Restaurant's own homepage press section" },
  { name: "The DiG", note: "Gwinnett Uncovered", source: "Restaurant's own homepage press section" },
  { name: "Gwinnett Magazine", source: "Restaurant's own homepage press section" },
];

export const pressQuote = {
  text:
    "We opted for the Georgia Summer and feel really good about our decision for multiple reasons. Number one, it was delicious. Number two, the Cracked Rear View Burger will likely lure us back to Buford. The fries are great. But, you owe it to yourself to also try the Funnel Cake fries, whether as a dessert or an appetizer. Trust me.",
  attribution: "Buck Lanford, FOX 5 Atlanta",
  tag: "#BurgersWithBuck",
  source: "Quoted on the restaurant's own homepage",
} as const;

/**
 * Outbound actions.
 *
 * The real ordering provider has NOT been identified — their site runs on Sociavore,
 * but which ordering/POS system sits behind it is an open discovery question. Every
 * order CTA in every prototype reads from `order.href`, so pointing the whole site at
 * the verified system later is a one-line change here.
 */
export const actions = {
  order: {
    href: "https://www.overthetopburger.com/",
    label: "Order Online",
    /** Marked demo so the UI can flag it rather than imply it is wired up. */
    provenance: "demo" as const,
  },
  reserve: {
    href: "https://www.overthetopburger.com/reservations",
    label: "Reserve a Table",
    provenance: "verified" as const,
  },
  /**
   * Delivery marketplaces listed for this exact address in public search results.
   * Deliberately a SECONDARY path: they take 15-35% per order and their terms
   * prevent the restaurant marketing to those customers afterwards, so the UI
   * leads with direct ordering and lists these as a fallback.
   * TODO(owner): confirm both partnerships are still active.
   */
  marketplaces: [
    {
      name: "Uber Eats",
      url: "https://www.ubereats.com/store/over-the-top-burger-bars/RkGJ4UF7W4iYX8pU9ZCNDw",
    },
    {
      name: "Grubhub",
      url: "https://www.grubhub.com/restaurant/over-the-top-burger-bar-2685-buford-hwy-ne-800-buford/15388920",
    },
  ],
  currentSite: "https://www.overthetopburger.com/",
} as const;

/** Their printed menu sections, as listed in their own Menus dropdown and menu nav. */
export const printedSections = [
  "Salads", "Pastas", "Shareables", "Signature Burgers", "Entrees", "Wings",
  "Sides", "Shakes", "Desserts", "Kids Meals", "Brunch", "Wine", "Margaritas",
  "Special Cocktails", "Burger Bar Specials", "Special Filipino Menu",
] as const;
