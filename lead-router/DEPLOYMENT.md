# Live deployment — Door4Life private demo

The state of the running system as of the first successful end-to-end test,
2026-09-09. No secrets here: every value below is an identifier, not a
credential.

**Door4Life has not authorized production use.** This is a private demo on
publicly available business information.

## Vercel

| | |
|---|---|
| Project | `ram-lead-router` (`prj_y23QQqjYh1iTsCORyXYTftzD4p3q`) |
| Team | `ramllcmanagement-5388's projects` |
| Webhook URL | `https://ram-lead-router.vercel.app/api/vapi` |
| Deployment protection | disabled — Vapi must reach the endpoint anonymously |

**The deployment is a direct file upload, not git-linked.** Pushing to this
branch does *not* redeploy it. The uploaded tree is `api/` + `lib/` +
`package.json` + `vercel.json` from this directory; tests, scripts and docs
are not deployed. Code changes here require a fresh upload to take effect.

The separate `life-os` project (the RAM-OS dashboard) is unrelated and was not
touched.

## Vapi

| | |
|---|---|
| Assistant | Door4Life — Private Demo |
| Assistant ID | `688b11dd-c916-4b0c-b215-e979c13398f4` |
| Structured output | `door4life_service_lead` |
| Structured output ID | `c1391867-7ee3-4398-ad89-18f4dbdf247a` |
| Attached via | `artifactPlan.structuredOutputIds` |
| Server URL | `https://ram-lead-router.vercel.app/api/vapi` |
| Server timeout | 20s |
| Auth credential | custom credential "RAM Lead Router" (`59981c3a-caae-4b58-bb2e-96fe6afe4305`) |

The credential sends `Authorization: Bearer <VAPI_WEBHOOK_SECRET>`. That header
is the only accepted form — no bare tokens, no alternate headers. The token
value lives in Vapi and in Vercel's environment, nowhere else.

### Fixes applied live on 2026-09-09

These were made through the Vapi API and are **not** reproducible from this
repo — they're recorded here because nothing else records them.

1. **The structured output was named `door4life_service_lead copy`.** A
   duplicate-and-forget. The router matches on exact name, so every call would
   have produced `structured_output_missing` and no lead. Renamed to
   `door4life_service_lead`.

2. **The assistant had no server config at all** — `server: null`, no URL, no
   credential, no timeout. The webhook settings entered in the dashboard were
   sitting in a draft that Publish kept rejecting. Set directly via
   `PATCH /assistant/:id` with url, `timeoutSeconds: 20`, and the existing
   credential id, which bypassed Publish entirely.

3. **Two structured-output UUIDs believed to be in play never existed.**
   `719faddd-51b9-458d-afab-c095891ecda6` (thought to be a stale reference)
   appears nowhere in the saved assistant, and
   `122aedef-a984-45df-8ba9-49fb3f323355` (thought to be the valid one) returns
   404 from the API — attaching it reproduced the exact Publish error verbatim.
   The dashboard was reporting phantom ids. The account holds exactly one
   structured output, `c1391867`.

If the dashboard draft still carries a phantom reference, clicking Publish may
fail again or overwrite the API-set server config. Hard-refresh before editing
the assistant.

## Completion events

Work happens on two messages; everything else is acked 200 and ignored:

- `end-of-call-report`
- `status-update` with `status: "ended"`

Both fire for a single call. Processing both is safe: delivery dedupes on
`door4life-lead-<callId>`, so exactly one email results.

## Structured-output re-fetch — observed behaviour

Confirmed on the live test call (`01a08894-7589-7dd3-abd7-0bb142011912`):

| Event | Structured output |
|---|---|
| `status-update` / ended | **absent** — re-fetched from `GET /call/:id`, found on attempt 2, ~8.5s after the event |
| `end-of-call-report` (5s later) | present on the payload, 0 attempts |

**The re-fetch is load-bearing, not defensive.** Extraction had not finished
when the call ended. Without `VAPI_API_KEY` configured, the status-ended
trigger produces nothing.

Defaults: two attempts at 3s and 5s, hard-capped by a 15s budget, inside the
20s Vapi timeout and the 30s `maxDuration`. Tunable via
`STRUCTURED_OUTPUT_POLL_DELAYS_MS` and `STRUCTURED_OUTPUT_BUDGET_MS`.

## Delivery

Default adapter is **Gmail API** (`lib/gmailDelivery.js`), sending as the
existing Workspace mailbox. Resend remains in the tree, selectable with
`DELIVERY_ADAPTER=resend`, but is not configured.

Mail for `ram-strategicsystems.com` is hosted on Google Workspace
(`MX → smtp.google.com`), so the router sends from a mailbox that already
exists. No new vendor, no DNS change, no domain verification.

Auth is a **service account with domain-wide delegation**, impersonating
`contact@ram-strategicsystems.com`, scoped to
`https://www.googleapis.com/auth/gmail.send` **and nothing else**. The router
can send as that mailbox; it cannot read it.

### One-time setup

1. **Google Cloud** — project → enable the Gmail API → create a service
   account → create a JSON key and download it.
2. **Workspace Admin** → Security → Access and data control → API controls →
   Domain-wide delegation → Add new. Client ID is the service account's numeric
   **Unique ID**; scope is exactly
   `https://www.googleapis.com/auth/gmail.send`.
3. **Vercel** → Settings → Environment Variables (Production):
   `GOOGLE_SERVICE_ACCOUNT_EMAIL` (`client_email` from the JSON),
   `GOOGLE_PRIVATE_KEY` (`private_key` from the JSON, `\n` escapes fine),
   `GMAIL_IMPERSONATED_USER=contact@ram-strategicsystems.com`. Delete `DRY_RUN`.
   Redeploy.

The JSON key is a long-lived credential. It is scoped to one send-only Gmail
scope on one domain and is revocable from the admin console at any time. It is
never committed.

### Current state

`DRY_RUN=1` is still set, so the formatted lead prints to the Vercel runtime
logs and **no email is sent** until the three variables above exist and
`DRY_RUN` is removed. `LEAD_NOTIFICATION_EMAIL` is
`contact@ram-strategicsystems.com`.

### SPF note

The domain's SPF is `v=spf1 include:_spf.porkbun.com ~all` — it authorises
Porkbun, not Google. Internal Workspace delivery (contact@ → contact@) is
unaffected, but any mail Workspace sends to an external recipient currently
fails SPF. The fix is `include:_spf.google.com`, at Porkbun, where this
domain's DNS is hosted (not Cloudflare).

## Known gaps

- **Extraction accuracy is the open problem.** The first live test returned a
  malformed callback number and several fields that did not match the call.
  The router passes through whatever Vapi extracts; fixing this means changing
  the assistant prompt and output schema, not this code.
- When the AI emits the literal string `Unknown` for a field, the formatter
  renders it (e.g. "1 unknown door") rather than omitting the section.
- `DOOR4LIFE_ASSISTANT_IDS` is unset, so routing falls back to "the only
  configured client". Pin it to `688b11dd-c916-4b0c-b215-e979c13398f4` before a
  second business is added.
