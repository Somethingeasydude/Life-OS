# Door4Life — Baseline v1

**Frozen 2026-09-12.** First known-good end-to-end state of the RAM Lead Router.

This file is **append-only**. Never edit it to match later behaviour — when
behaviour changes materially, add `BASELINE-v2.md` beside it. The value of a
baseline is that it still describes the system as it was on the day it worked.

**Door4Life has not authorized production use.** Private demo built on publicly
available business information. Do not contact them, use their number, or
represent RAM as affiliated with them.

---

## The anchor: one proven call

| | |
|---|---|
| Call ID | `01a0965d-c4f7-7ccf-bc97-9119d943303c` |
| Window | 2026-09-12 16:05:22 → 16:08:15 UTC (~2m52s) |
| Ended reason | `assistant-ended-call` |
| Resend message ID | `67ea1d57-ae3b-4237-b6cb-926ba50d9537` |
| Webhook → delivered | 105 ms |
| Recipient | `contact@ram-strategicsystems.com` |

Observed log sequence on `end-of-call-report`:

```
event_received (end-of-call-report)
client_resolved            door4life
structured_output_found    source: webhook, pollAttempts: 0
lead_qualified             notify / qualified / HIGH
delivery_adapter_selected  resend
notification_delivered     messageId 67ea1d57-…
```

And on the `status-update`/ended event for the same call, 6 seconds earlier:

```
structured_output_found       source: vapi_api, pollAttempts: 2
lead_qualified                notify / qualified / HIGH
lead_captured_not_delivered   awaiting_end_of_call_report
```

---

## PROVEN WORKING

Each item below was observed in production logs for the call above — not
inferred, not tested in isolation.

1. **Call completion** — Vapi completed a real ~3 minute conversation and ended
   it cleanly (`assistant-ended-call`).
2. **Structured output found** — `door4life_service_lead` located on the
   `end-of-call-report` payload with zero poll attempts. The API re-fetch path
   also worked independently on the same call (2 attempts via `vapi_api`).
3. **Qualification** — `qualified_lead: true`, priority `HIGH`, resolved to
   `action: notify` / `reason: qualified`.
4. **Single-trigger send** — both completion events resolved a lead; only
   `end-of-call-report` delivered. `status-update`/ended logged
   `lead_captured_not_delivered` and sent nothing.
5. **Resend acceptance** — the provider accepted the message.
   `notification_delivered` only fires on `response.ok`, and no
   `resend_rejected` line exists for this call.
6. **Exactly one email** — one call, two completion events, one Resend request,
   one message ID.

---

## KNOWN DEFECTS / NOT YET SOLVED

Nothing below was fixed at freeze time. Ordered by layer, not severity.

### Extraction quality — Vapi assistant, not the router

1. **`caller_name` reliability.** Returned `null` (2026-09-10) and the literal
   string `"unknown"` (2026-09-12). The router passes through whatever Vapi
   extracts; the fix is in the assistant prompt and output schema.
2. **Callback-number reliability.** Returned `404404404` on 2026-09-09 — nine
   digits, not a phone number. Correct on 09-10 and 09-12. Intermittent, and
   the highest-stakes of these: a wrong callback number is a lost job.
3. **Photos / pricing extraction drift.** On 2026-09-09 the extraction returned
   `photos_available: No` and `pricing_interest: No` for a caller who asked for
   a quote and said they had photos. Semantically inverted, not merely missing.

### Router / formatting

4. **Placeholder formatting.** When extraction emits the literal token
   `unknown`, the formatter renders it verbatim — `1 unknown door`,
   `Property: Unknown`. It suppresses `null` correctly but not placeholder
   strings.
5. **No delivery retry.** A Resend 5xx loses the lead. The endpoint returns 500
   so the failure is visible in Vapi's webhook log, but Vapi's retry behaviour
   for `end-of-call-report` is unconfirmed, and nothing on our side re-attempts.

### Infrastructure / process

6. **Direct-upload deployment drift.** Production is deployed by file upload,
   not linked to git. Pushing this branch does **not** deploy, and there is no
   automatic provenance between a commit and the running code. Production and
   git have already diverged once (the three observability log lines lived only
   in the deployed bundle until this commit).
7. **Short Vercel log retention.** Hobby retains runtime logs for roughly an
   hour. Any call older than that cannot be diagnosed after the fact — this has
   already blocked two post-hoc investigations.
8. **Assistant ID fallback risk.** `DOOR4LIFE_ASSISTANT_IDS` is unset, so
   `resolveClient` falls back to "the only configured client." Correct with one
   client; silently wrong the moment a second is added.
9. **Re-fetch timeout sensitivity.** The Vapi call re-read uses a 4s per-request
   timeout and hit it once on 2026-09-10 (`vapi_call_fetch_error: aborted due to
   timeout`), recovering on attempt 2. The margin is thin.

### Vapi control plane

10. **Publish phantom UUID.** The dashboard Publish still fails citing
    structured-output ID `719faddd-51b9-458d-afab-c095891ecda6`, which appears
    nowhere in the saved assistant. A second ID believed valid
    (`122aedef-a984-45df-8ba9-49fb3f323355`) does not exist in the account —
    attaching it reproduced the identical error. The account holds exactly one
    structured output, `c1391867-…`. Current reading: stale client-side draft
    state, unconfirmed. **The live assistant works without Publish ever
    succeeding**, because its server config was set directly via the REST API.
11. **MCP control-plane limitations.** The Vapi MCP connector returns summary
    views only. `get_assistant` omits `artifactPlan`, `server`, and the system
    prompt; `get_call` omits `artifact`, transcript, and structured outputs.
    `update_assistant` cannot write `artifactPlan` or `server` at all, and using
    it is hazardous: `instructions` would overwrite a system prompt that cannot
    be read back, and its `llm` enum excludes the assistant's actual model
    (gpt-4.1-mini), risking a silent downgrade. **Treat `update_assistant` as
    off-limits for this assistant.** REST remains the only safe write path.

---

## Configuration at freeze time

### Vapi

| Item | Value | How verified |
|---|---|---|
| Assistant | `688b11dd-c916-4b0c-b215-e979c13398f4` — "Door4Life — Private Demo" | MCP, 2026-09-12 |
| Model / voice / transcriber | gpt-4.1-mini / vapi:Elliot / soniox:stt-rt-v5 | MCP, 2026-09-12 |
| Tool | `de9a9cd7-2d53-487f-b125-850dbcb9664c` | MCP, 2026-09-12 |
| Assistant last modified | `2026-09-10T02:19:01.384Z` | MCP, 2026-09-12 |
| Structured output | `c1391867-7ee3-4398-ad89-18f4dbdf247a`, name `door4life_service_lead` | REST, 2026-09-09 — **not re-verifiable via MCP** |
| Server URL | `https://ram-lead-router.vercel.app/api/vapi`, timeout 20s | REST PATCH, 2026-09-09 — **not re-verifiable via MCP** |
| Auth credential | `59981c3a-caae-4b58-bb2e-96fe6afe4305` ("RAM Lead Router"), Bearer | REST, 2026-09-09 — **not re-verifiable via MCP** |

The last three are *inferred present*: they were correct when written and the
system demonstrably works, but no currently available tool can read them back.
Re-establishing direct read access to them is the first task of any hardening
cycle that touches the control plane.

### Vercel

| Item | Value |
|---|---|
| Project | `ram-lead-router` / `prj_y23QQqjYh1iTsCORyXYTftzD4p3q` |
| Team | `team_usnV92sxN4rioTj5ASRSHjJP` |
| Deployment | `dpl_8xf7zBmLhZiniEm6gdTqv57PDQkg` |
| Confirmed serving | today's log lines carry `dep=dpl_8xf7zBmLhZiniEm6gdTqv57PDQkg` |
| Deployment protection | disabled — required for Vapi to reach the endpoint |
| Region | iad1 · `maxDuration` 30s |

### Router

Delivery: `lib/delivery.js` registry → `resend` (`DELIVERY_ADAPTER`) →
`lib/emailDelivery.js`. The Gmail adapter is present and tested but unused.

Duplicate protection is two independent layers:
- **Single-trigger** — only `end-of-call-report` delivers (structural).
- **Idempotency key** — `door4life-lead-<callId>`, deduplicated by Resend for
  24h (provider-level).

Client identity lives in `lib/config.js` → `door4lifeConfig()`:
`clientId: door4life`, `structuredOutputName: door4life_service_lead`,
recipients from `LEAD_NOTIFICATION_EMAIL` (default
`contact@ram-strategicsystems.com`).

### Environment variables

Names only — values are never recorded here.

Required: `VAPI_WEBHOOK_SECRET`, `RESEND_API_KEY`, `LEAD_FROM_EMAIL`.
Strongly recommended: `VAPI_API_KEY` (without it the re-fetch path is skipped).
Set at freeze time: `DELIVERY_ADAPTER=resend`, `LEAD_NOTIFICATION_EMAIL`.
Absent at freeze time: `DRY_RUN`.

`ram-strategicsystems.com` is verified in Resend. Mail for the domain is hosted
on Google Workspace (`MX → smtp.google.com`); DNS is at Porkbun, not Cloudflare.

### Git

Baseline commit: the commit that introduced this file, on
`claude/ram-lead-router-backend-lqd8su`. Parent `956305e`.
