'use strict';

const { logger } = require('../lib/logger');
const { verifyRequest } = require('../lib/verifyRequest');
const { handleLeadEvent } = require('../lib/handleLeadEvent');

function readBody(req) {
  if (req.body === undefined || req.body === null) return { ok: true, body: null };
  if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return { ok: true, body: req.body };

  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
  try {
    return { ok: true, body: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
}

/**
 * Vapi Server URL endpoint. Every server message for the assistant arrives
 * here; only end-of-call-report does any work.
 */
module.exports = async function handler(req, res) {
  const auth = verifyRequest({ method: req.method, headers: req.headers });
  if (!auth.ok) {
    if (auth.status === 405) res.setHeader('Allow', 'POST');
    logger.warn('request_rejected', { reason: auth.reason, method: req.method });
    return res.status(auth.status).json({ error: auth.reason });
  }

  const parsed = readBody(req);
  if (!parsed.ok) {
    logger.warn('request_rejected', { reason: 'body_not_json' });
    return res.status(400).json({ error: 'invalid_payload', reason: 'body_not_json' });
  }

  try {
    const result = await handleLeadEvent(parsed.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    // Internal detail stays in the logs; the caller gets a bare 5xx so the
    // failure is visible in Vapi's webhook log without leaking anything.
    logger.error('handler_failed', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'internal_error' });
  }
};
