'use strict';

// Hardening Cycle #1, Phase A regressions.
//
// Two real failures drove these: a callback number captured as "404404404"
// that would have reached the inbox looking legitimate, and a caller name of
// "unknown" that rendered as content. Both are asserted against here so they
// cannot come back quietly.

const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeLead, isPlaceholder, phonePlausibility } = require('../lib/normalizeLead');
const { qualifyLead, hasActionableData } = require('../lib/qualifyLead');
const { formatNotification, UNVERIFIED_NUMBER_NOTE, REVIEW_BANNERS } = require('../lib/formatNotification');
const { door4lifeConfig } = require('../lib/config');

const EVENT = { callId: 'call-abc', endedAt: '2026-09-16T12:00:00.000Z' };
const CLIENT = { businessName: 'Door4Life', leadLabel: 'Quote Lead', clientId: 'door4life' };

const render = (raw) => {
  const lead = normalizeLead(raw);
  const qualification = qualifyLead(lead);
  return { lead, qualification, notification: formatNotification({ lead, client: CLIENT, event: EVENT, qualification }) };
};

// --- placeholder normalization ---------------------------------------------

test('recognises placeholder tokens regardless of case or padding', () => {
  for (const token of ['unknown', 'UNKNOWN', '  Unknown  ', 'N/A', 'n/a', 'none', 'null',
    'undefined', 'not provided', 'Not Specified', 'no answer', 'tbd', 'unspecified']) {
    assert.equal(isPlaceholder(token), true, token);
  }
});

test('does not treat real content containing a placeholder word as a placeholder', () => {
  assert.equal(isPlaceholder('the caller was unknown to the team'), false);
  assert.equal(isPlaceholder('Mahogany'), false);
  assert.equal(isPlaceholder(''), false);
  assert.equal(isPlaceholder(null), false);
  assert.equal(isPlaceholder(42), false);
});

test('placeholder values normalise to null and are recorded', () => {
  const lead = normalizeLead({
    caller_name: 'unknown',
    property_type: 'N/A',
    door_material_type: 'not provided',
    issue_summary: 'Caller was unknown to the team but described a sticking door.',
  });

  assert.equal(lead.callerName, null);
  assert.equal(lead.propertyType, null);
  assert.equal(lead.doorMaterialType, null);
  assert.equal(
    lead.issueSummary,
    'Caller was unknown to the team but described a sticking door.',
    'a summary merely containing the word survives intact',
  );
  assert.deepEqual(lead.placeholderFields.sort(), ['callerName', 'doorMaterialType', 'propertyType']);
});

test('regression: "1 unknown door" never renders again', () => {
  const { notification } = render({
    caller_name: 'unknown',
    callback_number: '470-716-0158',
    door_count: 1,
    door_material_type: 'unknown',
    property_type: 'Unknown',
    qualified_lead: true,
    lead_priority: 'HIGH',
  });

  assert.doesNotMatch(notification.text, /unknown/i);
  assert.doesNotMatch(notification.html, /unknown/i);
  assert.match(notification.text, /^Door:\n1 door$/m, 'door count survives without the material');
  assert.doesNotMatch(notification.text, /^Property:/m, 'placeholder property is omitted entirely');
  assert.match(notification.subject, /— Unknown caller$/, 'subject uses the honest fallback');
});

test('a lead whose every field is a placeholder is not actionable', () => {
  const lead = normalizeLead({
    caller_name: 'unknown',
    callback_number: 'n/a',
    service_location: 'none',
    issue_summary: 'not provided',
  });
  assert.equal(hasActionableData(lead), false);
  assert.equal(qualifyLead(lead).action, 'skip');
});

// --- callback-number plausibility ------------------------------------------

test('accepts dialable NANP numbers in any formatting', () => {
  for (const value of ['470-716-0158', '(470) 716-0158', '4707160158', '+1 470 716 0158',
    '1-470-716-0158', ' 470.716.0158 ']) {
    assert.equal(phonePlausibility(value), true, value);
  }
});

test('rejects numbers that cannot be dialled', () => {
  assert.equal(phonePlausibility('404404404'), false, 'nine digits — the real failure');
  assert.equal(phonePlausibility('12345'), false);
  assert.equal(phonePlausibility('470716015812345'), false);
  assert.equal(phonePlausibility('070-716-0158'), false, 'area code cannot start with 0');
  assert.equal(phonePlausibility('170-716-0158'), false, 'area code cannot start with 1');
  assert.equal(phonePlausibility('470-016-0158'), false, 'exchange cannot start with 0');
  assert.equal(phonePlausibility('470-116-0158'), false, 'exchange cannot start with 1');
  assert.equal(phonePlausibility('not a number'), false);
});

test('reports null when there is nothing to judge', () => {
  assert.equal(phonePlausibility(null), null);
  assert.equal(phonePlausibility(''), null);
  assert.equal(phonePlausibility('   '), null);
  assert.equal(normalizeLead({}).callbackNumberPlausible, null);
});

test('the malformed number is preserved, never discarded', () => {
  const lead = normalizeLead({ callback_number: '404404404', qualified_lead: true });
  assert.equal(lead.callbackNumber, '404404404', 'raw value kept for diagnosis');
  assert.equal(lead.callbackNumberPlausible, false);
});

// --- the lead stays honest about itself ------------------------------------

test('regression: a qualified lead with an undialable number is flagged, not presented as clean', () => {
  const { qualification, notification } = render({
    caller_name: 'Billy Bob',
    callback_number: '404404404',
    service_location: 'Gainesville',
    qualified_lead: true,
    lead_priority: 'HIGH',
  });

  assert.equal(qualification.action, 'review');
  assert.equal(qualification.reason, 'callback_number_implausible');

  assert.match(notification.subject, /^\[NEEDS REVIEW\]/, 'the doubt reaches the subject line');
  assert.match(notification.text, /404404404/, 'the captured value is still shown');
  assert.ok(notification.text.includes(UNVERIFIED_NUMBER_NOTE), 'with the warning attached to it');
  assert.ok(notification.text.includes(REVIEW_BANNERS.callback_number_implausible));
});

test('the lead is still delivered — flagged, never dropped', () => {
  const { qualification } = render({
    caller_name: 'Billy Bob',
    callback_number: '404404404',
    qualified_lead: true,
    lead_priority: 'HIGH',
  });
  assert.notEqual(qualification.action, 'skip', 'a real lead is never silently discarded');
});

test('a dialable number produces no warning and no review banner', () => {
  const { qualification, notification } = render({
    caller_name: 'Billy Bob',
    callback_number: '470-716-0158',
    qualified_lead: true,
    lead_priority: 'HIGH',
  });

  assert.equal(qualification.action, 'notify');
  assert.match(notification.subject, /^\[HIGH\]/);
  assert.doesNotMatch(notification.text, /verify before calling/);
  assert.doesNotMatch(notification.text, /could not be read/);
});

test('the review banner names the actual problem', () => {
  const missingQualification = render({
    caller_name: 'Billy Bob',
    callback_number: '470-716-0158',
  });
  assert.equal(missingQualification.qualification.reason, 'qualification_missing');
  assert.ok(missingQualification.notification.text.includes(REVIEW_BANNERS.qualification_missing));
  assert.ok(!missingQualification.notification.text.includes(REVIEW_BANNERS.callback_number_implausible));
});

test('an undialable number alone does not make a lead actionable', () => {
  const lead = normalizeLead({ callback_number: '404404404' });
  assert.equal(hasActionableData(lead), false);

  const withSubstance = normalizeLead({
    callback_number: '404404404',
    caller_name: 'Billy Bob',
    door_condition: 'sticking at the bottom',
  });
  assert.equal(hasActionableData(withSubstance), true, 'name plus substance still counts');
});

test('door4life config is unchanged by this cycle', () => {
  const client = door4lifeConfig();
  assert.equal(client.clientId, 'door4life');
  assert.equal(client.structuredOutputName, 'door4life_service_lead');
});
