'use strict';

const { logger, redactEmail } = require('./logger');
const { EMAIL_RE } = require('./config');
const { DeliveryError } = require('./deliveryError');

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const REQUEST_TIMEOUT_MS = 10000;

function senderAddress() {
  const from = (process.env.LEAD_FROM_EMAIL || '').trim();
  if (!from) return null;
  // Accept either "leads@domain.com" or "RAM Lead Router <leads@domain.com>".
  const bare = from.includes('<') ? (from.match(/<([^>]+)>/) || [])[1] : from;
  if (!bare || !EMAIL_RE.test(bare.trim())) return null;
  if (/[\r\n]/.test(from)) return null;
  return from;
}

/**
 * Resend delivery adapter — retained as a working alternative, not the default.
 * Live delivery runs through gmailDelivery; select this one with
 * DELIVERY_ADAPTER=resend.
 *
 * Recipients come from client config only — never from the inbound payload — so
 * this can't be turned into an open relay by a crafted webhook.
 *
 * Duplicate defense: Resend deduplicates by Idempotency-Key for 24h, so a Vapi
 * retry for the same call cannot produce a second email. That keeps V0 free of
 * a datastore purely for dedupe.
 */
async function deliverEmail({ notification, client, idempotencyKey, fetchImpl } = {}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = senderAddress();
  const to = (client.notificationRecipients || []).filter((address) => EMAIL_RE.test(address));
  const doFetch = fetchImpl || globalThis.fetch;

  // Escape hatch: exercise the full pipeline with no email provider and no
  // spend. Logged at warn so it can never quietly swallow real leads.
  if (process.env.DRY_RUN === '1') {
    logger.warn('notification_dry_run', {
      clientId: client.clientId,
      subject: notification.subject,
      recipients: to.map(redactEmail),
      idempotencyKey,
    });
    console.log(`\n--- DRY RUN ---\nTo: ${to.join(', ')}\nSubject: ${notification.subject}\n\n${notification.text}\n`);
    return { channel: 'email', messageId: null, recipientCount: to.length, dryRun: true };
  }

  if (!apiKey) throw new DeliveryError('RESEND_API_KEY is not configured');
  if (!from) throw new DeliveryError('LEAD_FROM_EMAIL is missing or invalid');
  if (!to.length) throw new DeliveryError('no valid notification recipients configured');

  let response;
  try {
    response = await doFetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from,
        to,
        subject: notification.subject,
        text: notification.text,
        html: notification.html,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new DeliveryError(`email request failed: ${error.message}`, { cause: error });
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new DeliveryError(`email provider rejected the send (${response.status})`, {
      status: response.status,
      cause: detail.slice(0, 300),
    });
  }

  const body = await response.json().catch(() => ({}));
  logger.info('notification_delivered', {
    channel: 'email',
    clientId: client.clientId,
    messageId: body.id || null,
    recipients: to.map(redactEmail),
  });

  return { channel: 'email', messageId: body.id || null, recipientCount: to.length };
}

module.exports = { deliverEmail, DeliveryError, senderAddress };
