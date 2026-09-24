"use client";

import { useState } from "react";
import DishCard from "@/components/shared/DishCard";
import { Action } from "@/components/shared/ui";
import { categoriesInGroup, groups, itemsIn } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import type { GroupId } from "@/lib/types";

/**
 * CONCEPT A — visual menu discovery.
 *
 * Premise: the visitor doesn't know what they want, they want to be made hungry.
 * Tabs across six browsing groups rather than the restaurant's fourteen printed
 * sections — a fourteen-tab row is the scroll strip their current site already has,
 * and it is the thing people give up on. Sections stay visible as headings inside
 * each group, so nothing about their real menu is hidden.
 */
export default function MenuGallery() {
  const [active, setActive] = useState<GroupId>("burgers");
  const group = groups.find((entry) => entry.id === active)!;
  const sections = categoriesInGroup(active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Menu groups"
        className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {groups.map((entry) => {
          const selected = entry.id === active;
          return (
            <button
              key={entry.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(entry.id)}
              className={`min-h-11 shrink-0 rounded-full border px-5 text-sm font-semibold transition-colors ${
                selected
                  ? "border-magenta bg-magenta text-white"
                  : "border-cream/15 text-ash hover:border-cream/50 hover:text-cream"
              }`}
            >
              {entry.name}
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-ash">{group.blurb}</p>

      <div className="mt-8 flex flex-col gap-12">
        {sections.map((section) => {
          const items = itemsIn(section.id);
          return (
            <section key={section.id} id={`gallery-${section.id}`} className="scroll-mt-28">
              {sections.length > 1 && (
                <h3 className="mb-1 font-display text-xl font-bold">{section.name}</h3>
              )}
              {section.note && <p className="mb-4 text-[13px] text-ash">{section.note}</p>}

              {items.length > 0 ? (
                <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item, index) => (
                    <li key={item.id}>
                      <DishCard
                        item={item}
                        ratio="4/3"
                        priority={index < 3}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-dashed border-cream/15 bg-char-2 p-7">
                  <div>
                    <p className="font-display text-lg font-bold">{section.emptyState?.title}</p>
                    <p className="mt-1.5 max-w-[52ch] text-sm text-ash">{section.emptyState?.body}</p>
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
    </div>
  );
}
