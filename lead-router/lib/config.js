'use strict';

const DEFAULT_RECIPIENT = 'contact@ram-strategicsystems.com';

// Deliberately strict: recipients only ever come from configuration, never from
// an inbound payload, and anything with a newline is rejected outright so a
// value can't smuggle extra headers into the mail API.
const EMAIL_RE = /^[^\s@,;:<>"'\\]+@[^\s@,;:<>"'\\]+\.[^\s@,;:<>"'\\]+$/;

function envList(name) {
  const raw = process.env[name];
  if (!raw) return [];
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function envBool(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.trim().toLowerCase());
}

function validRecipients(candidates) {
  return candidates.filter((address) => EMAIL_RE.test(address));
}

function door4lifeConfig() {
  const configured = envList('DOOR4LIFE_NOTIFICATION_RECIPIENTS').length
    ? envList('DOOR4LIFE_NOTIFICATION_RECIPIENTS')
    : envList('LEAD_NOTIFICATION_EMAIL');
  const recipients = validRecipients(configured.length ? configured : [DEFAULT_RECIPIENT]);

  return {
    clientId: 'door4life',
    businessName: 'Door4Life',
    leadLabel: 'Quote Lead',
    structuredOutputName: 'door4life_service_lead',
    assistantIds: envList('DOOR4LIFE_ASSISTANT_IDS'),
    notificationRecipients: recipients,
    enabled: envBool('DOOR4LIFE_ENABLED', true),
  };
}

// Adding a second business = adding one more factory to this list. No database,
// no admin UI — the registry is read fresh each request so env changes on
// Vercel take effect without a code deploy.
function clients() {
  return [door4lifeConfig()];
}

/**
 * Resolve which client an inbound call belongs to.
 *
 * Preference order:
 *  1. explicit assistant-id match (set DOOR4LIFE_ASSISTANT_IDS once known)
 *  2. presence of the client's named structured output on the event
 *
 * Returns null when the event isn't ours — the caller acks and ignores it.
 */
function resolveClient({ assistantId, structuredOutputNames = [] } = {}) {
  const available = clients().filter((client) => client.enabled);

  if (assistantId) {
    const byAssistant = available.find((client) => client.assistantIds.includes(assistantId));
    if (byAssistant) return byAssistant;
  }

  const byOutput = available.find((client) => structuredOutputNames.includes(client.structuredOutputName));
  if (byOutput) return byOutput;

  // Vapi frequently delivers end-of-call-report before structured-output
  // extraction finishes, so there may be no output name to match on yet. While
  // exactly one client is configured with no assistant id pinned, route to it
  // and let the structured-output lookup decide. Pin DOOR4LIFE_ASSISTANT_IDS
  // before onboarding a second business.
  if (available.length === 1 && available[0].assistantIds.length === 0) {
    return available[0];
  }

  return null;
}

module.exports = { clients, resolveClient, door4lifeConfig, DEFAULT_RECIPIENT, EMAIL_RE };
