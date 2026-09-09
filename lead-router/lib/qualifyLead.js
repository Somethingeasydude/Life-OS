'use strict';

/**
 * Is there enough here for a human to act on?
 *
 * A callback number alone is actionable — someone can be called back. A name
 * plus any substance about the job is actionable too. Nothing but a name, or
 * an empty shell, is not.
 */
function hasActionableData(lead) {
  if (lead.callbackNumber) return true;
  const substance =
    lead.serviceRequested || lead.issueSummary || lead.doorCondition || lead.serviceLocation;
  return Boolean(lead.callerName && substance);
}

/**
 * Decide what happens to a normalized lead.
 *
 *   notify — send the standard lead email
 *   review — send it flagged, because qualification couldn't be read
 *   skip   — no email; the decision is logged, never silently dropped
 *
 * The unreadable case still sends when there's usable caller data: a false
 * positive costs ten seconds of reading, a dropped real lead costs a job. When
 * there's nothing usable to act on, it's logged instead — sending an empty
 * "lead" would be noise, and noise is how a notification channel dies.
 */
function qualifyLead(lead) {
  if (!lead) {
    return { action: 'skip', reason: 'no_lead_data' };
  }

  if (lead.leadPriority === 'NON-LEAD') {
    return { action: 'skip', reason: 'priority_non_lead' };
  }

  if (lead.qualifiedLead === true) {
    return { action: 'notify', reason: 'qualified' };
  }

  if (lead.qualifiedLead === false) {
    return { action: 'skip', reason: 'not_qualified' };
  }

  if (hasActionableData(lead)) {
    return { action: 'review', reason: 'qualification_missing' };
  }

  return { action: 'skip', reason: 'qualification_missing_and_no_actionable_data' };
}

module.exports = { qualifyLead, hasActionableData };
