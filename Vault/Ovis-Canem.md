# Ovis Canem — Working Notes

KJV study app ("Proverbs: Word by Word"), partner Jared (family). Ram =
technical architect/operator. Compensation: verbal 25% profit-share (not
equity), starts after year 1, no formal contract — Jared won't pay a
retainer. Live at oviscanem.com (Vercel, Neon Postgres, custom JWT auth,
Stripe connected to Jared's live account).

**Standing rule (CLAUDE.md):** RAM has decided how to handle Jared's
involvement in decisions here himself — not something to keep asking
about. What follows is working scope/technical notes only.

## Architecture decision, 2026-08-19

Two separate properties, not one codebase:
- **oviscanem.com** = brand + access gateway. Handles subscription/
  membership check. Codebase (`sheepdog-demo`) currently lives ONLY on
  RAM's local Claw machine — not on GitHub yet. Needs pushing to a repo
  before any of this can move (real risk on its own: no backup right now).
- **Jared's product** = separate site, separate Vercel project under
  Jared's own account (he has one, Max plan, not yet linked). He's been
  prototyping in Claude Artifacts (a web app, a quiz tool) — nothing
  consolidated into a real codebase yet.
- **The link between them is runtime-only** (redirect or token-based
  access handoff after subscription check) — not shared code. Confirmed
  via research: separate repos is the right call here (different owners,
  different Vercel accounts, no shared components) — a monorepo only
  makes sense when projects share more than configs.
- Jared's Vercel Max plan resolves the earlier concern about the main
  site's 12-function Hobby-plan cap — doesn't apply to his sandbox.

## Three real work items, as of 2026-08-19

1. **Get Jared's sandbox built and deployed, define the workflow.**
   Blocked on: (a) pushing `sheepdog-demo` to GitHub, (b) Jared
   consolidating his Artifacts prototypes into an actual codebase, (c)
   deciding the gating mechanism (simple redirect vs. verified
   token-based handoff — leaning toward the latter for real security).
2. **Structure Ovis Canem intellectually rather than build-as-you-go.**
   Research-backed middle path: don't over-architect upfront (a
   documented case spent 4 months perfecting solo architecture before
   any signups) and don't ignore debt either (it compounds silently
   for solo devs until a full rewrite is the only option). Practice:
   log technical debt when it's taken on, keep a recurring cleanup
   cycle rather than blocking shipping on a perfect design.
3. **Jared wants a cleanup/remodel of the current oviscanem.com site.**
   Newly raised 2026-08-19 — not yet scoped. Separate from the
   sandbox/subscription work.

## Risk to keep in view (not a call to action — informational)

Verbal agreements tend to hold until real money/IP/equity actually
enters the picture, then they don't. A subscription pivot is the first
point real recurring money touches this project. Research also found
that informal collaborators can sometimes carry partnership-like legal
obligations based on conduct (sharing profits, presenting as co-owners)
even with zero paperwork — cuts both ways, not just a risk to RAM.
