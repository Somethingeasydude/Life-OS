'use strict';

const { logger } = require('./logger');
const { isPlainObject } = require('./vapiEvent');

const DEFAULT_BASE = 'https://api.vapi.ai';
const DEFAULT_TIMEOUT_MS = 4000;

/**
 * Reads GET /call/:id and returns call.artifact.structuredOutputs.
 *
 * Vapi runs structured-output extraction as a post-call analysis pass with no
 * completion webhook, so end-of-call-report often lands before the outputs
 * exist. Re-reading the call is the documented way to pick them up. Returns
 * null (never throws) so a lookup failure degrades to "no structured output"
 * rather than losing the request.
 */
async function fetchCallStructuredOutputs(callId, options = {}) {
  const apiKey = options.apiKey || process.env.VAPI_API_KEY;
  const base = (options.baseUrl || process.env.VAPI_API_BASE || DEFAULT_BASE).replace(/\/+$/, '');
  const doFetch = options.fetchImpl || globalThis.fetch;
  const timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
    ? options.timeoutMs
    : DEFAULT_TIMEOUT_MS;

  if (!apiKey || !callId) return null;

  try {
    const response = await doFetch(`${base}/call/${encodeURIComponent(callId)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      logger.warn('vapi_call_fetch_failed', { callId, status: response.status });
      return null;
    }

    const call = await response.json();
    const artifact = isPlainObject(call) && isPlainObject(call.artifact) ? call.artifact : null;
    return artifact && isPlainObject(artifact.structuredOutputs) ? artifact.structuredOutputs : null;
  } catch (error) {
    logger.warn('vapi_call_fetch_error', { callId, error: error.message });
    return null;
  }
}

module.exports = { fetchCallStructuredOutputs, DEFAULT_BASE };
