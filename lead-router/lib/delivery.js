'use strict';

const { DeliveryError } = require('./deliveryError');
const { deliverGmail } = require('./gmailDelivery');
const { deliverEmail } = require('./emailDelivery');

// Every adapter takes { notification, client, idempotencyKey } and returns a
// result or throws DeliveryError. Adding SMS, Slack, or a CRM later means
// adding one entry here, not touching the pipeline.
const ADAPTERS = {
  gmail: deliverGmail,
  resend: deliverEmail,
};

const DEFAULT_ADAPTER = 'gmail';

function adapterName() {
  return (process.env.DELIVERY_ADAPTER || DEFAULT_ADAPTER).trim().toLowerCase();
}

function deliver(args) {
  const name = adapterName();
  const adapter = ADAPTERS[name];
  if (!adapter) {
    throw new DeliveryError(`unknown delivery adapter: ${name}`);
  }
  return adapter(args);
}

module.exports = { deliver, adapterName, ADAPTERS, DEFAULT_ADAPTER };
