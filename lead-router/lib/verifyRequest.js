'use strict';

const crypto = require('crypto');

// Bearer, one or more spaces, then a non-empty token. The scheme is matched
// case-insensitively per RFC 7235 — Vapi sends "Bearer", but the scheme name is
// not the secret, so being strict there would buy nothing and break on a
// harmless casing change.
const BEARER = /^Bearer\s+(\S.*)$/i;

function digest(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest();
}

function safeEqual(a, b) {
  return crypto.timingSafeEqual(digest(a), digest(b));
}

function authorizationHeader(headers) {
  if (!headers) return null;
  const value = headers.authorization ?? headers.Authorization;
  if (Array.isArray(value)) return null; // duplicated header — treat as malformed
  return typeof value === 'string' ? value : null;
}

/**
 * Vapi authenticates to a Server URL with a Custom Credential sent on every
 * request. Production accepts exactly one form:
 *
 *   Authorization: Bearer <VAPI_WEBHOOK_SECRET>
 *
 * No bare tokens, no alternate headers — a single accepted shape is one less
 * way for a misconfigured credential to look like it works. The token is
 * compared in constant time.
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

  const presented = authorizationHeader(headers);
  if (!presented) {
    return { ok: false, status: 401, reason: 'missing_credential' };
  }

  const match = BEARER.exec(presented.trim());
  if (!match) {
    return { ok: false, status: 401, reason: 'malformed_credential' };
  }

  if (!safeEqual(match[1].trim(), secret)) {
    return { ok: false, status: 401, reason: 'invalid_credential' };
  }

  return { ok: true };
}

module.exports = { verifyRequest };
