'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { verifyRequest } = require('../lib/verifyRequest');
const { withEnv, BASE_ENV } = require('./helpers');

const check = (options, env = {}) =>
  withEnv({ ...BASE_ENV, ...env }, () => verifyRequest(options));

test('accepts the Vapi Bearer Token credential', () => {
  const result = check({ method: 'POST', headers: { authorization: 'Bearer test-secret' } });
  assert.deepEqual(result, { ok: true });
});

test('accepts a bare token without the Bearer prefix', () => {
  assert.equal(check({ method: 'POST', headers: { authorization: 'test-secret' } }).ok, true);
});

test('rejects a wrong or absent credential with 401', () => {
  const wrong = check({ method: 'POST', headers: { authorization: 'Bearer nope' } });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.reason, 'invalid_credential');

  const missing = check({ method: 'POST', headers: {} });
  assert.equal(missing.status, 401);
  assert.equal(missing.reason, 'missing_credential');

  const blank = check({ method: 'POST', headers: { authorization: '   ' } });
  assert.equal(blank.reason, 'missing_credential');
});

test('rejects a token that is merely a prefix of the secret', () => {
  assert.equal(check({ method: 'POST', headers: { authorization: 'Bearer test' } }).status, 401);
  assert.equal(
    check({ method: 'POST', headers: { authorization: 'Bearer test-secret-extra' } }).status,
    401,
  );
});

test('rejects unsupported HTTP methods before looking at credentials', () => {
  for (const method of ['GET', 'PUT', 'DELETE', 'PATCH', 'HEAD']) {
    const result = check({ method, headers: { authorization: 'Bearer test-secret' } });
    assert.equal(result.status, 405, method);
    assert.equal(result.reason, 'method_not_allowed', method);
  }
});

test('fails closed when no secret is configured', () => {
  const result = check(
    { method: 'POST', headers: { authorization: 'Bearer anything' } },
    { VAPI_WEBHOOK_SECRET: undefined },
  );
  assert.equal(result.status, 500);
  assert.equal(result.reason, 'webhook_secret_not_configured');
});

test('honours a custom credential header name', () => {
  const env = { VAPI_WEBHOOK_SECRET_HEADER: 'x-vapi-secret' };
  assert.equal(check({ method: 'POST', headers: { 'x-vapi-secret': 'test-secret' } }, env).ok, true);
  // The default header is no longer trusted once a custom one is configured.
  assert.equal(
    check({ method: 'POST', headers: { authorization: 'Bearer test-secret' } }, env).status,
    401,
  );
});
