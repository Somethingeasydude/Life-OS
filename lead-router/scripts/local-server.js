'use strict';

/**
 * Local runner for the webhook without Vercel.
 *
 *   VAPI_WEBHOOK_SECRET=dev-secret RESEND_API_KEY=... LEAD_FROM_EMAIL=... \
 *     node scripts/local-server.js
 *
 * Add DRY_RUN=1 to print the email to the console instead of sending it, which
 * is how you exercise the whole path with no API keys and no spend.
 */

const http = require('node:http');
const handler = require('../api/vapi');

const PORT = Number.parseInt(process.env.PORT || '3000', 10);

function collect(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function adapt(res) {
  return {
    setHeader: (name, value) => res.setHeader(name, value),
    status(code) {
      res.statusCode = code;
      return this;
    },
    json(payload) {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(payload));
      return this;
    },
  };
}

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/api/vapi')) {
    res.statusCode = 404;
    return res.end('not found');
  }

  const raw = await collect(req);
  await handler({ method: req.method, headers: req.headers, body: raw || undefined }, adapt(res));
});

server.listen(PORT, () => {
  console.log(`lead-router listening on http://localhost:${PORT}/api/vapi`);
  if (process.env.DRY_RUN === '1') console.log('DRY_RUN=1 — emails are printed, not sent');
});
