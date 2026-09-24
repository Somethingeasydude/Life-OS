import type { RestaurantEvent } from "@/lib/types";

/**
 * EVENTS
 *
 * Important finding: the restaurant's own /events page currently reads
 * "At this time, there are no upcoming events." Their nav points at a dead end.
 *
 * So no dates are shown here, because none exist to show. What IS verifiable is
 * that this venue runs these kinds of nights — it is listed as a live music venue
 * on ReverbNation and Fever, karaoke runs as a recurring Facebook event there, and
 * the eating challenge is listed on FoodChallenges.com. The `date` field is fully
 * supported by every prototype; the moment the owner supplies a schedule it renders.
 */
export const events: RestaurantEvent[] = [
  {
    id: "live-music",
    name: "Live Music",
    description:
      "Over the Top is a listed live music venue. Local acts play the room through the night.",
    cadence: "Regularly",
    href: "https://www.facebook.com/OTTburger/",
    provenance: "verified",
    source: "Venue listings on ReverbNation and Fever",
  },
  {
    id: "karaoke",
    name: "Karaoke Night",
    description:
      "Grab the mic. Karaoke runs as a recurring night at the bar — the lineup goes up on Facebook.",
    cadence: "Recurring",
    href: "https://www.facebook.com/OTTburger/",
    provenance: "verified",
    source: "Recurring Facebook event listed at this venue",
  },
  {
    id: "stallone-challenge",
    name: "The Stallone Challenge",
    description:
      "The house eating challenge. Finish it and you have earned the right to talk about it.",
    cadence: "Any time",
    href: "https://www.facebook.com/OTTburger/",
    provenance: "verified",
    source: "Listed on FoodChallenges.com",
  },
];
