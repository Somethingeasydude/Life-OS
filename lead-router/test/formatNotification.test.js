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

// B6. Observed in production on 2026-09-12 and again on the 2026-09-22 canary:
// the caller described "a mahogany French door", and the formatter appended
// its own noun on top of the one already there.
test('regression: "1 mahogany French door door" never renders again', () => {
  assert.match(
    render({ door_material_type: 'mahogany French door', door_count: 1 }).text,
    /Door:\n1 mahogany French door\n/,
  );
  assert.doesNotMatch(render({ door_material_type: 'mahogany French door', door_count: 1 }).text, /door door/i);
});

test('the noun agrees with the count however the caller phrased the material', () => {
  const doorLine = (door_material_type, door_count) =>
    render({ door_material_type, door_count }).text.match(/Door:\n(.+)/)[1];

  // description already ends in the noun — singular and plural both corrected
  assert.equal(doorLine('mahogany French door', 2), '2 mahogany French doors');
  assert.equal(doorLine('French doors', 1), '1 French door');
  assert.equal(doorLine('French Doors', 3), '3 French doors');

  // description is a bare material — unchanged from the previous behaviour
  assert.equal(doorLine('oak', 1), '1 oak door');
  assert.equal(doorLine('oak', 2), '2 oak doors');

  // the noun on its own is not doubled, and does not leave a dangling space
  assert.equal(doorLine('door', 1), '1 door');
  assert.equal(doorLine('doors', 4), '4 doors');
});

test('a material ending in the noun still renders without a count', () => {
  assert.match(
    render({ door_material_type: 'mahogany French door', door_count: null }).text,
    /Door:\nMahogany French door\n/,
  );
});

test('a word merely ending in "door" is not mistaken for the noun', () => {
  // \b guards the strip: "outdoor" must survive intact.
  assert.match(render({ door_material_type: 'outdoor oak', door_count: 1 }).text, /Door:\n1 outdoor oak door\n/);
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
