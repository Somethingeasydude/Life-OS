'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { deliver, adapterName, ADAPTERS, DEFAULT_ADAPTER } = require('../lib/delivery');
const { DeliveryError } = require('../lib/deliveryError');
const { door4lifeConfig } = require('../lib/config');
const { withEnv, BASE_ENV } = require('./helpers');

test('defaults to the gmail adapter', () => {
  assert.equal(DEFAULT_ADAPTER, 'gmail');
  assert.equal(withEnv({ ...BASE_ENV, DELIVERY_ADAPTER: undefined }, adapterName), 'gmail');
});

test('resend stays available as a selectable alternative', () => {
  assert.ok(ADAPTERS.resend, 'resend adapter still registered');
  assert.ok(ADAPTERS.gmail);
  assert.equal(withEnv({ ...BASE_ENV, DELIVERY_ADAPTER: 'RESEND' }, adapterName), 'resend');
});

test('routes to the selected adapter', async () => {
  const args = {
    notification: { subject: 's', text: 't', html: '<p>h</p>' },
    client: door4lifeConfig(),
    idempotencyKey: 'door4life-lead-x',
  };

  const gmail = await withEnv({ ...BASE_ENV, DELIVERY_ADAPTER: 'gmail', DRY_RUN: '1' }, () =>
    deliver(args),
  );
  assert.equal(gmail.channel, 'gmail');

  const resend = await withEnv({ ...BASE_ENV, DELIVERY_ADAPTER: 'resend', DRY_RUN: '1' }, () =>
    deliver(args),
  );
  assert.equal(resend.channel, 'email');
});

test('an unknown adapter fails loudly rather than silently dropping the lead', () => {
  assert.throws(
    () => withEnv({ ...BASE_ENV, DELIVERY_ADAPTER: 'carrier-pigeon' }, () => deliver({})),
    (error) => error instanceof DeliveryError && /carrier-pigeon/.test(error.message),
  );
});
