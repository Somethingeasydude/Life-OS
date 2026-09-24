"use client";

import { useId, useState } from "react";
import { restaurant } from "@/data/restaurant";

/**
 * Capture.
 *
 * The one thing missing from every earlier prototype: no way for a visitor to leave
 * a contact. That matters because an owned list is what lets the restaurant fill a
 * quiet Tuesday, instead of renting reach from a delivery app that contractually
 * forbids marketing to those customers.
 *
 * Not a popup — popups get dismissed. It sits where the reason to subscribe already
 * is: next to the events. The trade is explicit (what you get, how often).
 *
 * DEMO ONLY: submits nowhere. There is no backend in this project and no email or
 * SMS provider chosen yet. It validates and shows the confirmation state so the
 * interaction can be judged; wiring it to a real provider is a separate, small task.
 */
export default function Signup() {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "done">("idle");
  const inputId = useId();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    setState("done");
  }

  return (
    <div className="rounded-3xl border border-cream/10 bg-char-2 p-7 sm:p-10">
      <p className="eyebrow mb-3">Don&apos;t miss it</p>
      <h2 className="text-2xl font-bold sm:text-3xl">
        Know what&apos;s on before you get here
      </h2>
      <p className="mt-3 max-w-[46ch] text-ash">
        Live music, karaoke nights, what the kitchen is running on the Filipino menu.
        One message a week, nothing else.
      </p>

      {state === "done" ? (
        <p
          role="status"
          className="mt-6 flex items-center gap-2.5 font-semibold text-magenta-lift"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6L9 17l-5-5" />
          </svg>
          You&apos;re on the list. See you here.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label htmlFor={inputId} className="sr-only">
            Email address or mobile number
          </label>
          <input
            id={inputId}
            type="text"
            inputMode="email"
            autoComplete="email"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Email or mobile number"
            className="min-h-12 flex-1 rounded-full border border-cream/20 bg-char px-5 text-[15px] text-cream placeholder:text-ash/70 focus:border-magenta focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-12 rounded-full bg-magenta px-7 text-sm font-semibold text-white transition-colors hover:bg-magenta-lift"
          >
            Keep me posted
          </button>
        </form>
      )}

      <p className="mt-4 text-xs text-ash">
        No spam. Unsubscribe any time. Or just call {restaurant.phone}.
      </p>
    </div>
  );
}
