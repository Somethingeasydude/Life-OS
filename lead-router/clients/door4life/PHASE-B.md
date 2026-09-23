# Phase B — Receptionist Quality

**Objective: make the existing Door4Life receptionist good enough to demo to
the business owner.** Not new infrastructure. Six changes were identified from
the 2026-09-22 canary and the historical call evidence; B6 is the only one
implemented so far.

Baseline: [`BASELINE-v1.md`](./BASELINE-v1.md). Previous cycle:
[`HARDENING-01.md`](./HARDENING-01.md).

## Status

| | Change | Layer | Status |
|---|---|---|---|
| B1 | Caller name collected first, optional in schema | Vapi | Not started — blocked on REST |
| B2 | Callback number read back and confirmed | Vapi | Not started — blocked on REST |
| B3 | City-level location, optional `service_address` | Vapi + RAM | Not started — blocked on REST |
| B4 | Photos as an offer; nullable booleans | Vapi | Not started — blocked on REST |
| B5 | Premature-ending correction | Vapi | Not started — blocked on REST |
| B6 | Door-line noun collision | **RAM Core** | **Done** |

B1–B5 all require reading and writing the Vapi assistant prompt, the structured
output schema, or `endCallPhrases`. None of the three is reachable from the
Claude Code sandbox: MCP `get_assistant` returns 8 of 33 fields and omits all
three, there are no MCP tools for structured outputs at all, `endCallPhrases`
is absent from `update_assistant`'s schema entirely, and `api.vapi.ai` is
denied at the container's egress proxy. **They are unblocked by one terminal
session on a machine that can reach Vapi** — the same read that gives Door4Life
its first recovery anchor.

---

## B6 — Door-line noun collision

### Problem

`doorLine()` built `${count} ${material} ${noun}`. Extraction describes the
door in the caller's own words, and for a French door those words already end
in the noun, so the noun was printed twice:

```
2026-09-12   Door:  1 French mahogany door door
2026-09-22   Door:  1 mahogany French door door
```

Recorded as `BASELINE-v1.md` defect 12 (post-freeze appendix).

Cosmetic only — no field was wrong, and neither delivery nor qualification was
affected. It earns a fix because it is the first thing a business owner's eye
catches, and Phase B's whole objective is demo readiness.

### Fix

Strip any trailing `door`/`doors` off the extracted description, then re-apply
the noun ourselves so it always agrees with the count. The `\b` word boundary
keeps `outdoor` intact.

```js
const TRAILING_DOOR_NOUN = /\s*\bdoors?\s*$/i;
const descriptor = material.replace(TRAILING_DOOR_NOUN, '').trim();
return descriptor ? `${count} ${descriptor} ${noun}` : `${count} ${noun}`;
```

A bare material (`oak`) is untouched by the strip and renders exactly as
before, so the change is additive in effect: it only alters output that was
already wrong.

### Why RAM Core and not the Vapi schema

Three reasons, and they are the general rule, not a Door4Life judgement:

1. **The data is correct.** "mahogany French door" is the right answer to "what
   kind of door." The rendering was broken, so the rendering is where it is
   fixed.
2. **Constraining the schema would fight the language.** Forcing bare materials
   would lose "French door", which is a door *type*, not a material — trading a
   cosmetic bug for real data loss.
3. **It is not vertical-specific.** "Do not append a noun the value already
   ends with" holds for windows, gutters, and cabinets too. It travels to
   Client #2 unchanged.

### Tests

`test/formatNotification.test.js`, 4 new cases. **Suite: 114/114 passing**
(110 before, all still green — no behavioural regression).

One is a named regression against the observed production string:

- `regression: "1 mahogany French door door" never renders again`

Also asserted: the noun agrees with the count however the caller phrased the
material (`mahogany French door` ×2 → `2 mahogany French doors`; `French doors`
×1 → `1 French door`; mixed case); bare materials are unchanged (`oak` ×1 →
`1 oak door`); the noun alone is not doubled and leaves no dangling space
(`door` ×1 → `1 door`); a material ending in the noun still renders with no
count; and `outdoor oak` survives the strip intact.

Verified against the real production values as well — both `mahogany French
door` and `French mahogany door` now render correctly.

### Risk

Lowest of any change in Phase B. Pure rendering, no network, no delivery path,
no qualification path. Fully covered by unit tests that run in the sandbox.

### Files changed

```
lib/formatNotification.js        TRAILING_DOOR_NOUN, doorLine strip-and-reapply
test/formatNotification.test.js  4 cases, one named regression
```
