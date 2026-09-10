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
  // Default adapter is gmail; with no service account configured it throws.
  const res = await call({ method: 'POST', headers: AUTH, body: qualifiedEvent() });
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'internal_error' });
});

test('a complete qualified call runs the default adapter and returns 200 notified', async () => {
  // DRY_RUN exercises the real default (gmail) path end to end with no
  // credentials and no network.
  const res = await call({ method: 'POST', headers: AUTH, body: qualifiedEvent() }, { DRY_RUN: '1' });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'notified');
  assert.equal(res.body.channel, 'gmail');
  assert.equal(res.body.callId, 'b7c1f0a2-9d3e-4f11-8a55-2c9e4d7b6a10');
});

test('a status-update/ended call is captured but not delivered', async () => {
  const event = qualifiedEvent();
  event.message.type = 'status-update';
  event.message.status = 'ended';

  const res = await call({ method: 'POST', headers: AUTH, body: event }, { DRY_RUN: '1' });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'captured');
  assert.equal(res.body.delivered, false);
});
