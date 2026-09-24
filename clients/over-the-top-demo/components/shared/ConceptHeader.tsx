"use client";

import { useEffect, useState } from "react";
import { Action, Wordmark } from "@/components/shared/ui";

export type NavItem = { label: string; href: string };
export type Cta = { label: string; href: string };

/**
 * Concept chrome.
 *
 * Carries TWO actions, not one. A restaurant has two ways to spend money — come in
 * and sit down, or order it to go — and they are worth different amounts. A table of
 * four dining in is worth several times a single takeout bag, so burying "Reserve"
 * while promoting "Order" gets the priority backwards. Both live here; `cta` is the
 * visually primary one and `secondaryCta` sits beside it.
 */
export default function ConceptHeader({
  home,
  nav,
  cta,
  secondaryCta,
}: {
  home: string;
  nav: NavItem[];
  cta: Cta;
  secondaryCta?: Cta;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-cream/10 bg-char/93 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Wordmark href={home} />

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold transition-colors hover:text-magenta-lift"
            >
              {item.label}
            </a>
          ))}
          {secondaryCta && (
            <Action href={secondaryCta.href} tone="secondary" size="sm">
              {secondaryCta.label}
            </Action>
          )}
          <Action href={cta.href} size="sm">
            {cta.label}
          </Action>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="concept-nav"
          className="-mr-2 grid size-11 place-items-center md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {open ? <><path d="M5 5l14 14" /><path d="M19 5L5 19" /></> : <><path d="M3 7h18" /><path d="M3 12h18" /><path d="M3 17h18" /></>}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="concept-nav" aria-label="Main" className="border-t border-cream/10 bg-char px-5 pb-6 pt-1 md:hidden">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-cream/10 py-4 font-display text-2xl font-bold transition-colors hover:text-magenta-lift"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-3">
            <Action href={cta.href}>{cta.label}</Action>
            {secondaryCta && (
              <Action href={secondaryCta.href} tone="secondary">
                {secondaryCta.label}
              </Action>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
