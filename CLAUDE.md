# CLAUDE.md

Context for any Claude Code session operating in this repo. Read this first.

## What this is

RAM-OS — Robert "Ram" Morales's life operating system, built on the "run
your life through your corporation" frame (RAM Strategic Systems LLC).
Full design rationale: `RAMOS-Blueprint.md`. Daily usage: `README.md`.

## Who this is for

Robert "Ram" Morales, Flowery Branch GA, America/New_York timezone.
Unemployed since July 2026; RAM Strategic Systems LLC is his primary
income focus. Was previously running life/business through "Claw," a
persistent AI agent (OpenClaw on WSL2, Telegram-triggered, unrestricted
network, full credential access to Stripe/Notion/Google/social APIs).
Transitioning primary-operator role from Claw to this Claude Code
environment — in progress, not yet complete.

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
- Never touch anything outside this repo/project without being asked —
  specifically Ovis Canem, Hope Baptist's site, Stripe, Notion, Gmail,
  Facebook/LinkedIn, Kit, or the Telegram bot. Those are Claw's/other
  agents' domain unless Robert explicitly hands off a specific one.
- If given a Vercel token or any other credential, scope actions to the
  `life-os` project only.

## Known environment constraints

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
