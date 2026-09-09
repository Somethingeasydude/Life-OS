'use strict';

/**
 * POST a fixture at a running Lead Router, local or deployed.
 *
 *   node scripts/send-fixture.js
 *   node scripts/send-fixture.js --url https://<project>.vercel.app/api/vapi
 *   node scripts/send-fixture.js --fixture end-of-call-report.qualified.json
 *   node scripts/send-fixture.js --mutate qualified_lead=false
 *
 * The secret comes from VAPI_WEBHOOK_SECRET, exactly as Vapi would send it.
 */

const fs = require('node:fs');
const path = require('node:path');

const FIXTURE_DIR = path.join(__dirname, '..', 'test', 'fixtures');
const OUTPUT_ID = '3f8b2c47-1d59-4e6a-9b07-5c2a8d1f4e63';

function parseArgs(argv) {
  const args = { url: 'http://localhost:3000/api/vapi', fixture: 'end-of-call-report.qualified.json', mutations: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inlineValue] = argv[i].split('=');
    const value = inlineValue !== undefined ? inlineValue : argv[i + 1];
    if (flag === '--url') args.url = value;
    else if (flag === '--fixture') args.fixture = value;
    else if (flag === '--mutate') args.mutations.push(value);
    if (inlineValue === undefined && ['--url', '--fixture', '--mutate'].includes(flag)) i += 1;
  }
  return args;
}

function coerce(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;
  if (/^-?\d+$/.test(value)) return Number.parseInt(value, 10);
  return value;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (!secret) {
    console.error('VAPI_WEBHOOK_SECRET must be set (same value the endpoint expects).');
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, args.fixture), 'utf8'));
  const outputs = payload.message?.artifact?.structuredOutputs;

  for (const mutation of args.mutations) {
    const [field, raw] = mutation.split('=');
    if (!outputs?.[OUTPUT_ID]) {
      console.error('fixture has no structured output to mutate');
      process.exit(1);
    }
    outputs[OUTPUT_ID].result[field] = coerce(raw);
  }

  // A fresh call id each run, so Resend's 24h idempotency window doesn't
  // suppress the second test send. Pass --mutate nothing to keep it stable.
  if (payload.message?.call?.id) {
    payload.message.call.id = `local-test-${Date.now()}`;
  }

  const response = await fetch(args.url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${secret}` },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  console.log(`${response.status} ${body}`);
  process.exit(response.ok ? 0 : 1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
