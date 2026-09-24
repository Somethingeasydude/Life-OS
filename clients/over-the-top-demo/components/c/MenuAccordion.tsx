"use client";

import { useState } from "react";
import DishCard from "@/components/shared/DishCard";
import { Action } from "@/components/shared/ui";
import { categories, itemsIn } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import type { CategoryId } from "@/lib/types";

/**
 * CONCEPT C — progressive disclosure.
 *
 * Premise: the customer is choosing where to spend an evening, not scanning a price
 * list. So the whole menu is legible as a shape in one screen — six named sections,
 * item counts visible — and detail opens only where they ask for it. The first
 * section starts open so the page is never a wall of closed doors.
 */
export default function MenuAccordion() {
  const [open, setOpen] = useState<CategoryId | null>("burgers");

  return (
    <div className="divide-y divide-cream/10 border-y border-cream/10">
      {categories.map((entry) => {
        const items = itemsIn(entry.id);
        const expanded = open === entry.id;
        return (
          <div key={entry.id}>
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`panel-${entry.id}`}
                onClick={() => setOpen(expanded ? null : entry.id)}
                className="flex w-full items-center justify-between gap-5 py-5 text-left transition-colors hover:text-magenta-lift"
              >
                <span className="flex flex-col gap-1">
                  <span className="font-display text-xl font-bold sm:text-2xl">
                    {entry.name}
                  </span>
                  <span className="text-[13px] text-ash">{entry.blurb}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-xs font-semibold uppercase tracking-wider text-ash sm:inline">
                    {items.length > 0 ? `${items.length} items` : "At the bar"}
                  </span>
                  <span
                    aria-hidden
                    className={`grid size-9 place-items-center rounded-full border border-cream/20 transition-transform ${
                      expanded ? "rotate-45" : ""
                    }`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </span>
              </button>
            </h3>

            <div id={`panel-${entry.id}`} hidden={!expanded} className="pb-8">
              {items.length > 0 ? (
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <li key={item.id}>
                      <DishCard
                        item={item}
                        ratio="3/2"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-char-2 px-6 py-5">
                  <div>
                    <p className="font-semibold">{entry.emptyState?.title}</p>
                    <p className="mt-1 max-w-[52ch] text-sm text-ash">{entry.emptyState?.body}</p>
                  </div>
                  <Action href={restaurant.phoneHref} tone="secondary" size="sm">
                    Call
                  </Action>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
