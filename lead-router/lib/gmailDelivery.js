'use strict';

const crypto = require('crypto');

const { logger, redactEmail } = require('./logger');
const { EMAIL_RE } = require('./config');
const { DeliveryError } = require('./deliveryError');

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const SEND_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

// The only scope this adapter needs. Sending is all it does: it never reads the
// mailbox, so no read scope is requested. Duplicate protection lives upstream —
// only end-of-call-report delivers — which is what keeps this grant this small.
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

const REQUEST_TIMEOUT_MS = 10000;

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function sender() {
  const user = (process.env.GMAIL_SENDER || '').trim();
  return EMAIL_RE.test(user) ? user : null;
}

/**
 * Trade the stored refresh token for a short-lived access token.
 *
 * The refresh token belongs to the Workspace account that granted consent, and
 * the OAuth app is Internal — so it carries no 7-day expiry and needs no Google
 * verification. Service-account keys were the first choice; org policy
 * `iam.disableServiceAccountKeyCreation` blocks creating them, and this is the
 * supported alternative that keeps the same single scope.
 */
async function accessToken({ doFetch }) {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const refreshToken = (process.env.GOOGLE_REFRESH_TOKEN || '').trim();

  if (!clientId) throw new DeliveryError('GOOGLE_CLIENT_ID is not configured');
  if (!clientSecret) throw new DeliveryError('GOOGLE_CLIENT_SECRET is not configured');
  if (!refreshToken) throw new DeliveryError('GOOGLE_REFRESH_TOKEN is not configured');

  let response;
  try {
    response = await doFetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }).toString(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new DeliveryError(`google token request failed: ${error.message}`, { cause: error });
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    // invalid_grant here means the refresh token was revoked, or consent was
    // re-granted elsewhere. Re-run scripts/mint-gmail-token.js.
    throw new DeliveryError(`google rejected the refresh token (${response.status})`, {
      status: response.status,
      cause: detail.slice(0, 300),
    });
  }

  const body = await response.json().catch(() => ({}));
  if (!body.access_token) throw new DeliveryError('google returned no access token');
  return body.access_token;
}

// Non-ASCII in a header (the em dash in every subject, accented caller names)
// has to be encoded or it arrives mangled.
function encodeHeader(value) {
  const text = String(value);
  if (/^[\x20-\x7E]*$/.test(text)) return text;
  return `=?UTF-8?B?${Buffer.from(text, 'utf8').toString('base64')}?=`;
}

function base64Body(value) {
  return (Buffer.from(String(value), 'utf8').toString('base64').match(/.{1,76}/g) || []).join('\r\n');
}

/**
 * Deterministic per call, so the same lead always carries the same id. Kept for
 * traceability — a Message-ID ties a mailbox item back to a Vapi call — and
 * because Gmail tends to collapse identical ids if one ever is sent twice.
 */
function messageId(idempotencyKey, sender) {
  const domain = sender.split('@')[1];
  return `<${idempotencyKey}@${domain}>`;
}

function buildMime({ from, to, notification, id }) {
  const boundary = `ram-${crypto.randomBytes(12).toString('hex')}`;
  return [
    `From: ${from}`,
    `To: ${to.join(', ')}`,
    `Subject: ${encodeHeader(notification.subject)}`,
    `Message-ID: ${id}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body(notification.text),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body(notification.html),
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

/**
 * Gmail API delivery adapter. Same shape as every other adapter: take a
 * formatted notification plus routing config, return a result or throw
 * DeliveryError.
 *
 * Recipients come from client config only — never from the inbound payload — so
 * a crafted webhook cannot turn this into an open relay.
 */
async function deliverGmail({ notification, client, idempotencyKey, fetchImpl } = {}) {
  const from = sender();
  const to = (client.notificationRecipients || []).filter((address) => EMAIL_RE.test(address));
  const doFetch = fetchImpl || globalThis.fetch;

  if (process.env.DRY_RUN === '1') {
    logger.warn('notification_dry_run', {
      clientId: client.clientId,
      channel: 'gmail',
      subject: notification.subject,
      recipients: to.map(redactEmail),
      idempotencyKey,
    });
    console.log(`\n--- DRY RUN ---\nTo: ${to.join(', ')}\nSubject: ${notification.subject}\n\n${notification.text}\n`);
    return { channel: 'gmail', messageId: null, recipientCount: to.length, dryRun: true };
  }

  if (!from) throw new DeliveryError('GMAIL_SENDER is missing or invalid');
  if (!to.length) throw new DeliveryError('no valid notification recipients configured');

  const token = await accessToken({ doFetch });
  const id = messageId(idempotencyKey, from);
  const raw = base64url(buildMime({ from, to, notification, id }));

  let response;
  try {
    response = await doFetch(SEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new DeliveryError(`gmail send failed: ${error.message}`, { cause: error });
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new DeliveryError(`gmail rejected the send (${response.status})`, {
      status: response.status,
      cause: detail.slice(0, 300),
    });
  }

  const body = await response.json().catch(() => ({}));
  logger.info('notification_delivered', {
    channel: 'gmail',
    clientId: client.clientId,
    gmailId: body.id || null,
    messageId: id,
    recipients: to.map(redactEmail),
  });

  return { channel: 'gmail', messageId: id, gmailId: body.id || null, recipientCount: to.length };
}

module.exports = { deliverGmail, SCOPE, buildMime, encodeHeader, messageId };
