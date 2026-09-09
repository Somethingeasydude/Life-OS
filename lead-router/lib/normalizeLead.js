'use strict';

const KNOWN_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW', 'NON-LEAD'];

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

  const priorityRaw = str(raw.lead_priority);
  const priority = priorityRaw ? priorityRaw.toUpperCase() : null;

  return {
    callerName: str(raw.caller_name),
    callbackNumber: str(raw.callback_number),
    serviceLocation: str(raw.service_location),
    propertyType: str(raw.property_type),
    serviceRequested: str(raw.service_requested),
    doorMaterialType: str(raw.door_material_type),
    doorCount: int(raw.door_count),
    doorCondition: str(raw.door_condition),
    photosAvailable: bool(raw.photos_available),
    desiredTiming: str(raw.desired_timing),
    pricingInterest: bool(raw.pricing_interest),
    questionsForTeam: str(raw.questions_for_team),
    recommendedAction: str(raw.recommended_action),
    issueSummary: str(raw.issue_summary),
    qualifiedLead: bool(raw.qualified_lead),
    leadPriority: priority,
    leadPriorityKnown: priority !== null && KNOWN_PRIORITIES.includes(priority),
  };
}

module.exports = { normalizeLead, KNOWN_PRIORITIES };
