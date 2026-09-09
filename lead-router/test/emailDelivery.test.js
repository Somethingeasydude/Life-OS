'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { deliverEmail, DeliveryError } = require('../lib/emailDelivery');
const { door4lifeConfig } = require('../lib/config');
const { withEnv, BASE_ENV } = require('./helpers');

const NOTIFICATION = {
  subject: '[HIGH] New Door4Life Quote Lead — Billy Bob',
  text: 'NEW DOOR4LIFE LEAD',
  html: '<p>NEW DOOR4LIFE LEAD</p>',
};

function okFetch(recorded) {
  return async (url, options) => {
    recorded.push({ url, options });
    return { ok: true, status: 200, json: async () => ({ id: 'resend-message-id' }) };
  };
}

const send = (env = {}, fetchImpl, overrides = {}) =>
  withEnv({ ...BASE_ENV, ...env }, () =>
    deliverEmail({
      notification: NOTIFICATION,
      client: door4lifeConfig(),
      idempotencyKey: 'door4life-lead-call-123',
      fetchImpl,
      ...overrides,
    }),
  );

test('posts the lead to Resend with the deterministic idempotency key', async () => {
  const calls = [];
  const result = await send({}, okFetch(calls));

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-resend-key');
  assert.equal(calls[0].options.headers['Idempotency-Key'], 'door4life-lead-call-123');

  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.from, 'RAM Lead Router <leads@ram-strategicsystems.com>');
  assert.deepEqual(body.to, ['contact@ram-strategicsystems.com']);
  assert.equal(body.subject, NOTIFICATION.subject);
  assert.equal(body.text, NOTIFICATION.text);
  assert.equal(body.html, NOTIFICATION.html);

  assert.equal(result.channel, 'email');
  assert.equal(result.messageId, 'resend-message-id');
});

test('sends only to configured recipients', async () => {
  const calls = [];
  await send({ LEAD_NOTIFICATION_EMAIL: 'contact@ram-strategicsystems.com,ops@example.com' }, okFetch(calls));
  assert.deepEqual(JSON.parse(calls[0].options.body).to, [
    'contact@ram-strategicsystems.com',
    'ops@example.com',
  ]);
});

test('drops malformed recipients rather than passing them to the mail API', async () => {
  const calls = [];
  await send(
    { LEAD_NOTIFICATION_EMAIL: 'contact@ram-strategicsystems.com,not-an-email,bad@@example.com' },
    okFetch(calls),
  );
  assert.deepEqual(JSON.parse(calls[0].options.body).to, ['contact@ram-strategicsystems.com']);
});

test('refuses to send when no recipient survives validation', async () => {
  await assert.rejects(
    () => send({ LEAD_NOTIFICATION_EMAIL: 'nonsense' }, okFetch([])),
    (error) => error instanceof DeliveryError && /recipients/.test(error.message),
  );
});

test('requires an API key and a valid sender', async () => {
  await assert.rejects(
    () => send({ RESEND_API_KEY: undefined }, okFetch([])),
    (error) => error instanceof DeliveryError && /RESEND_API_KEY/.test(error.message),
  );

  await assert.rejects(
    () => send({ LEAD_FROM_EMAIL: 'not-an-address' }, okFetch([])),
    (error) => error instanceof DeliveryError && /LEAD_FROM_EMAIL/.test(error.message),
  );

  await assert.rejects(
    () => send({ LEAD_FROM_EMAIL: 'Injected <leads@x.com>\r\nBcc: evil@example.com' }, okFetch([])),
    (error) => error instanceof DeliveryError,
  );
});

test('accepts a bare sender address', async () => {
  const calls = [];
  await send({ LEAD_FROM_EMAIL: 'leads@ram-strategicsystems.com' }, okFetch(calls));
  assert.equal(JSON.parse(calls[0].options.body).from, 'leads@ram-strategicsystems.com');
});

test('surfaces provider rejections without leaking the API key', async () => {
  const fetchImpl = async () => ({
    ok: false,
    status: 422,
    text: async () => 'domain is not verified',
  });

  await assert.rejects(
    () => send({}, fetchImpl),
    (error) => {
      assert.ok(error instanceof DeliveryError);
      assert.equal(error.status, 422);
      assert.doesNotMatch(error.message, /test-resend-key/);
      return true;
    },
  );
});

test('surfaces transport failures as DeliveryError', async () => {
  const fetchImpl = async () => {
    throw new Error('socket hang up');
  };
  await assert.rejects(
    () => send({}, fetchImpl),
    (error) => error instanceof DeliveryError && /socket hang up/.test(error.message),
  );
});
