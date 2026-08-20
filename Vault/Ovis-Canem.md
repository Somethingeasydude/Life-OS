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

## Codebase status, 2026-08-20

`sheepdog-demo` is now on GitHub: `Somethingeasydude/ovis-canem` (private),
cloned and working in this session. One commit on the repo
("Remove node_modules from tracking"). `.gitignore` already excludes
`.env*` and `node_modules`. Scanned the tree for secrets: clean — every
API file reads `process.env.STRIPE_SECRET_KEY` / `DATABASE_URL` /
`JWT_SECRET`, nothing hardcoded except the Stripe *publishable* key in
`public/checkout/index.html` (meant to be public). The credentials doc
Claw emailed separately (live Stripe secret key, Neon DB password,
JWT secret, Vercel deploy token, admin password) is NOT the same thing
as what's in git — that doc crossed email in plaintext and should be
rotated regardless of the repo being clean. Rotation not yet done as of
this note.

## People — confirmed 2026-08-20

The site-revision brief (`Vault/Ovis-Canem-Site-Revision-Brief.md`) was
sent by Jared and lists three roles: **Robert** (Ram —
development/hosting), **Ovis** (vision/content/doctrine — "prepared by
Ovis"), and **Jared** (marketing assets). Confirmed by RAM: Ovis is
Jared writing under that role/persona, not a third person — still just
Ram + Jared on this project.

## Site revision brief received 2026-08-20 — scope changed substantially

Full doc: `Vault/Ovis-Canem-Site-Revision-Brief.md`. This supersedes
work item #3 below ("cleanup/remodel") — it is not a cleanup, it's a
full membership-platform rebuild:

- **Three pricing tiers, staged:** $37 one-time founding membership
  (Phase 1, capped at first 1,000, never reopened) → $57/yr annual +
  $197 one-time lifetime (Phase 2, manual toggle). Processor must
  support recurring billing from day one even though Phase 1 sells
  nothing recurring.
- **Full member system:** auto-created accounts at checkout, login,
  password reset, multi-device sessions, dashboard.
- **Lapse/lockout logic:** 14-day grace period, then full lockout
  (downloaded files never revoked, account never deleted, Morning App
  stays free to lapsed members).
- **New pages:** Gospel page (KJV, response-to-inbox link), Statement
  of Faith (Ovis's wording only, not a placeholder), Refund Policy
  (timestamped acknowledgment checkbox), Contact page. About page
  deleted + 301 redirect.
- **Demos (no signup):** flashcards (Proverbs 1), trivia (3 free
  categories: The Gospel, Who Jesus Is in the Bible, Is It King
  James?), Morning App promoted above the demos on the home page.
- **Feedback routing split, non-negotiable:** bugs/games → Discord
  webhook; gospel responses + billing → private email only, paths
  can never merge.
- **26-item acceptance checklist** (brief §17) before this counts done.

**Stage 1 (foundation) is explicitly blocked on Ovis answering 5 open
questions (brief §16.1) before Robert can finish it:**
1. Monitored inbox email address (needed for billing/password/gospel
   responses even with Discord in place)
2. YouTube URL
3. TikTok URL
4. Discord public vs. member-only (not a launch blocker, but a decision)
5. Question count per free trivia category (brief recommends 10 min)

Per the brief's own division of labor: "Ovis is the bottleneck, not
Robert." Non-content-dependent Stage 2 items (delete About page, strip
tiered pricing sitewide, link-check) don't need to wait on this.

## Three real work items, as of 2026-08-19 — status updated

1. **Get Jared's sandbox built and deployed, define the workflow.**
   Now folded into the site-revision brief above — no longer a
   separate scoping question, it's Stage 1/§5-6 of the brief.
2. **Structure Ovis Canem intellectually rather than build-as-you-go.**
   Still applies as a practice going forward, now with a real staged
   plan to hang it on (brief's Stage 1→4).
3. **~~Jared wants a cleanup/remodel~~ → superseded by the full
   site-revision brief above, 2026-08-20.**

## Risk to keep in view (not a call to action — informational)

Verbal agreements tend to hold until real money/IP/equity actually
enters the picture, then they don't. A subscription pivot is the first
point real recurring money touches this project. Research also found
that informal collaborators can sometimes carry partnership-like legal
obligations based on conduct (sharing profits, presenting as co-owners)
even with zero paperwork — cuts both ways, not just a risk to RAM.
