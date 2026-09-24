import type { Metadata } from "next";
import ConceptHeader from "@/components/shared/ConceptHeader";
import DishCard from "@/components/shared/DishCard";
import FoodImage from "@/components/shared/FoodImage";
import LabBar from "@/components/shared/LabBar";
import MenuAccordion from "@/components/c/MenuAccordion";
import { Action, Band, Heading, Shell } from "@/components/shared/ui";
import {
  EventsGrid, FilipinoBlock, MobileBar, PressQuote, PressStrip, SiteFooter, VisitBlock,
} from "@/components/shared/blocks";
import { signatureItems } from "@/data/menu";
import { actions, restaurant } from "@/data/restaurant";

export const metadata: Metadata = { title: "Concept C — Experience-First" };

const NAV = [
  { label: "Tonight", href: "#tonight" },
  { label: "Food", href: "#food" },
  { label: "Menu", href: "#menu" },
  { label: "Visit", href: "#visit" },
];

/**
 * CONCEPT C — EXPERIENCE-FIRST
 *
 * Premise: the visitor is picking somewhere to spend an evening, not reading a price
 * list. Order: identity and atmosphere → what's on → food → menu → proof → visit.
 * Primary action is Reserve.
 *
 * The risk this concept is deliberately testing: whether leading with atmosphere makes
 * the restaurant more appealing, or just makes the menu harder to reach. That trade-off
 * is the thing to judge — the menu is two taps away here, one tap in B.
 */
export default function ConceptC() {
  return (
    <>
      <LabBar current="c" />
      <ConceptHeader
        home="concept-c.html"
        nav={NAV}
        cta={{ label: "Reserve", href: actions.reserve.href }}
      />

      <main id="main" className="flex-1">
        <section className="relative overflow-hidden border-b border-cream/10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-48 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-magenta/18 blur-[130px]"
          />
          <Shell className="relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="eyebrow mb-4">Buford Highway · Open late</p>
              <h1 className="text-4xl font-extrabold sm:text-6xl">
                Burgers, cocktails and a room that stays loud.
              </h1>
              <p className="mt-5 max-w-[46ch] text-ash sm:text-lg">{restaurant.intro}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Action href={actions.reserve.href}>Reserve a Table</Action>
                <Action href="#menu" tone="secondary">
                  See the Menu
                </Action>
              </div>
            </div>
            <FoodImage
              image={undefined}
              name="The Room"
              ratio="4/5"
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="rounded-3xl border border-cream/10"
            />
          </Shell>
        </section>

        {/* What's on comes before the menu here — that is the whole bet of this concept. */}
        <Band id="tonight">
          <Heading
            eyebrow="What's happening"
            title="More than dinner"
            blurb="Live music, karaoke and the house eating challenge — reasons to come that aren't only the food."
          />
          <EventsGrid />
        </Band>

        <Band id="food" tone="raised">
          <Heading
            eyebrow="The food"
            title="What they're known for"
            blurb="Three that made the press."
          />
          <ul className="grid gap-5 sm:grid-cols-3">
            {signatureItems.map((item) => (
              <li key={item.id}>
                <DishCard
                  item={item}
                  variant="editorial"
                  ratio="4/5"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </li>
            ))}
          </ul>
        </Band>

        <PressStrip />
        <PressQuote />

        <Band id="menu" tone="raised">
          <Heading
            eyebrow="The menu"
            title="Open what you're hungry for"
            blurb="Six sections. Tap one to see what's in it."
          />
          <MenuAccordion />
        </Band>

        <Band>
          <FilipinoBlock menuHref="#menu" />
        </Band>

        <Band id="visit" tone="raised">
          <Heading
            eyebrow="Come by"
            title="Visit"
            action={<Action href={actions.reserve.href} size="sm">Reserve a Table</Action>}
          />
          <VisitBlock />
        </Band>
      </main>

      <SiteFooter menuHref="#menu" />
      <MobileBar menuHref="#menu" />
    </>
  );
}
