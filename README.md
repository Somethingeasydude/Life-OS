# RAM-OS

Life Operating System — run your life through your corporation. See
[`RAMOS-Blueprint.md`](./RAMOS-Blueprint.md) for the full design.

## Status: Phase 1

Only Finance + Revenue/Ops are active, per the blueprint's rollout rule
("build the habit before the system"). Do not add Growth, Self, or Admin
pillars until the Phase 1 habit holds for ~2–3 weeks.

## Daily use

1. **Capture** — dump anything into [`Inbox.md`](./Inbox.md). Under 10
   seconds, zero decisions.
2. **Clarify** — once a day (~5 min), turn each inbox line into a task
   (tagged to a pillar) in [`Tasks.md`](./Tasks.md), a note in a pillar
   file, or delete it. Get the inbox to zero.
3. **Engage** — work from the **Today** list at the top of `Tasks.md`
   (≤ 3 items). Never work from the inbox or the full backlog.
4. **Review** — weekly (~20 min), copy
   [`Reviews/Weekly-Review-Template.md`](./Reviews/Weekly-Review-Template.md)
   into a dated file, check each pillar's health signal, clear the inbox,
   set next week's 1–3 priorities.

## Files

- `Inbox.md` — the one capture point.
- `Tasks.md` — the one task list. Today list + backlog, tagged by pillar.
- `Pillars/Finance.md`, `Pillars/Revenue-Ops.md` — one objective, one
  health signal each.
- `Reviews/` — weekly review template + dated reviews.

## Rules that keep this alive

- A missed day is never a failure state — just restart from Capture.
- Reorganizing this system is not work. Only pillar-advancing tasks count.
- Every task must tag a pillar, or it doesn't belong here.

## Migration from the old RAM-OS vault

Starting clean. The prior Obsidian vault (OFFER.md, RAM-Voice.md, client
docs, Notion CRM) stays intact as **archived reference** — it is not
merged into this repo. Only what's currently live got carried over: the
Hope Baptist thread and the UI deadline (see `Tasks.md`). Point Obsidian
at this repo as a fresh vault via the Git plugin; don't try to reconcile
the old structure into it.

## Capture — open question to validate yourself

The plan is a Claude.ai Project with a GitHub connector pointed at this
repo, used from your phone, so capture is just talking. **You need to
confirm it's actually under 10 seconds in practice** (app open → message
sent → committed) — if it isn't, capture has friction and the system is
at risk (invariant I1). If it's too slow, the fallback is a dumb-fast
front end for capture only (e.g. a Telegram message or an iOS Shortcut
that appends one line to `Inbox.md`), with the Project handling
clarify/query instead. Report back after testing it for a few days.

## Dashboard

`site/` is a static, read-only dashboard (pillar health + Today list)
built from the files in this repo. Deploy by importing this repo in
Vercel (vercel.com/new) — `vercel.json` at the repo root points it at
`site/build.js`, so every push rebuilds the dashboard automatically. No
credentials required; it only reads files already checked out during the
build.

## Weekly review reminder

A scheduled prompt fires **Sundays at 6:00 PM Eastern** to run the weekly
review. Change the time by asking Claude to update the
`RAM-OS Weekly Review` trigger.
