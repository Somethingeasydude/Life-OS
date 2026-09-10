'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { handleLeadEvent } = require('../lib/handleLeadEvent');
const { qualifiedEvent, eventWithoutStructuredOutputs, withEnv, BASE_ENV } = require('./helpers');

function recorder() {
  const sent = [];
  const deliver = async (args) => {
    sent.push(args);
    return { channel: 'email', messageId: `msg-${sent.length}` };
  };
  return { sent, deliver };
}

const run = (body, deps, env = {}) =>
  withEnv({ ...BASE_ENV, ...env }, () => handleLeadEvent(body, deps));

test('qualified Door4Life lead is delivered', async () => {
  const { sent, deliver } = recorder();
  const result = await run(qualifiedEvent(), { deliver });

  assert.equal(result.status, 200);
  assert.equal(result.body.status, 'notified');
  assert.equal(result.body.clientId, 'door4life');
  assert.equal(sent.length, 1);
  assert.equal(sent[0].notification.subject, '[HIGH] New Door4Life Quote Lead — Billy Bob');
  assert.deepEqual(sent[0].client.notificationRecipients, ['contact@ram-strategicsystems.com']);
});

test('non-qualified lead is logged but not emailed', async () => {
  const { sent, deliver } = recorder();
  const result = await run(qualifiedEvent({ qualified_lead: false, lead_priority: 'NON-LEAD' }), { deliver });

  assert.equal(result.status, 200);
  assert.equal(result.body.status, 'skipped');
  assert.equal(result.body.reason, 'priority_non_lead');
  assert.equal(sent.length, 0);
});

test('unreadable qualification is delivered for review rather than dropped', async () => {
  const { sent, deliver } = recorder();
  const result = await run(qualifiedEvent({ qualified_lead: undefined }), { deliver });

  assert.equal(result.body.status, 'notified');
  assert.equal(result.body.action, 'review');
  assert.match(sent[0].notification.subject, /^\[NEEDS REVIEW\]/);
});

test('missing structured output acks without sending anything', async () => {
  const { sent, deliver } = recorder();
  const result = await run(eventWithoutStructuredOutputs(), { deliver });

  assert.equal(result.status, 200);
  assert.equal(result.body.status, 'no_structured_output');
  assert.equal(sent.length, 0);
});

test('falls back to the Vapi API when extraction lands after the webhook', async () => {
  const { sent, deliver } = recorder();
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      json: async () => ({
        artifact: {
          structuredOutputs: {
            'uuid-1': {
              name: 'door4life_service_lead',
              result: { caller_name: 'Late Larry', qualified_lead: true, lead_priority: 'MEDIUM' },
            },
          },
        },
      }),
    };
  };

  const result = await run(
    eventWithoutStructuredOutputs(),
    { deliver, fetchImpl, sleep: async () => {} },
    { VAPI_API_KEY: 'vapi-test-key', STRUCTURED_OUTPUT_POLL_DELAYS_MS: '1,1' },
  );

  assert.equal(result.body.status, 'notified');
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/call\/b7c1f0a2-9d3e-4f11-8a55-2c9e4d7b6a10$/);
  assert.equal(calls[0].options.headers.Authorization, 'Bearer vapi-test-key');
  assert.equal(sent[0].notification.subject, '[MEDIUM] New Door4Life Quote Lead — Late Larry');
});

test('gives up cleanly when the API never returns the output', async () => {
  const { sent, deliver } = recorder();
  let attempts = 0;
  const fetchImpl = async () => {
    attempts += 1;
    return { ok: true, status: 200, json: async () => ({ artifact: {} }) };
  };

  const result = await run(
    eventWithoutStructuredOutputs(),
    { deliver, fetchImpl, sleep: async () => {} },
    { VAPI_API_KEY: 'vapi-test-key', STRUCTURED_OUTPUT_POLL_DELAYS_MS: '1,1' },
  );

  assert.equal(result.body.status, 'no_structured_output');
  assert.equal(attempts, 2);
  assert.equal(sent.length, 0);
});

test('a failing Vapi API lookup degrades instead of throwing', async () => {
  const { deliver } = recorder();
  const fetchImpl = async () => {
    throw new Error('network down');
  };

  const result = await run(
    eventWithoutStructuredOutputs(),
    { deliver, fetchImpl, sleep: async () => {} },
    { VAPI_API_KEY: 'vapi-test-key', STRUCTURED_OUTPUT_POLL_DELAYS_MS: '1' },
  );

  assert.equal(result.status, 200);
  assert.equal(result.body.status, 'no_structured_output');
});

test('a status-update of "ended" resolves the lead but does not send it', async () => {
  const { sent, deliver } = recorder();
  const event = qualifiedEvent();
  event.message.type = 'status-update';
  event.message.status = 'ended';

  const result = await run(event, { deliver });
  assert.equal(result.body.status, 'captured');
  assert.equal(result.body.delivered, false);
  assert.equal(sent.length, 0, 'only end-of-call-report delivers');
});

test('an in-progress status-update does not trigger resolution', async () => {
  const { sent, deliver } = recorder();
  const event = qualifiedEvent();
  event.message.type = 'status-update';
  event.message.status = 'in-progress';

  const result = await run(event, { deliver });
  assert.equal(result.body.status, 'ignored');
  assert.equal(sent.length, 0);
});

test('both completion events for one call produce exactly one notification', async () => {
  const { sent, deliver } = recorder();
  const statusEvent = qualifiedEvent();
  statusEvent.message.type = 'status-update';
  statusEvent.message.status = 'ended';

  // The real sequence: status-update/ended lands first, the report ~5s later.
  await run(statusEvent, { deliver });
  await run(qualifiedEvent(), { deliver });

  assert.equal(sent.length, 1, 'one call, one email — no dedupe store required');
  assert.equal(
    sent[0].idempotencyKey,
    'door4life-lead-b7c1f0a2-9d3e-4f11-8a55-2c9e4d7b6a10',
    'deterministic key retained for traceability',
  );
});

test('a lead with no usable caller data is logged, not emailed', async () => {
  const { sent, deliver } = recorder();
  const result = await run(
    qualifiedEvent({
      qualified_lead: undefined,
      caller_name: null,
      callback_number: null,
      service_requested: null,
      issue_summary: null,
      door_condition: null,
      service_location: null,
    }),
    { deliver },
  );

  assert.equal(result.body.status, 'skipped');
  assert.equal(result.body.reason, 'qualification_missing_and_no_actionable_data');
  assert.equal(sent.length, 0);
});

test('an unscreened lead with only a callback number is still delivered', async () => {
  const { sent, deliver } = recorder();
  const result = await run(
    qualifiedEvent({ qualified_lead: undefined, caller_name: null }),
    { deliver },
  );

  assert.equal(result.body.action, 'review');
  assert.equal(sent.length, 1);
  assert.match(sent[0].notification.subject, /— Unknown caller$/);
});

test('unrelated Vapi event types are acknowledged and ignored', async () => {
  const { sent, deliver } = recorder();
  for (const type of ['transcript', 'speech-update', 'tool-calls', 'hang', 'conversation-update']) {
    const result = await run({ message: { type, call: { id: 'x' } } }, { deliver });
    assert.equal(result.status, 200, type);
    assert.equal(result.body.status, 'ignored', type);
  }
  assert.equal(sent.length, 0);
});

test('malformed webhook bodies are rejected with 400', async () => {
  const { deliver } = recorder();
  for (const body of [null, 'garbage', [], { message: {} }, { message: { type: 42 } }]) {
    const result = await run(body, { deliver });
    assert.equal(result.status, 400, JSON.stringify(body));
    assert.equal(result.body.error, 'invalid_payload');
  }
});

test('a webhook retry reuses the same idempotency key', async () => {
  const { sent, deliver } = recorder();
  await run(qualifiedEvent(), { deliver });
  await run(qualifiedEvent(), { deliver });

  assert.equal(sent.length, 2);
  assert.equal(sent[0].idempotencyKey, 'door4life-lead-b7c1f0a2-9d3e-4f11-8a55-2c9e4d7b6a10');
  assert.equal(sent[1].idempotencyKey, sent[0].idempotencyKey);
});

test('a disabled client stops delivery', async () => {
  const { sent, deliver } = recorder();
  const result = await run(qualifiedEvent(), { deliver }, { DOOR4LIFE_ENABLED: 'false' });

  assert.equal(result.body.status, 'ignored');
  assert.equal(result.body.reason, 'client_not_resolved');
  assert.equal(sent.length, 0);
});

test('an event from another assistant does not route to a pinned client', async () => {
  const { sent, deliver } = recorder();
  const result = await run(
    eventWithoutStructuredOutputs(),
    { deliver },
    { DOOR4LIFE_ASSISTANT_IDS: 'some-other-assistant-id' },
  );

  assert.equal(result.body.reason, 'client_not_resolved');
  assert.equal(sent.length, 0);
});
