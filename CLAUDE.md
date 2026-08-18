# CLAUDE.md

Context for any Claude Code session operating in this repo. Read this first.

## What this is

RAM-OS — Robert "Ram" Morales's life operating system, built on the "run
your life through your corporation" frame (RAM Strategic Systems LLC).
Full design rationale: `RAMOS-Blueprint.md`. Daily usage: `README.md`.

## Who this is for

Robert Anthony Morales — goes by "RAM," refer to him that way.
Flowery Branch GA, America/New_York timezone. Unemployed since July
2026 (laid off from TNDD); RAM Strategic Systems LLC is his primary
income focus. Currently in real financial precarity — treat Finance
accuracy as high-stakes, not abstract (see Pillars/Finance.md for the
live number).

Previously ran life/business through "Claw," a persistent AI agent
(OpenClaw on WSL2, Telegram-triggered, unrestricted network, full
credential access to Stripe/Notion/Google/social APIs). **Resolved
2026-08-18: Claude is now primary operator.** Claw is not actively
running work day-to-day — it stays available only if RAM needs to pull
data/reference from it, or it gets repurposed later as a separate
product idea. Don't assume Claw is doing anything in parallel (e.g. lead
recon) unless RAM says it still is.

## Current phase

Phase 1 only: Finance + Revenue/Ops pillars + the capture loop. Do not
build Growth, Self, or Admin pillars until Phase 1's habit holds (~2–3
weeks of actual daily use). See blueprint Section 4.

## File map

- `Inbox.md` — the one capture point.
- `Tasks.md` — the one task list. Today (≤3) + backlog, tagged by pillar.
- `Pillars/Finance.md`, `Pillars/Revenue-Ops.md` — one objective, one
  health signal each. These are the live source of truth for pillar
  status — don't duplicate their numbers here, they'll drift.
- `Reviews/` — weekly review template + dated reviews.
- `site/` — static dashboard (`build.js`), deployed to Vercel, rebuilds
  on every push.

## Hard rules for any agent operating here

Same bar Claw holds itself to, confirmed by Robert:

- Never build, deploy, or push infrastructure changes without explicit
  go-ahead for that specific action.
- **Updated 2026-08-18:** RAM confirmed he manages all his projects
  directly and wants edit access across all of them, not just
  `life-os` — this is explicitly why he moved off Claw. So: Vercel
  projects RAM manages (Hope Baptist's site, demos, etc.) are in scope
  once the Vercel connector is actually confirmed working, not just
  policy-approved. **Ovis Canem is the one exception still pending
  confirmation** — Jared has a partnership stake (verbal 25%
  profit-share, owns vision/brand), so before touching that one
  specifically, confirm with RAM whether Jared should be looped in
  first. Everything else outside this repo (Stripe, Notion, Gmail,
  Facebook/LinkedIn, Kit, the Telegram bot) still needs an explicit
  per-instance go-ahead — this update is about project/deploy access,
  not a blanket removal of the ask-first rule.
- Still: never build, deploy, or push changes to any project — including
  ones now in scope — without explicit go-ahead for that specific
  action. Broader access is not standing permission to act unprompted.
- If given a Vercel token or any other credential, note which
  project(s) it's actually scoped to before acting.
- **Ask, don't guess.** RAM confirmed 2026-08-18: when intent is unclear,
  ask a clarifying question rather than assume — every session, not just
  this one.

## Known environment constraints (system upkeep, not pillar work)

- claude.ai Project's GitHub connector: read works, write fails with a
  403. Likely the fine-grained token was created Read-only instead of
  Read-and-write. RAM confirmed the same failure independently. Fix:
  regenerate the token with Contents set to Read-and-write, reauthorize
  the connector. Not urgent — this session already writes to the repo
  fine, so capture isn't blocked, just not yet available from the Project.
- Dashboard is live at a Vercel-assigned URL under the correct account
  (`ramllcmanagement-5388's projects`) — deliberately parked on the
  default `.vercel.app` domain for now. RAM wants a custom domain under
  `ram-strategicsystems.com` eventually; deferred until he picks the
  subdomain and confirms where DNS is managed (likely Cloudflare, same
  as Hope Baptist's site, but not confirmed for this domain specifically).

This runs in a sandboxed Claude Code Remote container: outbound network
is policy-restricted (confirmed blocked: `api.vercel.com`), and the
session isn't always-on — it wakes on a message or a scheduled trigger.
This is a real capability gap versus Claw (persistent, unrestricted
network, always listening on Telegram), not a permissions issue to route
around.

## System design rules (the invariants)

From the blueprint — these are what keep this alive, don't violate them:

- Capture is always <10 sec, zero decisions.
- A missed day is never a failure state — restart, no guilt, no backlog
  penalty.
- Reorganizing/improving this system is never counted as productive
  output. Only pillar-advancing work counts.
- Every task traces to a pillar or it's cut.
- Daily processing ≤5 min, weekly review ≤20 min.
- One inbox, one task list, one home. No parallel systems.

## Standing operational facts

- Weekly review runs automatically Sundays 6pm ET via a scheduled
  trigger bound to this session.
- Hope Baptist is RAM's one paying client: $600/yr retainer, paid
  upfront — won't show as "new" monthly bookings.
- The old Obsidian vault (`C:\Users\mycla\Documents\RAM-OS`, Claw's
  current reference) is not reachable from this environment. Its
  content has to be brought in explicitly (upload, push to a repo, or a
  Claw export) — it isn't synced.
