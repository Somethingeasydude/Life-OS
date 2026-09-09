'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { formatNotification } = require('../lib/formatNotification');
const { normalizeLead } = require('../lib/normalizeLead');
const { qualifyLead } = require('../lib/qualifyLead');
const { door4lifeConfig } = require('../lib/config');
const { qualifiedEvent, withEnv, BASE_ENV } = require('./helpers');

const EVENT = {
  callId: 'b7c1f0a2-9d3e-4f11-8a55-2c9e4d7b6a10',
  endedAt: '2026-09-08T18:10:00.000Z',
};

function render(overrides = {}) {
  return withEnv(BASE_ENV, () => {
    const raw = qualifiedEvent(overrides).message.artifact.structuredOutputs[
      '3f8b2c47-1d59-4e6a-9b07-5c2a8d1f4e63'
    ].result;
    const lead = normalizeLead(raw);
    return formatNotification({
      lead,
      client: door4lifeConfig(),
      event: EVENT,
      qualification: qualifyLead(lead),
    });
  });
}

test('builds the scannable subject and body for a HIGH lead', () => {
  const { subject, text } = render();
  assert.equal(subject, '[HIGH] New Door4Life Quote Lead — Billy Bob');
  assert.match(text, /NEW DOOR4LIFE LEAD/);
  assert.match(text, /Priority: HIGH/);
  assert.match(text, /Billy Bob\n470-716-0158/);
  assert.match(text, /Door:\n1 Mahogany door/);
  assert.match(text, /Photos available:\nYes/);
  assert.match(text, /Location:\nGainesville/);
  assert.match(text, /Call ID:\nb7c1f0a2-9d3e-4f11-8a55-2c9e4d7b6a10/);
});

test('adapts the subject to priority and caller name', () => {
  assert.match(render({ lead_priority: 'MEDIUM' }).subject, /^\[MEDIUM\] New Door4Life Quote Lead — Billy Bob$/);
  assert.match(render({ lead_priority: 'LOW', caller_name: 'Ada Lovelace' }).subject, /^\[LOW\] New Door4Life Quote Lead — Ada Lovelace$/);
  assert.match(render({ caller_name: null }).subject, /— Unknown caller$/);
  assert.match(render({ lead_priority: null }).subject, /^\[UNSPECIFIED\]/);
});

test('omits missing fields instead of printing undefined or null', () => {
  const { text, html } = render({
    door_material_type: null,
    door_count: null,
    photos_available: null,
    questions_for_team: '',
    pricing_interest: null,
  });
  assert.doesNotMatch(text, /undefined|null|\[object Object\]/);
  assert.doesNotMatch(html, /undefined|null|\[object Object\]/);
  assert.doesNotMatch(text, /Door:/);
  assert.doesNotMatch(text, /Photos available:/);
  assert.doesNotMatch(text, /Needs team confirmation:/);
});

test('pluralizes the door line and survives a missing material', () => {
  assert.match(render({ door_count: 3 }).text, /Door:\n3 Mahogany doors/);
  assert.match(render({ door_material_type: null, door_count: 2 }).text, /Door:\n2 doors/);
});

test('escapes malicious caller text in the HTML body', () => {
  const { html, text } = render({
    caller_name: '<script>alert("xss")</script>',
    issue_summary: 'Door & frame <img src=x onerror=alert(1)>',
  });
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Door &amp; frame/);
  // The text part is not markup, so it stays verbatim for the reader.
  assert.match(text, /<script>alert\("xss"\)<\/script>/);
});

test('strips newlines from the subject so headers cannot be injected', () => {
  const { subject } = render({ caller_name: 'Billy\r\nBcc: attacker@example.com' });
  assert.doesNotMatch(subject, /[\r\n]/);
  assert.match(subject, /Billy Bcc: attacker@example.com/);
});

test('flags an unscreened lead and never claims an action happened', () => {
  const { subject, text } = render({ qualified_lead: undefined });
  assert.match(subject, /^\[NEEDS REVIEW\]/);
  assert.match(text, /has not been screened/);
  assert.match(text, /Nothing here is confirmed, booked, quoted, or received/);
});
