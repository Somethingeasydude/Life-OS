'use strict';

const KNOWN_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW', 'NON-LEAD'];

// Extraction sometimes reports absence as a word rather than omitting the
// field. "unknown" is not information — it is the absence of information
// wearing a costume, and printing it verbatim makes the lead look broken.
// Matched on the whole trimmed value only, so a summary that merely contains
// the word "unknown" is left alone.
const PLACEHOLDER_TOKENS = new Set([
  'unknown',
  'unspecified',
  'n/a',
  'na',
  'none',
  'null',
  'undefined',
  'not provided',
  'not specified',
  'not given',
  'no answer',
  'tbd',
]);

function isPlaceholder(value) {
  return typeof value === 'string' && PLACEHOLDER_TOKENS.has(value.trim().toLowerCase());
}

/**
 * Deterministic NANP shape check — no guessing, no network, no provider.
 *
 * Returns true (dialable shape), false (cannot be a NANP number), or null
 * (nothing to judge). false does not mean the line is dead; it means nobody
 * should be told this number is good without checking it first.
 */
function phonePlausibility(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  const digits = value.replace(/\D/g, '');
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;

  if (national.length !== 10) return false;
  // NANP forbids 0 or 1 as the leading digit of the area code or the exchange.
  if (/^[01]/.test(national)) return false;
  if (/^[01]/.test(national.slice(3))) return false;

  return true;
}

function str(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

// Vapi returns real booleans, but LLM extraction occasionally emits the string
// form. Reading "true"/"yes" as true preserves meaning; anything else stays
// unknown rather than being coerced to false.
function bool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', 'y'].includes(normalized)) return true;
    if (['false', 'no', 'n'].includes(normalized)) return false;
  }
  return null;
}

function int(value) {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value === 'string') {
    const match = value.trim().match(/^-?\d+/);
    if (match) return Number.parseInt(match[0], 10);
  }
  return null;
}

/**
 * Map Vapi's extracted structured output onto the router's lead shape.
 *
 * Values are passed through as extracted — this only trims, drops empties, and
 * reads the boolean/integer forms. Nothing is inferred, defaulted, or rewritten:
 * the structured output already reflects the caller's final corrected answers.
 */
function normalizeLead(raw) {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return null;
  }

  // Which fields arrived as placeholders is kept rather than thrown away: it is
  // the signal that the assistant prompt needs work, and it is invisible once
  // the values are normalised to null.
  const placeholderFields = [];
  const text = (key, field) => {
    if (isPlaceholder(raw[key])) {
      placeholderFields.push(field);
      return null;
    }
    return str(raw[key]);
  };

  const priorityRaw = text('lead_priority', 'leadPriority');
  const priority = priorityRaw ? priorityRaw.toUpperCase() : null;

  // Kept exactly as extracted, plausible or not. A malformed number is evidence
  // — of a mishearing, of a prompt that never confirmed the digits back — and
  // discarding it would destroy the only record of what went wrong.
  const callbackNumber = text('callback_number', 'callbackNumber');

  return {
    callerName: text('caller_name', 'callerName'),
    callbackNumber,
    callbackNumberPlausible: phonePlausibility(callbackNumber),
    serviceLocation: text('service_location', 'serviceLocation'),
    propertyType: text('property_type', 'propertyType'),
    serviceRequested: text('service_requested', 'serviceRequested'),
    doorMaterialType: text('door_material_type', 'doorMaterialType'),
    doorCount: int(raw.door_count),
    doorCondition: text('door_condition', 'doorCondition'),
    photosAvailable: bool(raw.photos_available),
    desiredTiming: text('desired_timing', 'desiredTiming'),
    pricingInterest: bool(raw.pricing_interest),
    questionsForTeam: text('questions_for_team', 'questionsForTeam'),
    recommendedAction: text('recommended_action', 'recommendedAction'),
    issueSummary: text('issue_summary', 'issueSummary'),
    qualifiedLead: bool(raw.qualified_lead),
    leadPriority: priority,
    leadPriorityKnown: priority !== null && KNOWN_PRIORITIES.includes(priority),
    placeholderFields,
  };
}

module.exports = {
  normalizeLead,
  isPlaceholder,
  phonePlausibility,
  KNOWN_PRIORITIES,
  PLACEHOLDER_TOKENS,
};
