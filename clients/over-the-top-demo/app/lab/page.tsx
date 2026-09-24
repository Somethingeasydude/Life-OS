import type { Metadata } from "next";
import { menuItems } from "@/data/menu";

export const metadata: Metadata = { title: "Experience Lab" };

/**
 * The lab.
 *
 * Neutral by design — no concept is labelled recommended, best, or first-among-equals,
 * and the descriptions state each one's premise without arguing for it. Robert's
 * reaction is the data; a nudge here would contaminate it.
 */
const CONCEPTS = [
  {
    slug: "concept-a.html",
    letter: "A",
    name: "Food-First",
    premise: "Assumes the visitor is hungry and undecided.",
    detail:
      "Opens on food and identity, leads with signature dishes, and treats the menu as a photo gallery with category tabs. Events and visit information sit further down.",
    menuModel: "Photo gallery with category tabs",
    cta: "See the Menu",
  },
  {
    slug: "concept-b.html",
    letter: "B",
    name: "Menu-First",
    premise: "Assumes the visitor already wants to know what's on the menu.",
    detail:
      "Minimal preamble. The full menu starts within one screen of landing, with a search box, a jump rail and compact rows built for scanning rather than browsing.",
    menuModel: "Searchable list with a jump rail",
    cta: "Order Online",
  },
  {
    slug: "concept-c.html",
    letter: "C",
    name: "Experience-First",
    premise: "Assumes the visitor is choosing where to spend an evening.",
    detail:
      "Leads with atmosphere, press and what's happening at the restaurant, then food. The menu is presented as collapsible sections that open on request.",
    menuModel: "Collapsible sections",
    cta: "Reserve a Table",
  },
];

const REFINED = {
  slug: "v2.html",
  name: "The Refined Build",
  premise: "Concept A's journey, executed harder — plus the two things all three were missing.",
  detail:
    "Much larger, tighter typography. Direct ordering promoted to the primary action with the delivery marketplaces demoted to a footnote. And a signup beside the events, because none of the three prototypes had any way to capture a customer.",
};

const WILDCARD = {
  slug: "concept-d.html",
  name: "Filipino Heritage",
  premise: "A wildcard. Leads with the owners' culture instead of preserving the existing brand.",
  detail:
    "The Philippine flag used as a design system rather than a graphic — its palette carries the page, the eight-ray sun is a mark, the three stars divide sections, and the Filipino menu becomes a headline rather than a side section. Assumes the owners are Filipino, which is NOT verified: all that is confirmed is that a Special Filipino Menu exists on their site. Confirm before showing anyone.",
};

const TASKS = [
  "You just found Over the Top on Google and have never been there. Figure out what kind of restaurant it is.",
  "Find a burger you would consider ordering.",
  "Find the Filipino food.",
  "Figure out whether anything interesting is happening at the restaurant.",
  "Try to order food.",
  "Find when the restaurant is open.",
  "Find how you would get there.",
  "Return to where you started.",
];

export default function LabPage() {
  return (
    <main id="main" className="min-h-full bg-neutral-950 text-neutral-100">
      <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
          Over the Top Burger Bar
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Experience Lab</h1>
        <p className="mt-4 max-w-[60ch] text-neutral-400">
          Three directions for the same restaurant. Identical content, identical branding,
          identical photo system — they differ in what the visitor is assumed to want first,
          and in how the menu works. Open each one and use it properly, ideally on your phone.
        </p>

        <a
          href={REFINED.slug}
          className="group mt-10 flex gap-5 rounded-2xl border border-magenta/50 bg-neutral-900 p-6 transition-colors hover:border-magenta"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-magenta font-display text-lg font-bold text-white">
            ★
          </span>
          <span className="min-w-0">
            <span className="font-display text-xl font-bold">{REFINED.name}</span>
            <span className="mt-1 block text-sm text-neutral-300">{REFINED.premise}</span>
            <span className="mt-2.5 block text-sm leading-relaxed text-neutral-400">
              {REFINED.detail}
            </span>
          </span>
        </a>

        <a
          href={WILDCARD.slug}
          className="group mt-4 flex gap-5 rounded-2xl border border-amber-500/40 bg-neutral-900 p-6 transition-colors hover:border-amber-400"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-amber-500/60 font-display text-lg font-bold text-amber-300">
            D
          </span>
          <span className="min-w-0">
            <span className="font-display text-xl font-bold">{WILDCARD.name}</span>
            <span className="mt-1 block text-sm text-neutral-300">{WILDCARD.premise}</span>
            <span className="mt-2.5 block text-sm leading-relaxed text-neutral-400">
              {WILDCARD.detail}
            </span>
          </span>
        </a>

        <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">
          The three original directions
        </p>
        <ul className="mt-4 grid gap-4">
          {CONCEPTS.map((concept) => (
            <li key={concept.slug}>
              {/*
                Plain anchor, not next/link. These are full page loads in the static
                export, and Link would prefetch routes that do not exist there.
              */}
              <a
                href={concept.slug}
                className="group flex gap-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-neutral-500"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-neutral-700 font-display text-lg font-bold">
                  {concept.letter}
                </span>
                <span className="min-w-0">
                  <span className="font-display text-xl font-bold">{concept.name}</span>
                  <span className="mt-1 block text-sm text-neutral-300">{concept.premise}</span>
                  <span className="mt-2.5 block text-sm leading-relaxed text-neutral-400">
                    {concept.detail}
                  </span>
                  <span className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-neutral-500">
                    <span>Menu: {concept.menuModel}</span>
                    <span>Primary action: {concept.cta}</span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <section className="mt-14 rounded-2xl border border-neutral-800 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold">Try these in each one</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Don&apos;t read the page — use it. Notice where you hesitate.
          </p>
          <ol className="mt-5 flex flex-col gap-3">
            {TASKS.map((task, index) => (
              <li key={task} className="flex gap-3.5 text-sm text-neutral-300">
                <span className="shrink-0 font-display font-bold text-neutral-600">
                  {index + 1}
                </span>
                {task}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded-2xl border border-neutral-800 p-6 text-sm text-neutral-400 sm:p-8">
          <h2 className="font-display text-base font-bold text-neutral-200">
            What is and isn&apos;t real
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <strong className="text-neutral-200">Real:</strong> {menuItems.length} menu items with
              their actual names, plus every price and description shown. Hours, address, phone,
              email, press mentions and the FOX 5 quote all come from the restaurant&apos;s own site.
            </li>
            <li>
              <strong className="text-neutral-200">Missing on purpose:</strong> food photography —
              every photo slot is an honest placeholder. Filipino dish names, which could not be
              sourced anywhere. Event dates, because their own events page says there are none.
            </li>
            <li>
              <strong className="text-neutral-200">Demo only:</strong> the Order button points at
              their current site. Their real ordering provider is still an open question.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
