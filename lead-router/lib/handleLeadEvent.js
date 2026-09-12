'use strict';

const crypto = require('crypto');

const { logger, redactPhone } = require('./logger');
const { resolveClient } = require('./config');
const {
  parseVapiEvent,
  structuredOutputNames,
  isCallCompleteEvent,
  END_OF_CALL_REPORT,
} = require('./vapiEvent');
const { resolveStructuredOutput } = require('./resolveStructuredOutput');
const { normalizeLead } = require('./normalizeLead');
const { qualifyLead } = require('./qualifyLead');
const { formatNotification } = require('./formatNotification');
const { deliver, adapterName } = require('./delivery');

function idempotencyKey(client, event, notification) {
  if (event.callId) return `${client.clientId}-lead-${event.callId}`;
  // No call id (shouldn't happen on end-of-call-report): fall back to a content
  // hash so a retried delivery of the same lead still dedupes.
  const hash = crypto
    .createHash('sha256')
    .update(`${notification.subject}\n${notification.text}`, 'utf8')
    .digest('hex')
    .slice(0, 32);
  return `${client.clientId}-lead-${hash}`;
}

/**
 * The router pipeline, kept free of any HTTP framework so it can be tested and
 * reused: parse -> resolve client -> get structured output -> normalize ->
 * qualify -> format -> deliver.
 *
 * Returns { status, body } for the transport layer to send. Delivery failures
 * throw, so the endpoint can answer 5xx and the failure shows up in Vapi's
 * webhook log instead of being silently swallowed.
 */
async function handleLeadEvent(rawBody, deps = {}) {
  const send = deps.deliver || deliver;
  const resolveOutput = deps.resolveStructuredOutput || resolveStructuredOutput;

  const parsed = parseVapiEvent(rawBody);
  if (!parsed.ok) {
    logger.warn('event_rejected', { reason: parsed.reason });
    return { status: 400, body: { error: 'invalid_payload', reason: parsed.reason } };
  }

  const { event } = parsed;
  logger.info('event_received', {
    type: event.type,
    status: event.status,
    callId: event.callId,
    assistantId: event.assistantId,
    endedReason: event.endedReason,
  });

  if (!isCallCompleteEvent(event)) {
    // One Server URL receives every message type for the assistant; everything
    // that isn't a completed call is acknowledged and ignored.
    return { status: 200, body: { status: 'ignored', reason: 'event_type_not_handled' } };
  }

  const client = resolveClient({
    assistantId: event.assistantId,
    structuredOutputNames: structuredOutputNames(event.structuredOutputs),
  });

  if (!client) {
    logger.info('client_not_resolved', { callId: event.callId, assistantId: event.assistantId });
    return { status: 200, body: { status: 'ignored', reason: 'client_not_resolved' } };
  }

  logger.info('client_resolved', { callId: event.callId, clientId: client.clientId });

  const output = await resolveOutput({
    event,
    client,
    sleep: deps.sleep,
    fetchImpl: deps.fetchImpl,
  });

  if (!output.result) {
    logger.warn('structured_output_missing', {
      callId: event.callId,
      clientId: client.clientId,
      structuredOutputName: client.structuredOutputName,
      pollAttempts: output.attempts,
    });
    return {
      status: 200,
      body: { status: 'no_structured_output', callId: event.callId },
    };
  }

  logger.info('structured_output_found', {
    callId: event.callId,
    clientId: client.clientId,
    source: output.source,
    pollAttempts: output.attempts,
  });

  const lead = normalizeLead(output.result);
  const qualification = qualifyLead(lead);

  logger.info('lead_qualified', {
    callId: event.callId,
    clientId: client.clientId,
    action: qualification.action,
    reason: qualification.reason,
    priority: lead ? lead.leadPriority : null,
    callbackNumber: lead ? redactPhone(lead.callbackNumber) : null,
  });

  if (qualification.action === 'skip') {
    if (qualification.reason === 'qualification_missing_and_no_actionable_data') {
      // Not a judgement the AI made — the extraction came back with nothing
      // usable. Surfaced loudly so it can't pass for a routine non-lead.
      logger.warn('lead_dropped_unusable', {
        callId: event.callId,
        clientId: client.clientId,
        source: output.source,
      });
    }
    return {
      status: 200,
      body: { status: 'skipped', reason: qualification.reason, callId: event.callId },
    };
  }

  const notification = formatNotification({ lead, client, event, qualification });
  const key = idempotencyKey(client, event, notification);

  // Both completion events resolve a lead, but only the end-of-call report
  // sends it. One notification per call, by construction — no dedupe store and
  // no mailbox read scope needed. status-update/ended still logs the captured
  // lead, so a report that never arrives is visible here rather than silent.
  if (event.type !== END_OF_CALL_REPORT) {
    logger.info('lead_captured_not_delivered', {
      callId: event.callId,
      clientId: client.clientId,
      eventType: event.type,
      reason: 'awaiting_end_of_call_report',
      idempotencyKey: key,
      subject: notification.subject,
    });
    return {
      status: 200,
      body: { status: 'captured', delivered: false, callId: event.callId },
    };
  }

  logger.info('delivery_adapter_selected', { callId: event.callId, adapter: adapterName() });

  const delivery = await send({
    notification,
    client,
    idempotencyKey: key,
    fetchImpl: deps.fetchImpl,
  });

  return {
    status: 200,
    body: {
      status: 'notified',
      callId: event.callId,
      clientId: client.clientId,
      action: qualification.action,
      channel: delivery.channel,
      // Echoed back so Vapi's call log carries the provider message id. Vapi
      // retains call records far longer than Vercel keeps runtime logs, so
      // this is the durable half of the delivery trail.
      messageId: delivery.messageId || null,
    },
  };
}

module.exports = { handleLeadEvent, idempotencyKey };
