import FoodImage, { type Ratio } from "@/components/shared/FoodImage";
import type { MenuItem } from "@/lib/types";

const DIETARY_LABEL: Record<string, string> = {
  spicy: "Spicy",
  vegetarian: "Vegetarian",
  "contains-pork": "Pork",
  seafood: "Seafood",
};

/**
 * A price, however the kitchen sells it.
 *
 * Half this menu is priced in variants — Single/Double on the burgers, 10/20/30
 * piece on the wings, glass/bottle on the wine — and an item that shows no price
 * reads as an unfinished page, which is the one thing a restaurant owner will
 * notice immediately. Variants stack so the numbers stay in a column and the
 * labels stay legible at card width.
 */
function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

function Price({ item }: { item: MenuItem }) {
  if (item.priceVariants?.length) {
    return (
      <ul className="shrink-0 text-right leading-tight">
        {item.priceVariants.map((variant) => (
          <li key={variant.label} className="whitespace-nowrap">
            <span className="mr-1.5 text-[11px] font-medium uppercase tracking-wide text-ash">
              {variant.label}
            </span>
            <span className="font-semibold tabular-nums text-magenta-lift">
              {money(variant.price)}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (item.price === undefined) return null;

  return (
    <span className="shrink-0 font-semibold tabular-nums text-magenta-lift">
      {money(item.price)}
    </span>
  );
}

function Flags({ item }: { item: MenuItem }) {
  if (!item.dietary?.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {item.dietary.map((flag) => (
        <li
          key={flag}
          className="rounded-full border border-cream/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ash"
        >
          {DIETARY_LABEL[flag]}
        </li>
      ))}
    </ul>
  );
}

/**
 * One menu item, in three presentations.
 *
 * Every field except the name is optional, and the card has to look deliberate at
 * any level of completeness — full photo, description and price, or nothing but a
 * name. That matters because the real menu fills in gradually; a card that only
 * looks right when every field is populated looks broken for months.
 *
 *   card      — photo-led, for visual browsing
 *   row       — compact horizontal, for scanning a long list
 *   editorial — large photo, minimal text, for featured placement
 */
export default function DishCard({
  item,
  variant = "card",
  ratio = "4/3",
  priority = false,
  sizes,
}: {
  item: MenuItem;
  variant?: "card" | "row" | "editorial";
  ratio?: Ratio;
  priority?: boolean;
  sizes?: string;
}) {
  if (variant === "row") {
    return (
      <article className="flex items-start gap-4 border-b border-cream/10 py-4 last:border-b-0">
        <FoodImage
          image={item.image}
          name={item.name}
          ratio="1/1"
          compact
          priority={priority}
          sizes="88px"
          className="w-20 shrink-0 rounded-xl sm:w-24"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-base font-bold sm:text-lg">{item.name}</h3>
            <Price item={item} />
          </div>
          {item.accolade && <p className="eyebrow">{item.accolade}</p>}
          {item.description && (
            <p className="text-[13.5px] leading-relaxed text-ash">{item.description}</p>
          )}
          <Flags item={item} />
        </div>
      </article>
    );
  }

  if (variant === "editorial") {
    return (
      <article className="group relative overflow-hidden rounded-2xl">
        <FoodImage
          image={item.image}
          name={item.name}
          ratio={ratio}
          priority={priority}
          sizes={sizes}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-char via-char/80 to-transparent p-5 pt-16">
          {item.accolade && <p className="eyebrow mb-1">{item.accolade}</p>}
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl font-bold sm:text-2xl">{item.name}</h3>
            <Price item={item} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col gap-3.5">
      <div className="relative">
        <FoodImage
          image={item.image}
          name={item.name}
          ratio={ratio}
          priority={priority}
          sizes={sizes}
          className="rounded-2xl"
        />
        {item.accolade && (
          <span className="absolute left-3 top-3 rounded-full bg-magenta px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
            {item.accolade}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-bold sm:text-xl">{item.name}</h3>
          <Price item={item} />
        </div>
        {item.description && (
          <p className="text-sm leading-relaxed text-ash">{item.description}</p>
        )}
        <Flags item={item} />
      </div>
    </article>
  );
}
