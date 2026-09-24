import { Action, Band, Heading, Shell } from "@/components/shared/ui";
import { actions, press, pressQuote, restaurant } from "@/data/restaurant";
import { events } from "@/data/events";

/** Their four real press mentions. Presented as a quiet credential strip, not a résumé. */
export function PressStrip({ tone = "indigo" }: { tone?: "indigo" | "flat" }) {
  return (
    <div
      className={`border-y border-cream/10 ${
        tone === "indigo" ? "bg-indigo-bar" : "bg-char-2"
      }`}
    >
      <Shell className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5 py-4">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.17em] text-cream/55">
          As seen on
        </span>
        {press.map((outlet) => (
          <span key={outlet.name} className="font-display text-sm font-bold">
            {outlet.name}
          </span>
        ))}
      </Shell>
    </div>
  );
}

export function PressQuote() {
  return (
    <Shell className="py-12 text-center">
      <blockquote className="mx-auto max-w-[62ch] font-display text-lg font-medium leading-snug sm:text-2xl">
        &ldquo;{pressQuote.text}&rdquo;
      </blockquote>
      <p className="mt-5 text-[13.5px] text-ash">
        — {pressQuote.attribution}{" "}
        <span className="text-magenta-lift">{pressQuote.tag}</span>
      </p>
    </Shell>
  );
}

/** Hours, phone, directions. The three things a hungry person needs in seconds. */
export function AnswersBar() {
  const rows = [
    { label: "Open late", value: restaurant.lateNight, href: undefined },
    { label: "Call ahead", value: restaurant.phone, href: restaurant.phoneHref },
    { label: "Find us", value: restaurant.address.street, href: restaurant.directionsUrl },
  ];
  return (
    <div className="border-y border-cream/10 bg-char-2">
      <Shell>
        <dl className="grid divide-y divide-cream/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {rows.map((row) => {
            const body = (
              <>
                <dt className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-ash">
                  {row.label}
                </dt>
                <dd className="mt-1.5 font-semibold">{row.value}</dd>
              </>
            );
            return row.href ? (
              <a
                key={row.label}
                href={row.href}
                {...(row.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="block py-4 transition-colors hover:text-magenta-lift sm:px-6 sm:py-5 sm:text-center"
              >
                {body}
              </a>
            ) : (
              <div key={row.label} className="py-4 sm:px-6 sm:py-5 sm:text-center">
                {body}
              </div>
            );
          })}
        </dl>
      </Shell>
    </div>
  );
}

export function FilipinoBlock({ menuHref }: { menuHref: string }) {
  return (
    <div className="rounded-3xl border border-cream/10 bg-char-2 p-7 sm:p-11">
      <p className="eyebrow mb-3">Also on the menu</p>
      <h2 className="text-3xl font-bold sm:text-4xl">A Special Filipino Menu</h2>
      {/*
        Factual only. Whether the owners want to lead with Filipino cuisine is an
        open question for them, not a call we make in a prototype.
      */}
      <p className="mt-4 max-w-[48ch] text-ash">
        Alongside the burger bar menu, Over the Top serves a separate Filipino menu.
        Ask your server, or call ahead — the kitchen will tell you what is on this week.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Action href={menuHref}>See the menu</Action>
        <Action href={restaurant.phoneHref} tone="secondary">
          Call {restaurant.phone}
        </Action>
      </div>
    </div>
  );
}

export function EventsGrid({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`grid gap-4 ${compact ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      {events.map((event) => (
        <li key={event.id}>
          <article className="flex h-full flex-col gap-2.5 rounded-2xl border border-cream/10 border-t-[3px] border-t-magenta bg-char p-6">
            {/*
              No date is shown because none is verifiable — their own events page
              currently says there are none upcoming. Cadence is what we can stand behind.
            */}
            <p className="eyebrow">{event.cadence}</p>
            <h3 className="font-display text-xl font-bold">{event.name}</h3>
            <p className="text-sm leading-relaxed text-ash">{event.description}</p>
            {event.href && (
              <a
                href={event.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex min-h-11 items-center pt-2 text-[13.5px] font-semibold text-magenta-lift hover:underline"
              >
                This week&apos;s lineup →
              </a>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}

export function VisitBlock() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-cream/10 bg-char-2 p-6 sm:p-8">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-ash">Address</p>
        <address className="mt-3 not-italic">
          <p className="font-display text-xl font-bold sm:text-2xl">
            {restaurant.address.street}
          </p>
          <p className="mt-1 text-ash">
            {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zip}
          </p>
        </address>
        <div className="mt-6 flex flex-wrap gap-3">
          <Action href={restaurant.directionsUrl}>Get Directions</Action>
          <Action href={restaurant.phoneHref} tone="secondary">
            {restaurant.phone}
          </Action>
        </div>
        <div className="mt-6 border-t border-cream/10 pt-5">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-ash">
            Book a table
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Action href={actions.reserve.href} tone="secondary" size="sm">
              Reserve a Table
            </Action>
            <a
              href={`mailto:${restaurant.email}`}
              className="inline-flex min-h-11 items-center text-sm text-magenta-lift hover:underline"
            >
              {restaurant.email}
            </a>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-cream/10 bg-char-2 p-6 sm:p-8">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-ash">Hours</p>
        <dl className="mt-3 divide-y divide-cream/10">
          {restaurant.hours.map((entry) => (
            <div key={entry.days} className="flex items-baseline justify-between gap-4 py-3">
              <dt>{entry.days}</dt>
              <dd className="tabular-nums text-ash">{entry.time}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-ash">{restaurant.hoursNote}</p>
      </div>
    </div>
  );
}

export function SiteFooter({
  menuHref,
  credit = false,
}: {
  menuHref: string;
  /** Name the author on the client build — this link gets forwarded. */
  credit?: boolean;
}) {
  return (
    <footer className="border-t border-cream/10 bg-char-2 pb-24 pt-12 md:pb-12">
      <Shell>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-base font-bold">{restaurant.name}</p>
            <p className="mt-2 max-w-[30ch] text-sm text-ash">
              {restaurant.tagline} Burgers and late nights on Buford Highway since{" "}
              {restaurant.established}.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.15em] text-ash">
              Visit
            </p>
            <address className="text-sm not-italic leading-relaxed text-ash">
              {restaurant.address.street}
              <br />
              {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zip}
              <br />
              <a href={restaurant.phoneHref} className="inline-flex min-h-11 items-center hover:text-magenta-lift">
                {restaurant.phone}
              </a>
            </address>
          </div>
          <div>
            <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.15em] text-ash">
              Hours
            </p>
            <ul className="text-sm text-ash">
              {restaurant.hours.map((entry) => (
                <li key={entry.days} className="py-0.5">
                  {entry.days.replace("Sunday – Thursday", "Sun–Thu").replace("Friday – Saturday", "Fri–Sat")}{" "}
                  {entry.time}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.15em] text-ash">
              Order &amp; Follow
            </p>
            <ul className="text-sm">
              <li>
                <a href={menuHref} className="inline-flex min-h-11 items-center text-ash hover:text-magenta-lift">
                  Menu
                </a>
              </li>
              {[
                { label: "Reservations", href: actions.reserve.href },
                { label: "Instagram", href: restaurant.social.instagram },
                { label: "Facebook", href: restaurant.social.facebook },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-ash hover:text-magenta-lift"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-cream/10 pt-5 text-xs text-ash">
          <span>
            {restaurant.name} · {restaurant.address.street}, {restaurant.address.city},{" "}
            {restaurant.address.state} {restaurant.address.zip}
          </span>
          <span>
            Concept prototype — not the official website.
            {credit && (
              <>
                {" "}
                Built by{" "}
                <a
                  href="https://ram-strategicsystems.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-cream hover:text-magenta-lift"
                >
                  RAM Strategic Systems
                </a>
                .
              </>
            )}
          </span>
        </div>
      </Shell>
    </footer>
  );
}

/**
 * Persistent thumb-reach actions.
 *
 * Four, because a restaurant visitor wants one of exactly four things: see the food,
 * book a table, order it to go, or phone someone. Reserve used to be missing here,
 * which pushed the highest-value action off the phone entirely.
 */
export function MobileBar({ menuHref, menuLabel = "Menu" }: { menuHref: string; menuLabel?: string }) {
  const items = [
    { label: menuLabel, href: menuHref, icon: "M4 6h16M4 12h16M4 18h10" },
    { label: "Reserve", href: actions.reserve.href, icon: "M7 4v3M17 4v3M4 10h16M5 7h14a1 1 0 011 1v11a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1z" },
    { label: "Order", href: actions.order.href, icon: "M6 6h15l-1.5 9h-12zM6 6L5 3H2", accent: true },
    { label: "Call", href: restaurant.phoneHref, icon: "M4 5c0 8.284 6.716 15 15 15v-3.5l-4-1.5-2 2a12 12 0 01-6-6l2-2L7.5 5z" },
  ];
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-cream/15 bg-char/97 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wide ${
            item.accent ? "text-magenta-lift" : "text-cream"
          }`}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d={item.icon} />
          </svg>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export { Band, Heading, Shell, Action };
