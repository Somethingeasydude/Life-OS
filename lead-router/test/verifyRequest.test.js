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

test('accepts the Bearer scheme in any casing', () => {
  for (const scheme of ['Bearer', 'bearer', 'BEARER']) {
    assert.equal(check({ method: 'POST', headers: { [`authorization`]: `${scheme} test-secret` } }).ok, true, scheme);
  }
});

test('rejects a bare token with no Bearer prefix', () => {
  const result = check({ method: 'POST', headers: { authorization: 'test-secret' } });
  assert.equal(result.status, 401);
  assert.equal(result.reason, 'malformed_credential');
});

test('rejects other authorization schemes carrying the right secret', () => {
  for (const header of ['Basic test-secret', 'Token test-secret', 'Bearer=test-secret']) {
    const result = check({ method: 'POST', headers: { authorization: header } });
    assert.equal(result.status, 401, header);
    assert.equal(result.reason, 'malformed_credential', header);
  }
});

test('rejects a Bearer prefix with no token', () => {
  for (const header of ['Bearer', 'Bearer ', 'Bearer    ']) {
    const result = check({ method: 'POST', headers: { authorization: header } });
    assert.equal(result.status, 401, JSON.stringify(header));
  }
});

test('rejects a duplicated Authorization header', () => {
  const result = check({
    method: 'POST',
    headers: { authorization: ['Bearer test-secret', 'Bearer test-secret'] },
  });
  assert.equal(result.status, 401);
  assert.equal(result.reason, 'missing_credential');
});

test('rejects a wrong or absent credential with 401', () => {
  const wrong = check({ method: 'POST', headers: { authorization: 'Bearer nope' } });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.reason, 'invalid_credential');

  const missing = check({ method: 'POST', headers: {} });
  assert.equal(missing.status, 401);
  assert.equal(missing.reason, 'missing_credential');

  const blank = check({ method: 'POST', headers: { authorization: '   ' } });
  assert.equal(blank.status, 401);
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

test('ignores the secret presented in any other header', () => {
  for (const header of ['x-vapi-secret', 'x-api-key', 'x-vapi-signature']) {
    const result = check({ method: 'POST', headers: { [header]: 'test-secret' } });
    assert.equal(result.status, 401, header);
    assert.equal(result.reason, 'missing_credential', header);
  }
});
