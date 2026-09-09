'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const handler = require('../api/vapi');
const { qualifiedEvent, withEnv, BASE_ENV } = require('./helpers');

function fakeRes() {
  const res = {
    statusCode: null,
    body: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

const AUTH = { authorization: 'Bearer test-secret' };

async function call(req, env = {}) {
  const res = fakeRes();
  await withEnv({ ...BASE_ENV, ...env }, () => handler(req, res));
  return res;
}

test('rejects non-POST methods with 405 and an Allow header', async () => {
  const res = await call({ method: 'GET', headers: AUTH, body: {} });
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, 'POST');
  assert.equal(res.body.error, 'method_not_allowed');
});

test('rejects an unauthenticated POST with 401', async () => {
  const res = await call({ method: 'POST', headers: {}, body: qualifiedEvent() });
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'missing_credential');
});

test('rejects a body that is not JSON with 400', async () => {
  const res = await call({ method: 'POST', headers: AUTH, body: '{"message":' });
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.reason, 'body_not_json');
});

test('parses a raw string body', async () => {
  const res = await call({
    method: 'POST',
    headers: AUTH,
    body: JSON.stringify({ message: { type: 'transcript' } }),
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'ignored');
});

test('parses a Buffer body', async () => {
  const res = await call({
    method: 'POST',
    headers: AUTH,
    body: Buffer.from(JSON.stringify({ message: { type: 'transcript' } })),
  });
  assert.equal(res.statusCode, 200);
});

test('an empty body is a 400, not a crash', async () => {
  const res = await call({ method: 'POST', headers: AUTH, body: undefined });
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'invalid_payload');
});

test('a delivery failure answers 500 without leaking internals', async () => {
  const res = await call(
    { method: 'POST', headers: AUTH, body: qualifiedEvent() },
    { RESEND_API_KEY: undefined },
  );
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'internal_error' });
});

test('a complete qualified call returns 200 notified', async () => {
  const sent = [];
  const fetchImpl = async (url, options) => {
    sent.push({ url, options });
    return { ok: true, status: 200, json: async () => ({ id: 'resend-id' }) };
  };

  const res = await withEnv(BASE_ENV, async () => {
    const response = fakeRes();
    // The endpoint owns its own dependencies, so drive delivery through a stub
    // global fetch — this is the closest thing to an end-to-end run.
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchImpl;
    try {
      await handler({ method: 'POST', headers: AUTH, body: qualifiedEvent() }, response);
    } finally {
      globalThis.fetch = originalFetch;
    }
    return response;
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'notified');
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, 'https://api.resend.com/emails');
  assert.equal(
    sent[0].options.headers['Idempotency-Key'],
    'door4life-lead-b7c1f0a2-9d3e-4f11-8a55-2c9e4d7b6a10',
  );
});
