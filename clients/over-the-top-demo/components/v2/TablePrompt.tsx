import { Action } from "@/components/shared/ui";
import { actions, restaurant } from "@/data/restaurant";

/**
 * Reserve prompt, placed immediately after the menu.
 *
 * This is the highest-intent moment on the page. Someone who has just scrolled
 * eighty dishes is hungry and deciding; asking for the booking here converts far
 * better than waiting for them to reach the footer. Phone sits alongside it because
 * plenty of people booking a table for six would rather just call.
 */
export default function TablePrompt() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-cream/10 bg-char-2 px-6 py-11 text-center sm:px-12 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-72 w-[30rem] -translate-x-1/2 rounded-full bg-magenta/15 blur-[100px]"
      />
      <div className="relative mx-auto max-w-xl">
        <p className="eyebrow mb-3">Hungry now?</p>
        <h2 className="text-3xl font-bold sm:text-4xl">Get a table</h2>
        <p className="mx-auto mt-4 max-w-[44ch] text-ash">
          Walk-ins are welcome, but weekends fill up — especially when there&apos;s a
          band on.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Action href={actions.reserve.href}>
            Reserve a Table
          </Action>
          <Action href={restaurant.phoneHref} tone="secondary">
            Call {restaurant.phone}
          </Action>
        </div>
      </div>
    </div>
  );
}
