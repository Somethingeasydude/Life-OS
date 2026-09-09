# RAM Lead Router

Turns a completed Vapi AI receptionist call into a lead in someone's inbox.

RAM's product layer is this routing/business logic; the voice provider is
replaceable infrastructure behind it.

V0 scope: one client (Door4Life, private demo), one delivery channel (email).
No dashboard, CRM, SMS, database, photo workflow, scheduling, or phone routing.

**Door4Life has not authorized production use.** This is a private demo built on
publicly available business information. Do not point it at their phone number,
their systems, or their customers.

---

## The loop

```
caller → Vapi assistant → call ends
      → POST /api/vapi
      → verify credential, parse event
      → resolve client
      → get door4life_service_lead (payload, else re-read from Vapi)
      → normalize → qualify → format
      → Resend → contact@ram-strategicsystems.com
```

## Files

| File | Job |
|---|---|
| `api/vapi.js` | HTTP transport only: method, auth, body parse, status codes |
| `lib/handleLeadEvent.js` | The pipeline; no HTTP knowledge, so it's testable |
| `lib/verifyRequest.js` | Bearer credential check, constant-time |
| `lib/vapiEvent.js` | Envelope parsing, completion detection, output lookup by name |
| `lib/config.js` | Client registry + resolver (Door4Life is one entry) |
| `lib/resolveStructuredOutput.js` | Payload fast path, then bounded re-fetch |
| `lib/vapiApi.js` | `GET /call/:id` |
| `lib/normalizeLead.js` | Extracted fields → typed lead, nothing invented |
| `lib/qualifyLead.js` | notify / review / skip |
| `lib/formatNotification.js` | Subject + text + escaped HTML |
| `lib/emailDelivery.js` | Resend adapter, idempotency key, fixed recipients |
| `lib/logger.js` | Structured JSON logs with PII redaction |

Zero runtime dependencies. Node 20+ (`fetch` and `node:test` are built in).

## Vapi event handling

Every server message for the assistant hits the same Server URL — transcripts,
speech updates, status changes, tool calls. The endpoint acks all of them with
200 and does work for exactly two:

- `end-of-call-report`
- `status-update` where `status === "ended"`

Both are accepted because `end-of-call-report` is not guaranteed to arrive.
Processing the same call twice is harmless: delivery dedupes on the call id.

Anything else returns `{"status":"ignored"}`. Non-JSON or shapeless bodies get
400. A failed send gets 500, so it shows in Vapi's webhook log instead of
disappearing.

## Structured-output resolution

Structured outputs are **post-call analysis**. Vapi runs the extraction after
the call ends, stores it at `call.artifact.structuredOutputs`, and — as of this
writing — fires no webhook when it completes. So `end-of-call-report` frequently
arrives *without* the lead attached. This is the single most important behaviour
in the system:

1. Look for the output on the webhook payload (`message.artifact` or
   `message.call.artifact`), matched by **name**, not by output id — the id is a
   UUID that differs per environment.
2. If absent, wait and re-read `GET https://api.vapi.ai/call/:id` with the
   private API key. Default: two tries, 3s then 5s.
3. Give up at a hard 15s budget and log `structured_output_missing`.

The delays and the budget are tuning choices, not guarantees from Vapi — Vapi's
own examples wait ~5s. Adjust `STRUCTURED_OUTPUT_POLL_DELAYS_MS` and
`STRUCTURED_OUTPUT_BUDGET_MS` once real call logs show what's typical. The
budget exists to stay inside both Vapi's webhook timeout and the function's
30s `maxDuration`.

**Without `VAPI_API_KEY`, step 2 is skipped and most calls will produce no
email.** That is the most likely cause of a "nothing happened" test call.

## Qualification

| Extracted state | Behaviour |
|---|---|
| `qualified_lead === true`, priority not `NON-LEAD` | Normal lead email |
| `qualified_lead === false` | No email; logged `not_qualified` |
| `lead_priority === "NON-LEAD"` | No email; logged `priority_non_lead` |
| Qualification missing/unreadable, usable caller data present | `[NEEDS REVIEW]` email, banner saying it wasn't screened |
| Qualification missing/unreadable, nothing usable | No email; logged `lead_dropped_unusable` at warn |

"Usable" means a callback number, or a name plus something about the job. The
unreadable case leans toward sending: a false positive costs ten seconds of
reading, a dropped lead costs a job. Nothing is ever discarded silently.

The email states plainly that nothing is confirmed, booked, quoted, or received.
Photos available means the caller said they have photos. Requested timing is a
request, not an appointment.

## Duplicate protection

Every send carries `Idempotency-Key: door4life-lead-<callId>`. Resend dedupes on
that for 24 hours, so a Vapi retry — or both completion events for one call —
cannot produce a second email. No Redis, KV, or database, deliberately.

If a call somehow arrives with no id, the key falls back to a content hash.

## Security

- `Authorization: Bearer <VAPI_WEBHOOK_SECRET>` required on every request, and
  it is the only accepted form — no bare tokens, no alternate headers.
  Constant-time comparison.
- **Fails closed**: returns 500 until `VAPI_WEBHOOK_SECRET` is set.
- Non-POST rejected with 405.
- Recipients come only from config — a crafted payload cannot redirect mail.
- Caller text is HTML-escaped; subject newlines stripped (no header injection).
- Logs carry redacted phone/email (`***0158`) and never transcripts or payloads.
- Errors return a bare `{"error":"internal_error"}`; detail stays in logs.
- All secrets via environment variables; nothing client-side.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `VAPI_WEBHOOK_SECRET` | Yes | Expected Bearer token. Endpoint 500s without it |
| `RESEND_API_KEY` | Yes | Resend API key |
| `LEAD_FROM_EMAIL` | Yes | Verified sender, e.g. `RAM Lead Router <leads@ram-strategicsystems.com>` |
| `VAPI_API_KEY` | Strongly recommended | Private key for the re-fetch. Without it most calls send nothing |
| `LEAD_NOTIFICATION_EMAIL` | No | Recipients, comma-separated. Default `contact@ram-strategicsystems.com` |
| `VAPI_API_BASE` | No | Default `https://api.vapi.ai` |
| `STRUCTURED_OUTPUT_POLL_DELAYS_MS` | No | Default `3000,5000`. `off` disables re-fetching |
| `STRUCTURED_OUTPUT_BUDGET_MS` | No | Default `15000` |
| `DOOR4LIFE_ASSISTANT_IDS` | No | Pin the assistant. Required before a second client exists |
| `DOOR4LIFE_ENABLED` | No | Default `true` |
| `LOG_LEVEL` | No | `debug` \| `info` \| `warn` \| `error`. Keep at `info`+ in production |
| `DRY_RUN` | No | `1` prints the email instead of sending. **Local only** |

See `.env.example`.

## Deployment

The Life-OS dashboard project is untouched by this — the router deploys as its
own Vercel project from the same repo.

1. **Resend.** Sign up (free tier: 3,000/month, 100/day). Add and verify
   `ram-strategicsystems.com` under Domains, following the DNS records it gives
   you. Create an API key with send permission. For a first smoke test before
   DNS propagates, `onboarding@resend.dev` works as the sender to your own
   account address.
2. **Generate the webhook secret:**
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Vapi private API key.** Vapi Dashboard → API Keys → copy the private key.
   Server-side only.
4. **New Vercel project.** vercel.com/new → import this repo → set **Root
   Directory** to `lead-router` → deploy. No build command needed.
5. **Environment variables.** Add the four required ones (plus any optional) in
   Project Settings → Environment Variables, for Production. Redeploy.
6. **Verify it's alive:** a `GET` on the endpoint should return 405, and a POST
   without a credential 401. Both mean the function is running.

Webhook URL: `https://<project>.vercel.app/api/vapi`

## Vapi configuration

In the Door4Life — Private Demo assistant:

**Assistant → Advanced → Webhook Server**

- **Server URL:** `https://<project>.vercel.app/api/vapi`
- **Authorization → Add New → Bearer Token**
  - Header: `Authorization`
  - Bearer prefix: enabled
  - Token: the same value as `VAPI_WEBHOOK_SECRET`
- **Timeout:** 20–30 seconds (the handler budgets 15s for extraction)

Do not leave this on "No authentication" — the endpoint will reject every
request with 401, which is the intended behaviour.

Confirm the assistant's structured output is named exactly
`door4life_service_lead` and is attached to the assistant
(`artifactPlan.structuredOutputIds`).

## Testing

```bash
npm test                    # 74 tests, no network, no keys needed

# Full pipeline locally, printing the email instead of sending it:
DRY_RUN=1 VAPI_WEBHOOK_SECRET=dev-secret \
  LEAD_FROM_EMAIL="RAM Lead Router <leads@ram-strategicsystems.com>" \
  STRUCTURED_OUTPUT_POLL_DELAYS_MS=off node scripts/local-server.js

# In another shell:
VAPI_WEBHOOK_SECRET=dev-secret node scripts/send-fixture.js
VAPI_WEBHOOK_SECRET=dev-secret node scripts/send-fixture.js --mutate qualified_lead=false
VAPI_WEBHOOK_SECRET=dev-secret node scripts/send-fixture.js --mutate lead_priority=NON-LEAD
```

`send-fixture.js` also targets the deployed endpoint with
`--url https://<project>.vercel.app/api/vapi`, which sends a real email. It
rewrites the call id each run so Resend's idempotency window doesn't suppress
repeat tests.

### The real test call

Call the assistant, give it a lead, hang up. Then:

- **Vapi** → the call → Logs: confirm the Server URL was called and what it
  returned.
- **Vercel** → project → Logs: the JSON trail is
  `event_received` → `client_resolved` → `structured_output_found` (with
  `source: webhook` or `vapi_api`) → `lead_qualified` → `notification_delivered`.
- **Resend** → Emails: delivery status.

Failure reads directly off that trail: 401 means the token doesn't match; a
missing `structured_output_found` with `structured_output_refetch_skipped`
means `VAPI_API_KEY` isn't set; `structured_output_missing` means extraction
took longer than the budget.

## Adding a second client

1. Add a config factory in `lib/config.js` beside `door4lifeConfig()` with the
   new business's `structuredOutputName` and recipients.
2. Add it to the `clients()` list.
3. Pin `DOOR4LIFE_ASSISTANT_IDS` and the new client's assistant ids — with two
   clients, assistant-id routing is what keeps them apart.

Nothing else changes. Delivery channels extend the same way: a new adapter with
the same shape as `deliverEmail`.

## Known V0 limitations

- **Extraction slower than the budget loses the lead.** It's logged, not
  emailed, and nothing retries later. A durable fix needs a queue or a scheduled
  sweep of recent calls — deliberately out of scope.
- **Deduplication depends on Resend's 24h window.** Adequate here; a retry
  beyond 24 hours would resend.
- **One client is assumed while no assistant id is pinned** — everything routes
  to Door4Life. Pin the ids before onboarding a second business.
- **No persistence.** A lead exists only as an email. No history, no analytics.
- **Free-tier ceilings:** Resend 100/day, 3,000/month.
