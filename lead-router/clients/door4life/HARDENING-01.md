# Hardening Cycle #1 — Phase A

**Status: implemented, tested, not deployed.** Awaiting approval to deploy.

North star for this cycle:

> Capture accurately when possible, validate deterministically when possible,
> expose uncertainty when necessary, and never fabricate certainty.

Baseline this builds on: [`BASELINE-v1.md`](./BASELINE-v1.md).

## The problem Phase A solves

Delivery was proven. Lead *content* was not. Across the three calls with
field-level evidence, not one produced a fully correct record — and the email
presented every field with identical confidence. `404404404` was rendered in
the same typeface as a number the AI heard perfectly.

The failure mode was not "sometimes wrong". It was **a wrong lead being
indistinguishable from a right one.** The owner would have dialled a dead
number believing the system worked.

Phase A does not make extraction more accurate. It makes the lead honest about
itself.

## Scope

In: placeholder normalization, deterministic callback-number validation,
preservation of malformed values, `NEEDS REVIEW` surfacing, regression tests.

Out, deliberately untouched: Vapi assistant prompt and schema, address
collection, end-call behaviour, delivery architecture, single-trigger rule,
idempotency, webhook auth, production deployment.

---

## Change 1 — Placeholder normalization (RAM Core)

Extraction reports absence as a word: `caller_name: "unknown"`,
`property_type: "N/A"`. The formatter treated those as content and printed
`1 unknown door` and `Property: Unknown`.

`lib/normalizeLead.js` now recognises a fixed token set — `unknown`,
`unspecified`, `n/a`, `na`, `none`, `null`, `undefined`, `not provided`,
`not specified`, `not given`, `no answer`, `tbd` — and normalises them to
`null`, so every existing suppression rule applies without change.

Matched on the **whole trimmed value only.** A summary reading "the caller was
unknown to the team" is content and survives intact. This is the difference
between suppressing a placeholder and censoring a sentence.

Which fields arrived as placeholders is recorded on `lead.placeholderFields`
and logged. Those values carry no information for the reader, but the *fact*
that the assistant emitted them is the signal that its prompt needs work —
invisible once the values become null.

## Change 2 — Callback-number plausibility (RAM Core)

`lib/normalizeLead.js` adds `phonePlausibility()`: strip non-digits, drop a
leading country code, then require ten digits with neither the area code nor
the exchange beginning in 0 or 1. Deterministic NANP shape only — no network,
no provider, no guessing.

Returns `true`, `false`, or `null` when there is nothing to judge. **`false`
does not mean the line is dead.** It means nobody should be told this number is
good without checking it.

`404404404` — the real captured value — is nine digits and fails.

## Change 3 — Malformed values are preserved

`callbackNumber` keeps the raw extracted string regardless of plausibility.
Plausibility is reported alongside it in `callbackNumberPlausible`, never by
mutating or clearing the value.

A malformed number is evidence: of a mishearing, of a prompt that never
confirmed the digits back. Discarding it would destroy the only record of what
went wrong. **No lead is ever dropped for failing validation.**

## Change 4 — Uncertainty reaches the reader

`lib/qualifyLead.js`: a lead the AI screened in, whose number cannot be
dialled, resolves to `review` / `callback_number_implausible` instead of
`notify`. It is still sent.

`hasActionableData()` no longer counts an implausible number as contact
information on its own — a number nobody can dial is not a way to reach anyone.

`lib/formatNotification.js`: review banners are now keyed by reason. A flagged
lead says what is wrong with it; "needs review" without a cause just teaches
the reader to ignore the flag. The number renders exactly as captured with the
doubt attached to it, rather than left for the reader to discover by dialling.

### Before and after — the real 2026-09-09 lead

Before:

```
[HIGH] New Door4Life Quote Lead — Billy Bob
Customer:  Billy Bob / 404404404
Property:  Unknown
Door:      1 unknown door
```

After:

```
[NEEDS REVIEW] New Door4Life Quote Lead — Billy Bob

The callback number below could not be read as a valid phone number. It is
shown exactly as the AI captured it. Verify it against the call recording
before relying on it.

Customer:  Billy Bob
           404404404  (could not be read as a valid phone number — verify before calling)
Door:      1 door
```

`Property:` is gone rather than saying "Unknown". The number is still there —
flagged, not hidden.

## Tests

`test/dataQuality.test.js`, 15 cases. **Suite: 110/110 passing** (95 before,
all still green — no behavioural regression).

Two are named regressions against observed production failures:

- `regression: "1 unknown door" never renders again`
- `regression: a qualified lead with an undialable number is flagged, not presented as clean`

Also asserted: placeholder matching is whole-value not substring; formatting
variants of real numbers all pass; NANP leading-digit rules reject 0/1 area
codes and exchanges; the raw malformed value survives normalization; the lead
is never dropped; a clean lead produces no warning and no banner; the banner
names the actual reason.

## Layer classification

| Change | Layer |
|---|---|
| Placeholder normalization | **RAM Core** — every LLM extraction emits placeholders |
| Phone plausibility | **RAM Core** — every service business needs a dialable number |
| Preserve-and-flag | **RAM Core** — a general stance on uncertain data |
| Review banner copy | **RAM Core** mechanism, wording is currently vertical-neutral |

Nothing in Phase A is Door4Life-specific. All of it should survive into the
agent factory unchanged.

## Files changed

```
lib/normalizeLead.js      placeholder tokens, phonePlausibility, field tracking
lib/qualifyLead.js        implausible number -> review; actionability fix
lib/formatNotification.js reason-keyed banners, inline number warning
lib/handleLeadEvent.js    log plausibility + placeholder fields
test/dataQuality.test.js  new, 15 cases
```

## What remains blocked

Phase A is router-side only. These need the Vapi assistant, which cannot be
reached from the Claude Code sandbox and cannot be written through MCP:

- **caller_name reliability** — prompt and schema
- **photos / pricing extraction drift** — prompt
- **street address** — schema field does not exist
- **premature call ending** — silence timeout and closing logic

Blocking constraint: the dashboard Publish is broken (BASELINE-v1 defect 10),
MCP `update_assistant` cannot write `artifactPlan` or `server` and would
overwrite an unreadable system prompt (defect 11), and `api.vapi.ai` is
unreachable from this container. **Any assistant change requires REST access
from a machine that can reach Vapi.** Establishing durable deep-read access to
the assistant is the prerequisite for Phase B.

Also unaddressed by design: no delivery retry, direct-upload deployment drift,
short log retention, assistant-ID fallback risk, re-fetch timeout sensitivity.
