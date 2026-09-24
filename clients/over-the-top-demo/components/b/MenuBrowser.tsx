"use client";

import { useMemo, useState } from "react";
import DishCard from "@/components/shared/DishCard";
import { Action } from "@/components/shared/ui";
import { categories, categoriesInGroup, groups, menuItems } from "@/data/menu";
import { restaurant } from "@/data/restaurant";

/**
 * CONCEPT B — utility menu.
 *
 * Premise: the customer already decided to look at the menu and wants the shortest
 * path to "what do they have?". So: a search box that filters by name, description
 * and dietary flag; a jump rail that stays put; and compact rows rather than a photo
 * grid, because rows fit roughly three times as many items on one phone screen.
 *
 * Photos are still present — the owner's requirement — just sized for scanning.
 */
export default function MenuBrowser() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return null;
    return menuItems.filter((item) =>
      [item.name, item.description ?? "", ...(item.dietary ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query]);

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[210px_1fr] lg:gap-12">
      {/* Jump rail — a sidebar on desktop, a sticky chip row on phones. */}
      <nav aria-label="Jump to category" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 hidden text-[10.5px] font-bold uppercase tracking-[0.15em] text-ash lg:block">
          Sections
        </p>
        <ul className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-4 lg:overflow-visible lg:px-0">
          {groups.map((group) => (
            <li key={group.id} className="shrink-0 lg:w-full">
              <p className="mb-1 hidden text-[10px] font-bold uppercase tracking-[0.14em] text-ash/70 lg:block">
                {group.name}
              </p>
              <ul className="flex gap-2 lg:flex-col lg:gap-0.5">
                {categoriesInGroup(group.id).map((entry) => (
                  <li key={entry.id} className="shrink-0">
                    <a
                      href={`#section-${entry.id}`}
                      className="flex min-h-11 items-center whitespace-nowrap rounded-full border border-cream/15 px-4 text-sm font-semibold text-ash transition-colors hover:border-cream/50 hover:text-cream lg:rounded-lg lg:border-0 lg:border-l-2 lg:border-transparent lg:px-3 lg:hover:border-l-magenta lg:hover:bg-char-2"
                    >
                      {entry.name}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0">
        <label htmlFor="menu-search" className="sr-only">
          Search the menu
        </label>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash"
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            id="menu-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search burgers, salads, anything…"
            className="min-h-12 w-full rounded-full border border-cream/15 bg-char-2 pl-11 pr-4 text-[15px] text-cream placeholder:text-ash/70 focus:border-magenta focus:outline-none"
          />
        </div>

        {results ? (
          <div className="mt-7">
            <p className="text-sm text-ash" role="status">
              {results.length} {results.length === 1 ? "item" : "items"} matching &ldquo;{query}&rdquo;
            </p>
            <div className="mt-2">
              {results.map((item) => (
                <DishCard key={item.id} item={item} variant="row" />
              ))}
            </div>
            {results.length === 0 && (
              <p className="mt-4 text-sm text-ash">
                Not everything is listed online yet — call {restaurant.phone} and the kitchen
                will tell you.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-12">
            {categories.map((entry) => {
              const items = menuItems.filter((item) => item.category === entry.id);
              return (
                <section key={entry.id} id={`section-${entry.id}`} className="scroll-mt-28">
                  <div className="border-b border-cream/10 pb-3">
                    <h2 className="font-display text-2xl font-bold">{entry.name}</h2>
                    <p className="mt-1 text-sm text-ash">{entry.note ?? entry.blurb}</p>
                  </div>
                  {items.length > 0 ? (
                    <div className="mt-2">
                      {items.map((item) => (
                        <DishCard key={item.id} item={item} variant="row" />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-cream/15 bg-char-2 px-5 py-4">
                      <div>
                        <p className="font-semibold">{entry.emptyState?.title}</p>
                        <p className="mt-1 max-w-[52ch] text-sm text-ash">
                          {entry.emptyState?.body}
                        </p>
                      </div>
                      <Action href={restaurant.phoneHref} tone="secondary" size="sm">
                        Call
                      </Action>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
