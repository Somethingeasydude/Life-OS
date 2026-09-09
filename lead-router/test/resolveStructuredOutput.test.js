'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveStructuredOutput } = require('../lib/resolveStructuredOutput');
const { door4lifeConfig } = require('../lib/config');
const { withEnv, BASE_ENV } = require('./helpers');

const LEAD = { caller_name: 'Billy Bob', qualified_lead: true, lead_priority: 'HIGH' };

const outputsPayload = (name = 'door4life_service_lead') => ({
  'a1b2c3d4-0000-0000-0000-000000000001': { name, result: LEAD },
});

function apiFetch(sequence, recorded = []) {
  let index = 0;
  return async (url, options) => {
    recorded.push({ url, options });
    const outputs = sequence[Math.min(index, sequence.length - 1)];
    index += 1;
    return { ok: true, status: 200, json: async () => ({ artifact: { structuredOutputs: outputs } }) };
  };
}

function fakeClock() {
  let current = 0;
  return {
    now: () => current,
    sleep: async (ms) => {
      current += ms;
    },
    advance: (ms) => {
      current += ms;
    },
  };
}

const resolve = (event, deps, env = {}) =>
  withEnv({ ...BASE_ENV, ...env }, () =>
    resolveStructuredOutput({ event, client: door4lifeConfig(), ...deps }),
  );

test('uses the structured output already on the webhook payload', async () => {
  const recorded = [];
  const result = await resolve(
    { callId: 'call-1', structuredOutputs: outputsPayload() },
    { fetchImpl: apiFetch([outputsPayload()], recorded), sleep: async () => {} },
    { VAPI_API_KEY: 'key' },
  );

  assert.equal(result.source, 'webhook');
  assert.equal(result.attempts, 0);
  assert.equal(result.result.caller_name, 'Billy Bob');
  assert.equal(recorded.length, 0, 'no API call when the payload already has it');
});

test('re-reads the call when the payload has no structured output yet', async () => {
  const recorded = [];
  const clock = fakeClock();
  const result = await resolve(
    { callId: 'call-2', structuredOutputs: null },
    { fetchImpl: apiFetch([{}, outputsPayload()], recorded), sleep: clock.sleep, now: clock.now },
    { VAPI_API_KEY: 'key', STRUCTURED_OUTPUT_POLL_DELAYS_MS: '3000,5000' },
  );

  assert.equal(result.source, 'vapi_api');
  assert.equal(result.attempts, 2);
  assert.equal(recorded.length, 2);
  assert.equal(recorded[0].url, 'https://api.vapi.ai/call/call-2');
  assert.equal(recorded[0].options.headers.Authorization, 'Bearer key');
});

test('stops at the first successful re-read', async () => {
  const recorded = [];
  const clock = fakeClock();
  const result = await resolve(
    { callId: 'call-3', structuredOutputs: null },
    { fetchImpl: apiFetch([outputsPayload()], recorded), sleep: clock.sleep, now: clock.now },
    { VAPI_API_KEY: 'key', STRUCTURED_OUTPUT_POLL_DELAYS_MS: '3000,5000' },
  );

  assert.equal(result.attempts, 1);
  assert.equal(recorded.length, 1);
});

test('ignores structured outputs belonging to another client', async () => {
  const clock = fakeClock();
  const result = await resolve(
    { callId: 'call-4', structuredOutputs: outputsPayload('some_other_lead') },
    {
      fetchImpl: apiFetch([outputsPayload('some_other_lead')]),
      sleep: clock.sleep,
      now: clock.now,
    },
    { VAPI_API_KEY: 'key', STRUCTURED_OUTPUT_POLL_DELAYS_MS: '1000' },
  );

  assert.equal(result.result, null);
  assert.equal(result.source, 'none');
});

test('stops re-reading once the time budget is spent', async () => {
  const recorded = [];
  const clock = fakeClock();
  const result = await resolve(
    { callId: 'call-5', structuredOutputs: null },
    { fetchImpl: apiFetch([{}], recorded), sleep: clock.sleep, now: clock.now },
    {
      VAPI_API_KEY: 'key',
      STRUCTURED_OUTPUT_POLL_DELAYS_MS: '4000,4000,4000,4000',
      STRUCTURED_OUTPUT_BUDGET_MS: '9000',
    },
  );

  assert.equal(result.result, null);
  assert.equal(result.attempts, 2, 'third wait would exceed the budget');
  assert.equal(recorded.length, 2);
});

test('skips re-reading entirely without an API key', async () => {
  const recorded = [];
  const result = await resolve(
    { callId: 'call-6', structuredOutputs: null },
    { fetchImpl: apiFetch([outputsPayload()], recorded), sleep: async () => {} },
    { VAPI_API_KEY: undefined },
  );

  assert.equal(result.result, null);
  assert.equal(result.attempts, 0);
  assert.equal(recorded.length, 0);
});

test('honours re-fetching being switched off', async () => {
  const recorded = [];
  const result = await resolve(
    { callId: 'call-7', structuredOutputs: null },
    { fetchImpl: apiFetch([outputsPayload()], recorded), sleep: async () => {} },
    { VAPI_API_KEY: 'key', STRUCTURED_OUTPUT_POLL_DELAYS_MS: 'off' },
  );

  assert.equal(result.result, null);
  assert.equal(recorded.length, 0);
});

test('degrades quietly when the API errors or returns a bad status', async () => {
  const clock = fakeClock();
  const failing = async () => ({ ok: false, status: 500, text: async () => 'boom' });
  const throwing = async () => {
    throw new Error('network down');
  };

  for (const fetchImpl of [failing, throwing]) {
    const result = await resolve(
      { callId: 'call-8', structuredOutputs: null },
      { fetchImpl, sleep: clock.sleep, now: clock.now },
      { VAPI_API_KEY: 'key', STRUCTURED_OUTPUT_POLL_DELAYS_MS: '1000' },
    );
    assert.equal(result.result, null);
    assert.equal(result.source, 'none');
  }
});
