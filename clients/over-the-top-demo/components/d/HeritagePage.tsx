import ConceptHeader from "@/components/shared/ConceptHeader";
import DishCard from "@/components/shared/DishCard";
import LabBar from "@/components/shared/LabBar";
import MenuGallery from "@/components/a/MenuGallery";
import Signup from "@/components/v2/Signup";
import TablePrompt from "@/components/v2/TablePrompt";
import ChooseBar from "@/components/v2/ChooseBar";
import SunMark from "@/components/d/SunMark";
import Stars from "@/components/d/Stars";
import { Action, Band, Heading, Shell } from "@/components/shared/ui";
import {
  EventsGrid, MobileBar, PressQuote, PressStrip, SiteFooter, VisitBlock,
} from "@/components/shared/blocks";
import { signatureItems } from "@/data/menu";
import { actions, restaurant } from "@/data/restaurant";


const NAV = [
  { label: "Menu", href: "#menu" },
  { label: "Filipino Menu", href: "#filipino" },
  { label: "Events", href: "#events" },
  { label: "Visit", href: "#visit" },
];

/**
 * CONCEPT D — FILIPINO HERITAGE (WILDCARD)
 *
 * Requested as a deliberate break from brand preservation. It leads with the
 * owners' culture rather than treating the Filipino menu as a side section.
 *
 * ASSUMPTION, UNVERIFIED: that the owners are Filipino. All that is confirmed is
 * that their current site carries a "Special Filipino Menu". If the heritage is
 * not theirs, none of this is usable — a national flag used decoratively by a
 * business with no connection to it reads badly, and rightly.
 *
 * The flag is treated as a design system, not a graphic: its palette carries the
 * whole page (see `.theme-ph` in globals.css), the eight-ray sun is a mark, and
 * the three stars divide sections. Their burger badge is kept — the brief forbids
 * inventing a replacement logo and that restraint still looks right here.
 */
/**
 * Two builds off one page. `lab` is our review copy — it carries the concept
 * switcher and links back to the Experience Lab. Without it this is the client
 * build: no switcher, no lab chrome, and a quiet credit in the footer. The page
 * itself is identical either way, so what Robert reviews is what the owner opens.
 */
export default function HeritagePage({ lab = false }: { lab?: boolean }) {
  return (
    <div className="theme-ph flex min-h-full flex-col">
      {lab && <LabBar />}
      <ConceptHeader
        home={lab ? "concept-d.html" : "index.html"}
        nav={NAV}
        cta={{ label: "Reserve", href: actions.reserve.href }}
        secondaryCta={{ label: "Order", href: actions.order.href }}
      />

      <main id="main" className="flex-1">
        {/* ------------------------------------------------------------- HERO */}
        <section className="relative overflow-hidden">
          {/*
            The flag's white triangle, as structure rather than ornament — a single
            diagonal that the hero content sits against.
          */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-[#0038A8] lg:block"
            style={{ clipPath: "polygon(28% 0, 100% 0, 100% 100%, 0 100%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 text-[#FCD116]/[0.16]"
          >
            <SunMark className="size-[42rem]" />
          </div>

          {/* Flag-proportion stripe: blue over red, split by the white triangle. */}
          <div aria-hidden className="absolute inset-x-0 top-0 flex h-1.5">
            <span className="flex-1 bg-[#0038A8]" />
            <span className="flex-1 bg-[#FCD116]" />
            <span className="flex-1 bg-[#CE1126]" />
          </div>

          <Shell className="relative grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="eyebrow mb-4 flex items-center gap-3">
                <SunMark className="size-4" />
                Filipino-owned · Buford, Georgia
              </p>
              <h1 className="text-[3.4rem] font-extrabold leading-[0.88] tracking-[-0.035em] sm:text-7xl lg:text-[5.5rem]">
                Two kitchens.
                <br />
                <span className="text-[#FCD116]">One family.</span>
              </h1>
              <p className="mt-6 max-w-[44ch] text-base leading-relaxed text-ash sm:text-lg">
                Gourmet burgers and decked milkshakes, served alongside the Filipino
                dishes we grew up on. Both menus, every night, same kitchen.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Action href={actions.reserve.href}>
                  Reserve a Table
                </Action>
                <Action href={actions.order.href} tone="secondary">
                  {actions.order.label}
                </Action>
              </div>
              <Stars className="mt-10 text-[#FCD116]" />
            </div>

            <div className="rounded-3xl border-t-4 border-[#CE1126] bg-white p-7 text-[#0A1B3D] shadow-xl sm:p-9">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.17em] text-[#CE1126]">What the flag says</p>
              {/*
                Real symbolism, stated plainly. This block is what keeps the identity
                from being decoration — it explains why these colours are here.
              */}
              <dl className="divide-y divide-[#0A1B3D]/10 text-sm">
                {[
                  { k: "Eight rays", v: "The eight provinces that rose first." },
                  { k: "Three stars", v: "Luzon, Visayas, Mindanao." },
                  { k: "Blue", v: "Peace and justice." },
                  { k: "Red", v: "Courage." },
                ].map((row) => (
                  <div key={row.k} className="flex items-baseline justify-between gap-5 py-3">
                    <dt className="font-semibold">{row.k}</dt>
                    <dd className="text-right text-[#5A6B8C]">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Shell>
        </section>

        <PressStrip />
        <ChooseBar />

        {/* --------------------------------------------------------- SIGNATURE */}
        <Band>
          <Heading
            eyebrow="From the burger side"
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
        </Band>

        {/* ---------------------------------------------------------- FILIPINO */}
        {/*
          The whole point of this direction: the Filipino menu is a headline, not a
          footnote. Still no invented dishes — the section is factual and empty until
          the kitchen supplies its list.
        */}
        <section id="filipino" className="field-yellow border-y-4 border-[#CE1126]">
          <Shell className="py-16 text-center sm:py-20">
            <SunMark className="mx-auto size-12 text-[#CE1126]" />
            <h2 className="mx-auto mt-6 max-w-[22ch] text-4xl font-extrabold sm:text-5xl">
              The Special Filipino Menu
            </h2>
            <p className="mx-auto mt-5 max-w-[52ch] text-[#001B4E]/80">
              A separate Filipino menu runs alongside the burger bar menu every night.
              It changes with what the kitchen is cooking — ask your server, or call
              ahead and we&apos;ll tell you what&apos;s on.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Action href={restaurant.phoneHref}>
                Call {restaurant.phone}
              </Action>
              <Action href="#menu" tone="secondary">
                See the full menu
              </Action>
            </div>
            <Stars className="mx-auto mt-10 justify-center text-[#CE1126]" />
          </Shell>
        </section>

        <div className="field-navy border-y-4 border-[#FCD116]">
          <PressQuote />
        </div>

        {/* -------------------------------------------------------------- MENU */}
        <Band id="menu" tone="raised">
          <Heading
            eyebrow="The menu"
            title="Everything we serve"
            blurb="Eighty items, grouped into six."
            action={
              <div className="flex flex-wrap gap-2.5">
                <Action href={actions.reserve.href} size="sm">Reserve</Action>
                <Action href={actions.order.href} tone="secondary" size="sm">Order</Action>
              </div>
            }
          />
          <MenuGallery />
        </Band>

        <Band>
          <TablePrompt />
        </Band>

        {/* --------------------------------------------------- EVENTS + SIGNUP */}
        <Band id="events" tone="raised">
          <Heading
            eyebrow="What's happening"
            title="It's not just dinner"
            blurb="Live music, karaoke and the house eating challenge."
          />
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <EventsGrid compact />
            <Signup />
          </div>
        </Band>

        <Band id="visit">
          <Heading eyebrow="Come by" title="Visit" />
          <VisitBlock />
        </Band>
      </main>

      <SiteFooter menuHref="#menu" credit={!lab} />
      <MobileBar menuHref="#menu" />
    </div>
  );
}
