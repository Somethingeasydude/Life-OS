'use strict';

/**
 * Thrown by any delivery adapter when a notification could not be handed off.
 * Shared so adapters stay peers rather than importing each other.
 */
class DeliveryError extends Error {
  constructor(message, { status = null, cause = null } = {}) {
    super(message);
    this.name = 'DeliveryError';
    this.status = status;
    this.cause = cause;
  }
}

module.exports = { DeliveryError };
