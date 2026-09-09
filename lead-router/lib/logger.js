'use strict';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function activeLevel() {
  return LEVELS[String(process.env.LOG_LEVEL || '').toLowerCase()] || LEVELS.info;
}

function emit(level, event, fields) {
  if (LEVELS[level] < activeLevel()) return;
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    service: 'lead-router',
    event,
    ...fields,
  });
  if (level === 'error') console.error(line);
  else console.log(line);
}

// Logs keep the last 4 digits so a lead is still traceable back to a call
// without putting a customer's phone number in a log aggregator.
function redactPhone(value) {
  if (typeof value !== 'string') return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return digits.length ? '****' : null;
  return `***${digits.slice(-4)}`;
}

function redactEmail(value) {
  if (typeof value !== 'string' || !value.includes('@')) return null;
  const [local, domain] = value.split('@');
  return `${local.slice(0, 1)}***@${domain}`;
}

const logger = {
  debug: (event, fields = {}) => emit('debug', event, fields),
  info: (event, fields = {}) => emit('info', event, fields),
  warn: (event, fields = {}) => emit('warn', event, fields),
  error: (event, fields = {}) => emit('error', event, fields),
};

module.exports = { logger, redactPhone, redactEmail };
