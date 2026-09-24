import type { Metadata } from "next";
import ConceptHeader from "@/components/shared/ConceptHeader";
import DishCard from "@/components/shared/DishCard";
import LabBar from "@/components/shared/LabBar";
import MenuBrowser from "@/components/b/MenuBrowser";
import { Action, Band, Heading, Shell } from "@/components/shared/ui";
import {
  EventsGrid, FilipinoBlock, MobileBar, PressStrip, SiteFooter, VisitBlock,
} from "@/components/shared/blocks";
import { signatureItems } from "@/data/menu";
import { actions, restaurant } from "@/data/restaurant";

export const metadata: Metadata = { title: "Concept B — Menu-First" };

const NAV = [
  { label: "Menu", href: "#menu" },
  { label: "Events", href: "#events" },
  { label: "Visit", href: "#visit" },
];

/**
 * CONCEPT B — MENU-FIRST
 *
 * Premise: the visitor already knows they're looking at a burger place and wants
 * the menu. Every pixel before the menu is a tax, so the preamble is one compact
 * band carrying identity, hours, phone and directions at once — then the menu starts.
 * Primary action is Order.
 */
export default function ConceptB() {
  return (
    <>
      <LabBar current="b" />
      <ConceptHeader
        home="concept-b.html"
        nav={NAV}
        cta={{ label: actions.order.label, href: actions.order.href }}
      />

      <main id="main" className="flex-1">
        {/* Identity, orientation and the three key facts — in one screen, then out of the way. */}
        <section className="border-b border-cream/10 bg-char-2">
          <Shell className="py-9 sm:py-12">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow mb-2.5">Burger bar · Buford, Georgia</p>
                <h1 className="max-w-[18ch] text-3xl font-extrabold sm:text-5xl">
                  {restaurant.name}
                </h1>
                <p className="mt-3 max-w-[52ch] text-ash">{restaurant.intro}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Action href={actions.order.href}>{actions.order.label}</Action>
                <Action href={actions.reserve.href} tone="secondary">
                  Reserve
                </Action>
              </div>
            </div>

            <dl className="mt-8 grid gap-x-8 gap-y-3 border-t border-cream/10 pt-6 text-sm sm:grid-cols-3">
              <div className="flex gap-2">
                <dt className="text-ash">Today</dt>
                <dd className="font-semibold">11 AM – 12 AM</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-ash">Call</dt>
                <dd>
                  <a href={restaurant.phoneHref} className="inline-flex min-h-11 items-center font-semibold hover:text-magenta-lift">
                    {restaurant.phone}
                  </a>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-ash">Find us</dt>
                <dd>
                  <a
                    href={restaurant.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center font-semibold hover:text-magenta-lift"
                  >
                    {restaurant.address.street}
                  </a>
                </dd>
              </div>
            </dl>
          </Shell>
        </section>

        {/* Signature items pinned above the full list — the shortcut for the undecided. */}
        <Band>
          <Heading eyebrow="If you can't decide" title="Start with these" />
          <ul className="grid gap-5 sm:grid-cols-3">
            {signatureItems.map((item, index) => (
              <li key={item.id}>
                <DishCard
                  item={item}
                  ratio="16/10"
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </li>
            ))}
          </ul>
        </Band>

        <Band id="menu" tone="raised">
          <Heading
            eyebrow="The full menu"
            title="Everything they serve"
            blurb="Search it, or jump straight to a section."
          />
          <MenuBrowser />
        </Band>

        <Band>
          <FilipinoBlock menuHref="#section-filipino" />
        </Band>

        <PressStrip tone="flat" />

        <Band id="events">
          <Heading eyebrow="What's happening" title="Events" />
          <EventsGrid compact />
        </Band>

        <Band id="visit" tone="raised">
          <Heading eyebrow="Come by" title="Visit" />
          <VisitBlock />
        </Band>
      </main>

      <SiteFooter menuHref="#menu" />
      <MobileBar menuHref="#menu" />
    </>
  );
}
