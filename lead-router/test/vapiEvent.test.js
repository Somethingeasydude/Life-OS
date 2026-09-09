'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseVapiEvent,
  findStructuredOutput,
  structuredOutputNames,
} = require('../lib/vapiEvent');
const { qualifiedEvent, eventWithoutStructuredOutputs } = require('./helpers');

test('parses an end-of-call-report envelope', () => {
  const parsed = parseVapiEvent(qualifiedEvent());
  assert.equal(parsed.ok, true);
  assert.equal(parsed.event.type, 'end-of-call-report');
  assert.equal(parsed.event.callId, 'b7c1f0a2-9d3e-4f11-8a55-2c9e4d7b6a10');
  assert.equal(parsed.event.assistantId, '9a4c2e18-77b0-4d3a-b2f5-1e6d8c9a0b34');
  assert.equal(parsed.event.endedReason, 'customer-ended-call');
  assert.equal(parsed.event.endedAt, '2026-09-08T18:10:00.000Z');
});

test('rejects malformed bodies without throwing', () => {
  for (const body of [null, undefined, 'not json', 42, []]) {
    assert.equal(parseVapiEvent(body).ok, false, `expected rejection for ${JSON.stringify(body)}`);
  }
  assert.equal(parseVapiEvent({ message: {} }).reason, 'missing_message_type');
  assert.equal(parseVapiEvent({}).reason, 'missing_message_type');
});

test('reads structured outputs from call.artifact when the top-level artifact has none', () => {
  const event = qualifiedEvent();
  event.message.call.artifact = { structuredOutputs: event.message.artifact.structuredOutputs };
  delete event.message.artifact.structuredOutputs;

  const parsed = parseVapiEvent(event);
  assert.equal(structuredOutputNames(parsed.event.structuredOutputs)[0], 'door4life_service_lead');
});

test('reports no structured outputs when extraction has not finished', () => {
  const parsed = parseVapiEvent(eventWithoutStructuredOutputs());
  assert.equal(parsed.event.structuredOutputs, null);
  assert.deepEqual(structuredOutputNames(parsed.event.structuredOutputs), []);
});

test('finds a structured output by configured name, not by id', () => {
  const parsed = parseVapiEvent(qualifiedEvent());
  const result = findStructuredOutput(parsed.event.structuredOutputs, 'door4life_service_lead');
  assert.equal(result.caller_name, 'Billy Bob');
  assert.equal(findStructuredOutput(parsed.event.structuredOutputs, 'other_output'), null);
});

test('tolerates a name-keyed structured output map', () => {
  const outputs = { door4life_service_lead: { caller_name: 'Ada' } };
  assert.deepEqual(findStructuredOutput(outputs, 'door4life_service_lead'), { caller_name: 'Ada' });
});

test('handles a status-update event as a non-lead event type', () => {
  const parsed = parseVapiEvent({ message: { type: 'status-update', status: 'ended', call: { id: 'abc' } } });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.event.type, 'status-update');
});
