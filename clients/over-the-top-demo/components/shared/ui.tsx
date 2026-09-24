import type { ReactNode } from "react";

type Tone = "primary" | "secondary" | "ghost" | "quiet";

/**
 * One colour family, two weights. The filled pill carries the primary action and
 * the outlined pill everything beside it — both drawn in the brand magenta so a
 * row of buttons reads as one set rather than three unrelated controls. Outline
 * keeps cream text: magenta on charcoal is too low-contrast to sit under a
 * headline. Concept D re-points --color-magenta at the flag gold, so these
 * follow the theme without a second definition.
 */
const TONES: Record<Tone, string> = {
  primary: "bg-magenta text-white hover:bg-magenta-lift",
  secondary: "border border-magenta/60 text-cream hover:border-magenta hover:bg-magenta/12",
  ghost: "text-cream hover:text-magenta-lift",
  quiet: "text-cream hover:text-magenta-lift",
};

/** Every control clears 44px. Restaurant sites are used one-handed, on the move. */
export function Action({
  href,
  tone = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  tone?: Tone;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors ${
    size === "sm" ? "min-h-11 px-5 text-[13px]" : "min-h-12 px-6 text-sm"
  } ${TONES[tone]} ${className}`;

  return (
    <a
      href={href}
      className={classes}
      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function Shell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>
  );
}

export function Band({
  id,
  tone = "base",
  className = "",
  children,
}: {
  id?: string;
  tone?: "base" | "raised";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`py-14 sm:py-20 ${
        tone === "raised" ? "border-y border-cream/10 bg-char-2" : ""
      } ${className}`}
    >
      <Shell>{children}</Shell>
    </section>
  );
}

export function Heading({
  eyebrow,
  title,
  blurb,
  action,
}: {
  eyebrow?: string;
  title: string;
  blurb?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
        {blurb && <p className="mt-3 text-ash">{blurb}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * Their badge logo, approximated in SVG.
 *
 * Deliberately NOT a replacement logo — the brief forbids designing them a new one.
 * This is a stand-in shaped like theirs (circular badge, EST. 2020, burger mark) so
 * the prototypes have honest chrome. Their real logo file drops in here unchanged.
 */
export function Badge({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.6" opacity=".5" />
      <circle cx="32" cy="32" r="25.5" stroke="currentColor" strokeWidth="1" opacity=".28" />
      <path d="M20 28c0-5.5 5.4-9.5 12-9.5S44 22.5 44 28H20z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M18.5 33.5h27M18.5 38.5h27" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 43.5h22c0 2.2-1.8 4-4 4H25c-2.2 0-4-1.8-4-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="27" cy="24" r="1" fill="currentColor" />
      <circle cx="32" cy="22.5" r="1" fill="currentColor" />
      <circle cx="37" cy="24" r="1" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <a href={href} className="flex items-center gap-2.5 py-1" aria-label="Over the Top Burger Bar — home">
      <Badge className="size-9 shrink-0 text-cream" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-bold">Over the Top</span>
        <span className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.22em] text-ash">
          Burger Bar
        </span>
      </span>
    </a>
  );
}
