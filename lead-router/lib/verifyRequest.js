'use strict';

const crypto = require('crypto');

function digest(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest();
}

function safeEqual(a, b) {
  return crypto.timingSafeEqual(digest(a), digest(b));
}

function headerValue(headers, name) {
  if (!headers) return null;
  const key = name.toLowerCase();
  const direct = headers[key] ?? headers[name];
  if (Array.isArray(direct)) return direct[0] || null;
  return typeof direct === 'string' ? direct : null;
}

function stripBearer(value) {
  return value.replace(/^Bearer\s+/i, '').trim();
}

/**
 * Vapi authenticates to a Server URL with a Custom Credential it sends on every
 * request. V0 expects the Bearer Token form:
 *
 *   Authorization: Bearer <VAPI_WEBHOOK_SECRET>
 *
 * The header name is configurable for a credential set up with a custom header;
 * the token is compared in constant time either way.
 *
 * Fails closed: with no secret configured the endpoint rejects everything, so a
 * half-finished deploy can't sit open on the internet.
 */
function verifyRequest({ method, headers } = {}) {
  if (method !== 'POST') {
    return { ok: false, status: 405, reason: 'method_not_allowed' };
  }

  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (!secret) {
    return { ok: false, status: 500, reason: 'webhook_secret_not_configured' };
  }

  const headerName = (process.env.VAPI_WEBHOOK_SECRET_HEADER || 'authorization').toLowerCase();
  const presented = headerValue(headers, headerName);

  if (typeof presented !== 'string' || !presented.trim()) {
    return { ok: false, status: 401, reason: 'missing_credential' };
  }

  if (!safeEqual(stripBearer(presented), secret)) {
    return { ok: false, status: 401, reason: 'invalid_credential' };
  }

  return { ok: true };
}

module.exports = { verifyRequest };
