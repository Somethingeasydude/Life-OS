'use strict';

const { logger } = require('./logger');
const { findStructuredOutput } = require('./vapiEvent');
const { fetchCallStructuredOutputs } = require('./vapiApi');

// Vapi documents structured outputs as "typically completes within a few
// seconds" and its own examples wait ~5s before reading the call back. Nothing
// is guaranteed, so these are tuning choices, not contract: a couple of tries
// spread over a few seconds, hard-capped by a total budget that keeps the whole
// request inside both Vapi's webhook timeout and the function's maxDuration.
const DEFAULT_POLL_DELAYS_MS = [3000, 5000];
const DEFAULT_BUDGET_MS = 15000;
const MAX_FETCH_TIMEOUT_MS = 4000;

function pollDelays() {
  const raw = process.env.STRUCTURED_OUTPUT_POLL_DELAYS_MS;
  if (!raw) return DEFAULT_POLL_DELAYS_MS;
  if (raw.trim().toLowerCase() === 'off') return [];
  const parsed = raw
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((ms) => Number.isFinite(ms) && ms >= 0);
  return parsed.length ? parsed : DEFAULT_POLL_DELAYS_MS;
}

function budgetMs() {
  const raw = Number.parseInt(process.env.STRUCTURED_OUTPUT_BUDGET_MS || '', 10);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_BUDGET_MS;
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get the client's named structured output for a completed call.
 *
 *   1. Use it if the webhook already carried it.
 *   2. Otherwise re-read GET /call/:id from the Vapi API, since extraction is a
 *      post-call analysis pass with no completion webhook of its own.
 *
 * Stops at the first hit, when attempts run out, or when the time budget is
 * spent — whichever comes first. Never invents a lead: an exhausted budget
 * reports "missing" and the caller logs it.
 */
async function resolveStructuredOutput({
  event,
  client,
  sleep = wait,
  fetchImpl,
  apiKey,
  now = () => Date.now(),
} = {}) {
  const fromPayload = findStructuredOutput(event.structuredOutputs, client.structuredOutputName);
  if (fromPayload) {
    return { result: fromPayload, source: 'webhook', attempts: 0 };
  }

  const key = apiKey || process.env.VAPI_API_KEY;
  if (!key) {
    logger.warn('structured_output_refetch_skipped', {
      callId: event.callId,
      reason: 'vapi_api_key_not_configured',
    });
    return { result: null, source: 'none', attempts: 0 };
  }

  const delays = pollDelays();
  const deadline = now() + budgetMs();
  let attempts = 0;

  for (const delay of delays) {
    const remainingBeforeWait = deadline - now();
    if (remainingBeforeWait <= delay) {
      logger.warn('structured_output_budget_exhausted', { callId: event.callId, attempts });
      break;
    }

    await sleep(delay);
    attempts += 1;

    const remaining = deadline - now();
    if (remaining <= 0) {
      logger.warn('structured_output_budget_exhausted', { callId: event.callId, attempts });
      break;
    }

    const outputs = await fetchCallStructuredOutputs(event.callId, {
      fetchImpl,
      apiKey: key,
      timeoutMs: Math.min(MAX_FETCH_TIMEOUT_MS, remaining),
    });
    const found = findStructuredOutput(outputs, client.structuredOutputName);
    logger.debug('structured_output_refetch_attempt', {
      callId: event.callId,
      attempt: attempts,
      found: Boolean(found),
    });

    if (found) {
      return { result: found, source: 'vapi_api', attempts };
    }
  }

  return { result: null, source: 'none', attempts };
}

module.exports = {
  resolveStructuredOutput,
  DEFAULT_POLL_DELAYS_MS,
  DEFAULT_BUDGET_MS,
};
