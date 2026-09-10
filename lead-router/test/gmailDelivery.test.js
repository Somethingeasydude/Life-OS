'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { deliverGmail, SCOPE, buildMime, encodeHeader, messageId } = require('../lib/gmailDelivery');
const { DeliveryError } = require('../lib/deliveryError');
const { door4lifeConfig } = require('../lib/config');
const { withEnv, BASE_ENV } = require('./helpers');

const GMAIL_ENV = {
  ...BASE_ENV,
  RESEND_API_KEY: undefined,
  GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'test-client-secret',
  GOOGLE_REFRESH_TOKEN: 'test-refresh-token',
  GMAIL_SENDER: 'contact@ram-strategicsystems.com',
};

const NOTIFICATION = {
  subject: '[HIGH] New Door4Life Quote Lead — Billy Bob',
  text: 'NEW DOOR4LIFE LEAD\n\nPriority: HIGH',
  html: '<p>NEW DOOR4LIFE LEAD</p>',
};

function googleFetch(recorded, { tokenOk = true, sendOk = true } = {}) {
  return async (url, options) => {
    recorded.push({ url, options });
    if (url.includes('oauth2.googleapis.com')) {
      return tokenOk
        ? { ok: true, status: 200, json: async () => ({ access_token: 'ya29.test-token' }) }
        : { ok: false, status: 400, text: async () => '{"error":"invalid_grant"}' };
    }
    return sendOk
      ? { ok: true, status: 200, json: async () => ({ id: 'gmail-msg-id' }) }
      : { ok: false, status: 403, text: async () => 'Request had insufficient authentication scopes' };
  };
}

const send = (env = {}, fetchImpl, overrides = {}) =>
  withEnv({ ...GMAIL_ENV, ...env }, () =>
    deliverGmail({
      notification: NOTIFICATION,
      client: door4lifeConfig(),
      idempotencyKey: 'door4life-lead-call-123',
      fetchImpl,
      ...overrides,
    }),
  );

test('exchanges the refresh token for an access token', async () => {
  const calls = [];
  await send({}, googleFetch(calls));

  assert.equal(calls[0].url, 'https://oauth2.googleapis.com/token');
  assert.equal(calls[0].options.method, 'POST');

  const body = new URLSearchParams(calls[0].options.body);
  assert.equal(body.get('grant_type'), 'refresh_token');
  assert.equal(body.get('client_id'), 'test-client-id.apps.googleusercontent.com');
  assert.equal(body.get('client_secret'), 'test-client-secret');
  assert.equal(body.get('refresh_token'), 'test-refresh-token');
});

test('the adapter is send-only — it never asks for a read scope', () => {
  assert.equal(SCOPE, 'https://www.googleapis.com/auth/gmail.send');
  assert.doesNotMatch(SCOPE, /readonly|metadata|modify|mail\.google\.com/);
});

test('sends the message to Gmail with the bearer token', async () => {
  const calls = [];
  const result = await send({}, googleFetch(calls));

  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send');
  assert.equal(calls[1].options.headers.Authorization, 'Bearer ya29.test-token');

  const mime = Buffer.from(JSON.parse(calls[1].options.body).raw, 'base64url').toString('utf8');
  assert.match(mime, /^From: contact@ram-strategicsystems\.com$/m);
  assert.match(mime, /^To: contact@ram-strategicsystems\.com$/m);
  assert.match(mime, /^Message-ID: <door4life-lead-call-123@ram-strategicsystems\.com>$/m);

  assert.equal(result.channel, 'gmail');
  assert.equal(result.messageId, '<door4life-lead-call-123@ram-strategicsystems.com>');
  assert.equal(result.gmailId, 'gmail-msg-id');
});

test('derives a deterministic Message-ID from the idempotency key', () => {
  const a = messageId('door4life-lead-abc', 'contact@ram-strategicsystems.com');
  const b = messageId('door4life-lead-abc', 'contact@ram-strategicsystems.com');
  assert.equal(a, b);
  assert.equal(a, '<door4life-lead-abc@ram-strategicsystems.com>');
  assert.notEqual(a, messageId('door4life-lead-xyz', 'contact@ram-strategicsystems.com'));
});

test('RFC 2047-encodes non-ASCII subjects so the em dash survives', () => {
  const mime = buildMime({
    from: 'contact@ram-strategicsystems.com',
    to: ['contact@ram-strategicsystems.com'],
    notification: NOTIFICATION,
    id: '<x@y.com>',
  });

  assert.match(mime, /^Subject: =\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=$/m);
  const encoded = mime.match(/^Subject: =\?UTF-8\?B\?([A-Za-z0-9+/=]+)\?=$/m)[1];
  assert.equal(Buffer.from(encoded, 'base64').toString('utf8'), NOTIFICATION.subject);

  assert.equal(encodeHeader('plain ascii subject'), 'plain ascii subject');
});

test('carries both text and html parts', () => {
  const mime = buildMime({
    from: 'contact@ram-strategicsystems.com',
    to: ['contact@ram-strategicsystems.com'],
    notification: NOTIFICATION,
    id: '<x@y.com>',
  });

  assert.match(mime, /Content-Type: multipart\/alternative; boundary="ram-[a-f0-9]+"/);
  assert.match(mime, /Content-Type: text\/plain; charset="UTF-8"/);
  assert.match(mime, /Content-Type: text\/html; charset="UTF-8"/);
  assert.ok(
    mime.includes(Buffer.from(NOTIFICATION.text).toString('base64').slice(0, 20)),
    'text body present as base64',
  );
});

test('sends only to configured recipients, never to payload-supplied ones', async () => {
  const calls = [];
  await send({ LEAD_NOTIFICATION_EMAIL: 'contact@ram-strategicsystems.com,ops@example.com' }, googleFetch(calls));
  const mime = Buffer.from(JSON.parse(calls[1].options.body).raw, 'base64url').toString('utf8');
  assert.match(mime, /^To: contact@ram-strategicsystems\.com, ops@example\.com$/m);
});

test('refuses to send when any OAuth credential is missing', async () => {
  for (const missing of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']) {
    await assert.rejects(
      () => send({ [missing]: undefined }, googleFetch([])),
      (error) => error instanceof DeliveryError && new RegExp(missing).test(error.message),
      missing,
    );
  }
});

test('rejects a missing or invalid sender address', async () => {
  for (const value of [undefined, 'not-an-address']) {
    await assert.rejects(
      () => send({ GMAIL_SENDER: value }, googleFetch([])),
      (error) => error instanceof DeliveryError && /GMAIL_SENDER/.test(error.message),
    );
  }
});

test('surfaces a revoked refresh token without leaking the secret', async () => {
  await assert.rejects(
    () => send({}, googleFetch([], { tokenOk: false })),
    (error) => {
      assert.ok(error instanceof DeliveryError);
      assert.equal(error.status, 400);
      assert.match(String(error.cause), /invalid_grant/);
      assert.doesNotMatch(error.message, /test-client-secret|test-refresh-token/);
      return true;
    },
  );
});

test('surfaces a scope failure from the send call', async () => {
  await assert.rejects(
    () => send({}, googleFetch([], { sendOk: false })),
    (error) => error instanceof DeliveryError && error.status === 403,
  );
});

test('dry run prints without contacting Google', async () => {
  const calls = [];
  const result = await send({ DRY_RUN: '1' }, googleFetch(calls));
  assert.equal(result.dryRun, true);
  assert.equal(result.channel, 'gmail');
  assert.equal(calls.length, 0);
});
