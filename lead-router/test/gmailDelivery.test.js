'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

const { deliverGmail, SCOPE, buildMime, encodeHeader, messageId } = require('../lib/gmailDelivery');
const { DeliveryError } = require('../lib/deliveryError');
const { door4lifeConfig } = require('../lib/config');
const { withEnv, BASE_ENV } = require('./helpers');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const GMAIL_ENV = {
  ...BASE_ENV,
  RESEND_API_KEY: undefined,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: 'lead-router@ram-demo.iam.gserviceaccount.com',
  GOOGLE_PRIVATE_KEY: privateKey,
  GMAIL_IMPERSONATED_USER: 'contact@ram-strategicsystems.com',
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
        : { ok: false, status: 401, text: async () => 'unauthorized_client' };
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
      now: () => 1700000000000,
      ...overrides,
    }),
  );

test('requests only the gmail.send scope', async () => {
  const calls = [];
  await send({}, googleFetch(calls));

  const body = new URLSearchParams(calls[0].options.body);
  const claims = JSON.parse(Buffer.from(body.get('assertion').split('.')[1], 'base64url').toString());

  assert.equal(claims.scope, 'https://www.googleapis.com/auth/gmail.send');
  assert.equal(SCOPE, 'https://www.googleapis.com/auth/gmail.send');
  assert.doesNotMatch(claims.scope, /readonly|metadata|modify|mail\.google\.com/);
});

test('signs a valid RS256 assertion that impersonates the mailbox', async () => {
  const calls = [];
  await send({}, googleFetch(calls));

  const assertion = new URLSearchParams(calls[0].options.body).get('assertion');
  const [header, payload, signature] = assertion.split('.');

  assert.deepEqual(JSON.parse(Buffer.from(header, 'base64url').toString()), {
    alg: 'RS256',
    typ: 'JWT',
  });

  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
  assert.equal(claims.iss, 'lead-router@ram-demo.iam.gserviceaccount.com');
  assert.equal(claims.sub, 'contact@ram-strategicsystems.com', 'impersonation subject');
  assert.equal(claims.aud, 'https://oauth2.googleapis.com/token');
  assert.equal(claims.iat, 1700000000);
  assert.equal(claims.exp, 1700000000 + 3600);

  const verified = crypto
    .createVerify('RSA-SHA256')
    .update(`${header}.${payload}`)
    .verify(publicKey, Buffer.from(signature, 'base64url'));
  assert.ok(verified, 'signature verifies against the service account public key');
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

  const parts = mime.split(/--ram-[a-f0-9]+/);
  assert.ok(
    parts.some((p) => p.includes(Buffer.from(NOTIFICATION.text).toString('base64').slice(0, 20))),
    'text body present as base64',
  );
});

test('sends only to configured recipients, never to payload-supplied ones', async () => {
  const calls = [];
  await send({ LEAD_NOTIFICATION_EMAIL: 'contact@ram-strategicsystems.com,ops@example.com' }, googleFetch(calls));
  const mime = Buffer.from(JSON.parse(calls[1].options.body).raw, 'base64url').toString('utf8');
  assert.match(mime, /^To: contact@ram-strategicsystems\.com, ops@example\.com$/m);
});

test('refuses to send without the service account configured', async () => {
  for (const missing of ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GMAIL_IMPERSONATED_USER']) {
    await assert.rejects(
      () => send({ [missing]: undefined }, googleFetch([])),
      (error) => error instanceof DeliveryError && new RegExp(missing).test(error.message),
      missing,
    );
  }
});

test('rejects an invalid impersonation address', async () => {
  await assert.rejects(
    () => send({ GMAIL_IMPERSONATED_USER: 'not-an-address' }, googleFetch([])),
    (error) => error instanceof DeliveryError && /GMAIL_IMPERSONATED_USER/.test(error.message),
  );
});

test('accepts a private key stored with escaped newlines', async () => {
  const calls = [];
  await send({ GOOGLE_PRIVATE_KEY: privateKey.replace(/\n/g, '\\n') }, googleFetch(calls));
  assert.equal(calls.length, 2, 'escaped key still signs and sends');
});

test('surfaces a rejected assertion without leaking the key', async () => {
  await assert.rejects(
    () => send({}, googleFetch([], { tokenOk: false })),
    (error) => {
      assert.ok(error instanceof DeliveryError);
      assert.equal(error.status, 401);
      assert.doesNotMatch(error.message, /PRIVATE KEY/);
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
