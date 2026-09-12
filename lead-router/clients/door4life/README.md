# Door4Life — client configuration and runbook

Client #1 of the RAM Lead Router. Demo only — **Door4Life has not authorized
production use.** Do not contact them, use their phone number, or represent RAM
as affiliated with them.

Frozen known-good state: [`BASELINE-v1.md`](./BASELINE-v1.md). Read that first
when something breaks — it records what was actually proven working, and what
was already known broken, as of 2026-09-12.

## Canonical identifiers

| | |
|---|---|
| Vapi assistant | `688b11dd-c916-4b0c-b215-e979c13398f4` |
| Structured output | `door4life_service_lead` / `c1391867-7ee3-4398-ad89-18f4dbdf247a` |
| Webhook | `https://ram-lead-router.vercel.app/api/vapi` |
| Vercel project | `prj_y23QQqjYh1iTsCORyXYTftzD4p3q` |
| Lead recipient | `contact@ram-strategicsystems.com` |

Router-side config lives in `../../lib/config.js` → `door4lifeConfig()`.
Everything environment-specific is an env var, never committed.

## How to update the live assistant

**Do not use the Vapi dashboard Publish button.** It fails on a phantom
structured-output UUID (BASELINE-v1 defect 10) and, if it ever succeeded while
carrying that stale draft, could overwrite the server config that makes the
webhook work. The live assistant is correctly configured *without* Publish
having ever succeeded.

**Do not use Vapi MCP `update_assistant`.** It cannot write `artifactPlan` or
`server`, it would overwrite a system prompt that MCP cannot read back, and its
model enum excludes gpt-4.1-mini (BASELINE-v1 defect 11).

**Use the REST API**, read-modify-write, one field group at a time:

```
GET   https://api.vapi.ai/assistant/688b11dd-c916-4b0c-b215-e979c13398f4
PATCH https://api.vapi.ai/assistant/688b11dd-c916-4b0c-b215-e979c13398f4
Authorization: Bearer <VAPI_API_KEY>
```

`PATCH` replaces whole nested objects. To change one key inside `artifactPlan`
or `server`, GET the current object, modify that key, and PATCH the object back
intact — otherwise the other keys are dropped.

Note: `api.vapi.ai` is unreachable from the Claude Code sandbox (egress policy),
so these calls run from a trusted local machine or a server that holds the key.

## How to deploy the router

Production is a **direct file upload, not git-linked**. Pushing this branch does
not deploy. A deploy uploads `api/`, `lib/`, `package.json`, and `vercel.json`;
tests, scripts, and docs are not deployed.

Environment variables are snapshotted into a deployment at deploy time. **A
running deployment never picks up later env changes** — any edit in project
settings requires a redeploy to take effect. This has already caused one failed
test call.

## How to verify a call end to end

1. Make a call, hang up, and check the logs **within the hour** — Vercel Hobby
   retention is roughly that, and expired logs cannot be recovered.
2. The healthy `end-of-call-report` trace is:
   `event_received` → `client_resolved` → `structured_output_found` →
   `lead_qualified` → `delivery_adapter_selected` → `notification_delivered`
   (with a `messageId`).
3. `structured_output_found` reports `source: webhook` (output was on the
   payload) or `source: vapi_api` (recovered by re-fetch). Both are healthy;
   which one tells you whether the re-fetch is load-bearing that day.
4. `lead_captured_not_delivered` on the `status-update`/ended event is
   **expected and correct** — that is the single-trigger rule working.
5. On failure, `resend_rejected` carries the provider's verbatim status and
   body. That is the line to read first.

## Adding the next client

Copy this directory's shape, not its contents:

```
lead-router/clients/<slug>/
  BASELINE-v1.md   ← frozen once the first real call is proven
  README.md        ← identifiers + runbook
```

Then add a config factory beside `door4lifeConfig()` in `../../lib/config.js`
and register it in `clients()`. **Before the second client exists, pin
`DOOR4LIFE_ASSISTANT_IDS`** — client resolution currently falls back to "the
only configured client," which becomes silently wrong with two
(BASELINE-v1 defect 8).
