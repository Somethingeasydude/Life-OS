'use strict';

const fs = require('fs');
const path = require('path');

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

function loadFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8'));
}

function qualifiedEvent(overrides = {}) {
  const fixture = loadFixture('end-of-call-report.qualified.json');
  const lead = fixture.message.artifact.structuredOutputs['3f8b2c47-1d59-4e6a-9b07-5c2a8d1f4e63'];
  Object.assign(lead.result, overrides);
  return fixture;
}

// Real Vapi behaviour: end-of-call-report frequently arrives before structured
// output extraction has finished, so the artifact carries no outputs at all.
function eventWithoutStructuredOutputs() {
  const fixture = loadFixture('end-of-call-report.qualified.json');
  delete fixture.message.artifact.structuredOutputs;
  return fixture;
}

function withEnv(values, fn) {
  const previous = {};
  for (const [key, value] of Object.entries(values)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  const restore = () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.finally(restore);
    }
    restore();
    return result;
  } catch (error) {
    restore();
    throw error;
  }
}

const BASE_ENV = {
  VAPI_WEBHOOK_SECRET: 'test-secret',
  RESEND_API_KEY: 'test-resend-key',
  LEAD_FROM_EMAIL: 'RAM Lead Router <leads@ram-strategicsystems.com>',
  LEAD_NOTIFICATION_EMAIL: 'contact@ram-strategicsystems.com',
  LOG_LEVEL: 'error',
  STRUCTURED_OUTPUT_POLL_DELAYS_MS: 'off',
  VAPI_API_KEY: undefined,
  DOOR4LIFE_ASSISTANT_IDS: undefined,
  DOOR4LIFE_ENABLED: undefined,
  DOOR4LIFE_NOTIFICATION_RECIPIENTS: undefined,
};

module.exports = { loadFixture, qualifiedEvent, eventWithoutStructuredOutputs, withEnv, BASE_ENV };
