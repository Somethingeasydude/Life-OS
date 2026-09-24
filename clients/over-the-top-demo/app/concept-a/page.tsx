import type { Metadata } from "next";
import ConceptHeader from "@/components/shared/ConceptHeader";
import DishCard from "@/components/shared/DishCard";
import FoodImage from "@/components/shared/FoodImage";
import LabBar from "@/components/shared/LabBar";
import MenuGallery from "@/components/a/MenuGallery";
import { Action, Band, Heading, Shell } from "@/components/shared/ui";
import {
  AnswersBar, EventsGrid, FilipinoBlock, MobileBar, PressStrip, SiteFooter, VisitBlock,
} from "@/components/shared/blocks";
import { signatureItems } from "@/data/menu";
import { actions, restaurant } from "@/data/restaurant";

export const metadata: Metadata = { title: "Concept A — Food-First" };

const NAV = [
  { label: "Menu", href: "#menu" },
  { label: "Events", href: "#events" },
  { label: "Visit", href: "#visit" },
];

/**
 * CONCEPT A — FOOD-FIRST
 *
 * Premise: the visitor is hungry and undecided, so appetite drives everything.
 * Order: food → signature dishes → menu → Filipino → events → visit.
 * Primary action is "See the Menu"; ordering is secondary until they want something.
 */
export default function ConceptA() {
  const hero = signatureItems[0];

  return (
    <>
      <LabBar current="a" />
      <ConceptHeader home="concept-a.html" nav={NAV} cta={{ label: "See the Menu", href: "#menu" }} />

      <main id="main" className="flex-1">
        {/* Food carries the first screen. Nothing else competes with it. */}
        <section className="relative">
          <FoodImage
            image={hero.image}
            name={hero.name}
            ratio="4/5"
            priority
            sizes="100vw"
            className="sm:aspect-[16/10] lg:aspect-[21/9]"
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-char via-char/75 to-char/15">
            <Shell className="pb-9 sm:pb-14">
              <p className="eyebrow mb-3">Buford, Georgia · Est. {restaurant.established}</p>
              <h1 className="max-w-[16ch] text-4xl font-extrabold sm:text-6xl lg:text-7xl">
                Stacked, loaded, over the top.
              </h1>
              <p className="mt-5 max-w-[46ch] text-ash sm:text-lg">{restaurant.intro}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Action href="#menu">See the Menu</Action>
                <Action href={actions.order.href} tone="secondary">
                  {actions.order.label}
                </Action>
              </div>
            </Shell>
          </div>
        </section>

        <PressStrip />

        <Band>
          <Heading
            eyebrow="Start here"
            title="The ones they drive out for"
            blurb="Three burgers that explain the name."
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

        <Band id="menu" tone="raised">
          <Heading
            eyebrow="The menu"
            title="What you can eat"
            blurb="Sixteen printed sections, grouped into six. Tap a category to browse."
          />
          <MenuGallery />
        </Band>

        <Band>
          <FilipinoBlock menuHref="#menu" />
        </Band>

        <Band id="events" tone="raised">
          <Heading
            eyebrow="What's happening"
            title="It's not just dinner"
            blurb="Live music, karaoke and a house eating challenge."
          />
          <EventsGrid compact />
        </Band>

        <AnswersBar />

        <Band id="visit">
          <Heading eyebrow="Come by" title="Visit" />
          <VisitBlock />
        </Band>
      </main>

      <SiteFooter menuHref="#menu" />
      <MobileBar menuHref="#menu" />
    </>
  );
}
