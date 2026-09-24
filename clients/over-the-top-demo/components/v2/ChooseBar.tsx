import { Action } from "@/components/shared/ui";
import { actions } from "@/data/restaurant";

/**
 * The decision bar — two paths, equal weight.
 *
 * Every visitor is heading for one of two outcomes: eat here, or take it home. The
 * old version made ordering primary and left reserving to the footer, which had the
 * economics backwards — a dine-in table is worth several times a takeout bag, and
 * it also fills the room, which is what makes a restaurant look alive.
 *
 * So both sit side by side, directly under the hero, before anything else competes.
 * The delivery marketplaces stay a footnote under the takeout path: they charge
 * 15-35% and their terms stop the restaurant marketing to those customers later.
 */
export default function ChooseBar() {
  return (
    <div className="border-b border-cream/10 bg-char-2">
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-8 sm:px-8 sm:py-10 md:grid-cols-2 md:gap-8">
        <div className="flex flex-col items-start gap-3 md:border-r md:border-cream/10 md:pr-8">
          <p className="eyebrow">Eat here</p>
          <p className="font-display text-2xl font-bold sm:text-3xl">
            Book a table
          </p>
          <p className="max-w-[34ch] text-sm text-ash">
            Brunch on Sundays, live music most weeks, and the bar runs until 2 AM
            Friday and Saturday.
          </p>
          <Action href={actions.reserve.href} className="mt-1 w-full sm:w-auto">
            Reserve a Table
          </Action>
        </div>

        <div className="flex flex-col items-start gap-3 border-t border-cream/10 pt-5 md:border-t-0 md:pt-0">
          <p className="eyebrow">Take it home</p>
          <p className="font-display text-2xl font-bold sm:text-3xl">
            Order straight from the kitchen
          </p>
          <p className="max-w-[34ch] text-sm text-ash">
            Pickup and delivery, same full menu, no middleman.
          </p>
          <Action href={actions.order.href} className="mt-1 w-full sm:w-auto">
            {actions.order.label}
          </Action>
          <p className="flex flex-wrap items-center gap-x-1 text-xs text-ash">
            <span>Also on</span>
            {actions.marketplaces.map((m, i) => (
              <span key={m.name}>
                {i > 0 && <span className="mr-1">·</span>}
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center underline underline-offset-2 hover:text-cream"
                >
                  {m.name}
                </a>
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
