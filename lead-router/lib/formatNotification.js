'use strict';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Subjects are a header field: a newline in caller-supplied text must never
// reach the mail API as a line break.
function sanitizeHeader(value) {
  return String(value).replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function sentenceCase(value) {
  if (typeof value !== 'string' || !value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function yesNo(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return null;
}

function doorLine(lead) {
  const material = lead.doorMaterialType;
  const count = lead.doorCount;
  if (count === null && !material) return null;
  if (count === null) return sentenceCase(material);
  const noun = count === 1 ? 'door' : 'doors';
  return material ? `${count} ${material} ${noun}` : `${count} ${noun}`;
}

function customerBlock(lead) {
  const lines = [lead.callerName, lead.callbackNumber].filter(Boolean);
  return lines.length ? lines.join('\n') : null;
}

/**
 * Build the notification sections. Anything the AI didn't capture is omitted
 * entirely rather than rendered as "undefined" or an invented default.
 */
function buildSections(lead) {
  return [
    ['Customer', customerBlock(lead)],
    ['Location', sentenceCase(lead.serviceLocation)],
    ['Property', sentenceCase(lead.propertyType)],
    ['Service', sentenceCase(lead.serviceRequested)],
    ['Door', doorLine(lead)],
    ['Condition', sentenceCase(lead.doorCondition)],
    ['Photos available', yesNo(lead.photosAvailable)],
    ['Timing', sentenceCase(lead.desiredTiming)],
    ['Pricing interest', yesNo(lead.pricingInterest)],
    ['Needs team confirmation', lead.questionsForTeam],
    ['Recommended action', lead.recommendedAction],
    ['Summary', lead.issueSummary],
  ].filter(([, value]) => value !== null && value !== undefined && value !== '');
}

const DISCLAIMER =
  'Captured by the AI receptionist. Nothing here is confirmed, booked, quoted, or received — ' +
  'photos available means the caller said they have photos, and requested timing is a request, not an appointment.';

const REVIEW_BANNER =
  'The AI did not return a qualification flag for this call, so this lead has not been screened. ' +
  'Review the summary below before acting on it.';

function formatNotification({ lead, client, event, qualification }) {
  const needsReview = qualification.action === 'review';
  const priority = lead.leadPriority || 'UNSPECIFIED';
  const priorityTag = needsReview ? 'NEEDS REVIEW' : priority;
  const who = lead.callerName || 'Unknown caller';

  const subject = sanitizeHeader(
    `[${priorityTag}] New ${client.businessName} ${client.leadLabel} — ${who}`,
  );

  const sections = buildSections(lead);
  const meta = [
    ['Call ID', event.callId],
    ['Call ended', event.endedAt],
  ].filter(([, value]) => Boolean(value));

  const textParts = [`NEW ${client.businessName.toUpperCase()} LEAD`, ''];
  if (needsReview) textParts.push(REVIEW_BANNER, '');
  textParts.push(`Priority: ${priority}`, '');
  for (const [label, value] of sections) {
    textParts.push(`${label}:`, `${value}`, '');
  }
  for (const [label, value] of meta) {
    textParts.push(`${label}:`, `${value}`, '');
  }
  textParts.push('--', DISCLAIMER);
  const text = textParts.join('\n');

  const htmlSections = sections
    .map(
      ([label, value]) =>
        `<p style="margin:0 0 14px"><strong style="display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#666">${escapeHtml(
          label,
        )}</strong>${escapeHtml(value).replace(/\n/g, '<br>')}</p>`,
    )
    .join('');

  const htmlMeta = meta
    .map(([label, value]) => `${escapeHtml(label)}: ${escapeHtml(value)}`)
    .join('<br>');

  const html = [
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#111;max-width:600px">',
    `<h1 style="font-size:18px;margin:0 0 4px">New ${escapeHtml(client.businessName)} lead</h1>`,
    `<p style="margin:0 0 18px;font-size:14px;color:#666">Priority: <strong style="color:#111">${escapeHtml(
      priority,
    )}</strong></p>`,
    needsReview
      ? `<p style="margin:0 0 18px;padding:10px 12px;background:#fff4e5;border-left:3px solid #d97706">${escapeHtml(
          REVIEW_BANNER,
        )}</p>`
      : '',
    htmlSections,
    htmlMeta
      ? `<p style="margin:18px 0 0;font-size:12px;color:#666">${htmlMeta}</p>`
      : '',
    `<p style="margin:14px 0 0;font-size:12px;color:#888">${escapeHtml(DISCLAIMER)}</p>`,
    '</div>',
  ].join('');

  return { subject, text, html };
}

module.exports = { formatNotification, escapeHtml, sanitizeHeader, buildSections };
