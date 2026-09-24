/**
 * Prototype switcher.
 *
 * Review scaffolding, not part of any concept — deliberately neutral grey so it
 * never reads as restaurant chrome, and deliberately at the very top so switching
 * between A, B and C costs one tap on a phone. It comes out before any client demo.
 */
const CONCEPTS = [
  { slug: "a", href: "concept-a.html", label: "A" },
  { slug: "b", href: "concept-b.html", label: "B" },
  { slug: "c", href: "concept-c.html", label: "C" },
  { slug: "d", href: "concept-d.html", label: "D" },
] as const;

export default function LabBar({ current }: { current?: "a" | "b" | "c" | "d" }) {
  return (
    <div className="border-b border-white/10 bg-neutral-900 text-neutral-300">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-8">
        <a
          href="index.html"
          className="inline-flex min-h-10 items-center text-[11px] font-semibold uppercase tracking-[0.14em] hover:text-white"
        >
          ← Lab
        </a>
        <div className="flex items-center gap-1.5">
          <span className="mr-1 hidden text-[11px] uppercase tracking-[0.14em] text-neutral-500 sm:inline">
            Concept
          </span>
          {CONCEPTS.map((concept) => {
            const active = current === concept.slug;
            return (
              <a
                key={concept.slug}
                href={concept.href}
                aria-current={active ? "page" : undefined}
                className={`grid size-10 place-items-center rounded-full text-[13px] font-bold transition-colors ${
                  active
                    ? "bg-white text-neutral-900"
                    : "border border-white/20 hover:border-white/60 hover:text-white"
                }`}
              >
                {concept.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
