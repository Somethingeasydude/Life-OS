import type { Metadata } from "next";
import ConceptHeader from "@/components/shared/ConceptHeader";
import DishCard from "@/components/shared/DishCard";
import FoodImage from "@/components/shared/FoodImage";
import MenuGallery from "@/components/a/MenuGallery";
import ChooseBar from "@/components/v2/ChooseBar";
import TablePrompt from "@/components/v2/TablePrompt";
import Signup from "@/components/v2/Signup";
import { Action, Band, Heading, Shell } from "@/components/shared/ui";
import {
  EventsGrid, FilipinoBlock, MobileBar, PressQuote, PressStrip, SiteFooter, VisitBlock,
} from "@/components/shared/blocks";
import { menuItems, signatureItems } from "@/data/menu";
import { heroPhoto } from "@/data/photos";
import { actions, restaurant } from "@/data/restaurant";

export const metadata: Metadata = { title: "Over the Top Burger Bar" };

const NAV = [
  { label: "Menu", href: "#menu" },
  { label: "Events", href: "#events" },
  { label: "Visit", href: "#visit" },
];

/**
 * THE REFINED BUILD — concept A's journey, executed harder.
 *
 * Robert picked A (food-first) but said it read too much like their current site.
 * Three changes, all inside "same brand, more confident":
 *
 *   1. TYPE. Much larger, much tighter. Their site whispers; this one states.
 *   2. DIRECT ORDERING as the primary action, marketplaces demoted to a footnote.
 *   3. CAPTURE, which no earlier prototype had at all — an owned list is what
 *      actually fills a quiet Tuesday.
 *
 * Brand is untouched: their charcoal, their magenta, their badge, their tagline.
 */
export default function RefinedPage() {
  const hero = signatureItems[0];
  /**
   * The headline sits on the loudest plate on the menu, not on whichever item
   * happens to come first in the data. Falls back to the first signature dish's
   * own photo, and to the designed empty ground when there is no photograph.
   */
  const heroImage = heroPhoto ?? hero.image;
  const thirdRow = menuItems.filter((i) =>
    ["hog-wild", "the-big-catch", "oreo-bomb"].includes(i.id),
  );

  return (
    <>
      <ConceptHeader
        home="v2.html"
        nav={NAV}
        cta={{ label: "Reserve", href: actions.reserve.href }}
        secondaryCta={{ label: "Order", href: actions.order.href }}
      />

      <main id="main" className="flex-1">
        {/* ------------------------------------------------------------- HERO */}
        <section className="relative">
          {/*
            16/9 on desktop rather than the old 2.3/1 letterbox. The source photos
            are delivered `fit=contain`, so the whole dish is already inside its
            frame — a 2.3/1 crop would cut through food to get there. This keeps
            the headline's scale while leaving the burger intact.
          */}
          <FoodImage
            image={heroImage}
            name={hero.name}
            ratio="4/5"
            priority
            bleed
            sizes="100vw"
            className="sm:aspect-[16/10] lg:aspect-[16/9]"
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-char via-char/80 to-char/20">
            <Shell className="pb-9 sm:pb-14">
              <p className="eyebrow mb-4">
                Buford Highway · Est. {restaurant.established}
              </p>
              {/*
                The confidence lives here. Enormous, tight, three short lines —
                their homepage currently opens on a 40px tagline over a photo of a
                wall of playing cards.
              */}
              <h1 className="max-w-[14ch] text-[3.5rem] font-extrabold leading-[0.85] tracking-[-0.04em] sm:text-[6rem] lg:text-[7.5rem]">
                Stacked.
                <br />
                Loaded.
                <br />
                <span className="text-magenta-lift">Over the top.</span>
              </h1>
              <p className="mt-6 max-w-[42ch] text-base text-cream/70 sm:text-lg">
                Gourmet burgers, decked milkshakes and a drink selection to match.
                Open late on Buford Highway.
              </p>
              {/*
                Three pills, identical geometry, one colour family. The filled one
                is the action worth the most money; the other two match it in size
                and hue so the row reads as finished rather than assembled.
              */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Action href={actions.reserve.href}>Reserve a Table</Action>
                <Action href={actions.order.href} tone="secondary">
                  {actions.order.label}
                </Action>
                <Action href="#menu" tone="secondary">
                  See the Menu
                </Action>
              </div>
            </Shell>
          </div>
        </section>

        <PressStrip />
        <ChooseBar />

        {/* --------------------------------------------------------- SIGNATURE */}
        <Band>
          <Heading
            eyebrow="Start here"
            title="The ones they drive out for"
            blurb="Two made national television. The third is a waffle."
          />
          <ul className="grid gap-5 sm:grid-cols-3">
            {signatureItems.slice(0, 3).map((item, index) => (
              <li key={item.id}>
                <DishCard
                  item={item}
                  variant="editorial"
                  ratio="4/5"
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </li>
            ))}
          </ul>
          <ul className="mt-5 grid gap-5 sm:grid-cols-3">
            {thirdRow.map((item) => (
              <li key={item.id}>
                <DishCard
                  item={item}
                  ratio="16/10"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </li>
            ))}
          </ul>
        </Band>

        <PressQuote />

        {/* -------------------------------------------------------------- MENU */}
        <Band id="menu" tone="raised">
          <Heading
            eyebrow="The menu"
            title="Everything they serve"
            blurb="Eighty items, grouped into six. Every one gets its own photograph."
            action={
              <div className="flex flex-wrap gap-2.5">
                <Action href={actions.reserve.href} size="sm">
                  Reserve
                </Action>
                <Action href={actions.order.href} tone="secondary" size="sm">
                  Order
                </Action>
              </div>
            }
          />
          <MenuGallery />
        </Band>

        <Band>
          <TablePrompt />
        </Band>

        <Band tone="raised">
          <FilipinoBlock menuHref="#menu" />
        </Band>

        {/* ------------------------------------------------ EVENTS + CAPTURE */}
        <Band id="events">
          <Heading
            eyebrow="What's happening"
            title="It's not just dinner"
            blurb="Live music, karaoke and the house eating challenge."
          />
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <EventsGrid compact />
            {/*
              Capture sits beside the events, where the reason to subscribe already
              is — rather than as a popup over the food.
            */}
            <Signup />
          </div>
        </Band>

        {/* ------------------------------------------------------------- VISIT */}
        <Band id="visit" tone="raised">
          <Heading
            eyebrow="Come by"
            title="Visit"
          />
          <VisitBlock />
        </Band>
      </main>

      <SiteFooter menuHref="#menu" />
      <MobileBar menuHref="#menu" />
    </>
  );
}
