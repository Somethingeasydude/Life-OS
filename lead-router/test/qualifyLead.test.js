'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { qualifyLead } = require('../lib/qualifyLead');

const lead = (overrides) => ({ qualifiedLead: true, leadPriority: 'HIGH', ...overrides });

test('notifies on a qualified lead', () => {
  assert.deepEqual(qualifyLead(lead()), { action: 'notify', reason: 'qualified' });
  assert.equal(qualifyLead(lead({ leadPriority: 'LOW' })).action, 'notify');
});

test('skips an explicitly unqualified lead', () => {
  assert.deepEqual(qualifyLead(lead({ qualifiedLead: false })), {
    action: 'skip',
    reason: 'not_qualified',
  });
});

test('skips a NON-LEAD priority even when the qualified flag says true', () => {
  assert.deepEqual(qualifyLead(lead({ leadPriority: 'NON-LEAD' })), {
    action: 'skip',
    reason: 'priority_non_lead',
  });
});

test('flags for review when qualification is unreadable but the lead is actionable', () => {
  assert.deepEqual(qualifyLead(lead({ qualifiedLead: null, callbackNumber: '470-716-0158' })), {
    action: 'review',
    reason: 'qualification_missing',
  });

  assert.equal(
    qualifyLead(lead({ qualifiedLead: null, callerName: 'Billy Bob', doorCondition: 'sticking' })).action,
    'review',
  );
});

test('skips an unreadable lead with nothing to act on', () => {
  assert.deepEqual(qualifyLead(lead({ qualifiedLead: null })), {
    action: 'skip',
    reason: 'qualification_missing_and_no_actionable_data',
  });

  // A name on its own is not something anyone can follow up.
  assert.equal(qualifyLead(lead({ qualifiedLead: null, callerName: 'Billy Bob' })).action, 'skip');
});

test('skips when there is no lead data at all', () => {
  assert.deepEqual(qualifyLead(null), { action: 'skip', reason: 'no_lead_data' });
});
