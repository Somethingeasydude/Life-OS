'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeLead } = require('../lib/normalizeLead');
const { qualifiedEvent } = require('./helpers');

function rawLead(overrides = {}) {
  const event = qualifiedEvent(overrides);
  return event.message.artifact.structuredOutputs['3f8b2c47-1d59-4e6a-9b07-5c2a8d1f4e63'].result;
}

test('passes extracted values through unchanged', () => {
  const lead = normalizeLead(rawLead());
  assert.equal(lead.callerName, 'Billy Bob');
  assert.equal(lead.callbackNumber, '470-716-0158');
  assert.equal(lead.serviceLocation, 'Gainesville');
  assert.equal(lead.propertyType, 'residential');
  assert.equal(lead.doorMaterialType, 'Mahogany');
  assert.equal(lead.doorCount, 1);
  assert.equal(lead.doorCondition, 'sticking at the bottom');
  assert.equal(lead.desiredTiming, 'as soon as possible');
  assert.equal(lead.photosAvailable, true);
  assert.equal(lead.pricingInterest, true);
  assert.equal(lead.qualifiedLead, true);
  assert.equal(lead.leadPriority, 'HIGH');
  assert.equal(lead.leadPriorityKnown, true);
  assert.equal(lead.issueSummary, rawLead().issue_summary);
});

test('keeps a corrected value exactly as extracted', () => {
  // The caller corrected themselves mid-call; Vapi's output holds the final
  // value and the router must not second-guess it.
  const lead = normalizeLead(rawLead({ door_count: 3, service_location: 'Flowery Branch' }));
  assert.equal(lead.doorCount, 3);
  assert.equal(lead.serviceLocation, 'Flowery Branch');
});

test('reads string booleans and numeric strings without inventing values', () => {
  const lead = normalizeLead(rawLead({
    photos_available: 'true',
    pricing_interest: 'no',
    qualified_lead: 'Yes',
    door_count: '2',
  }));
  assert.equal(lead.photosAvailable, true);
  assert.equal(lead.pricingInterest, false);
  assert.equal(lead.qualifiedLead, true);
  assert.equal(lead.doorCount, 2);
});

test('leaves unreadable or absent fields null rather than guessing', () => {
  const lead = normalizeLead(rawLead({
    caller_name: '   ',
    door_count: 'a few',
    photos_available: 'maybe',
    qualified_lead: undefined,
    lead_priority: undefined,
  }));
  assert.equal(lead.callerName, null);
  assert.equal(lead.doorCount, null);
  assert.equal(lead.photosAvailable, null);
  assert.equal(lead.qualifiedLead, null);
  assert.equal(lead.leadPriority, null);
  assert.equal(lead.leadPriorityKnown, false);
});

test('normalizes priority casing and flags unknown priorities', () => {
  assert.equal(normalizeLead(rawLead({ lead_priority: 'medium' })).leadPriority, 'MEDIUM');
  const odd = normalizeLead(rawLead({ lead_priority: 'urgent-ish' }));
  assert.equal(odd.leadPriority, 'URGENT-ISH');
  assert.equal(odd.leadPriorityKnown, false);
});

test('returns null for non-object input', () => {
  for (const input of [null, undefined, 'lead', 7, []]) {
    assert.equal(normalizeLead(input), null);
  }
});
