'use strict';

/**
 * One-time: mint a Gmail refresh token for the Lead Router.
 *
 *   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/mint-gmail-token.js
 *
 * Run this on your own machine — it opens a browser consent page and needs a
 * local port. It prints a refresh token; paste that into Vercel as
 * GOOGLE_REFRESH_TOKEN. Nothing is written to disk and nothing leaves your
 * machine except the OAuth exchange with Google.
 *
 * Uses the loopback redirect with PKCE. Google removed the out-of-band (OOB)
 * flow, so a local listener is the supported path for a desktop client.
 */

const http = require('node:http');
const crypto = require('node:crypto');

const SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.');
  console.error('Both come from the OAuth client you created in Google Cloud.');
  process.exit(1);
}

const base64url = (buffer) => buffer.toString('base64url');
const verifier = base64url(crypto.randomBytes(64));
const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
const state = base64url(crypto.randomBytes(16));

function reply(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><meta charset="utf-8"><body style="font:16px system-ui;padding:40px">${message}</body>`);
}

async function exchange(code, redirectUri) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }).toString(),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`token exchange failed (${response.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${server.address().port}`);
  if (url.pathname !== '/') return reply(res, 404, 'Not found.');

  const error = url.searchParams.get('error');
  if (error) {
    reply(res, 400, `<h2>Consent denied</h2><p>${error}</p>`);
    console.error(`\nConsent denied: ${error}`);
    server.close();
    process.exitCode = 1;
    return;
  }

  if (url.searchParams.get('state') !== state) {
    reply(res, 400, '<h2>State mismatch</h2><p>Start over.</p>');
    console.error('\nState mismatch — possible interference. Start over.');
    server.close();
    process.exitCode = 1;
    return;
  }

  try {
    const tokens = await exchange(url.searchParams.get('code'), `http://127.0.0.1:${server.address().port}`);
    if (!tokens.refresh_token) {
      reply(res, 400, '<h2>No refresh token returned</h2><p>Check the terminal.</p>');
      console.error(
        '\nGoogle returned no refresh token. That happens when this account has' +
          '\nalready consented to this client. Revoke it at' +
          '\nhttps://myaccount.google.com/permissions and run this again.',
      );
      server.close();
      process.exitCode = 1;
      return;
    }

    reply(res, 200, '<h2>Done</h2><p>Refresh token is in your terminal. You can close this tab.</p>');
    console.log('\n=== GOOGLE_REFRESH_TOKEN ===\n');
    console.log(tokens.refresh_token);
    console.log('\nPaste that into Vercel. Do not commit it or paste it into chat.\n');
    console.log(`Scope granted: ${tokens.scope}`);
  } catch (failure) {
    reply(res, 500, '<h2>Exchange failed</h2><p>Check the terminal.</p>');
    console.error(`\n${failure.message}`);
    process.exitCode = 1;
  }

  server.close();
});

server.listen(0, '127.0.0.1', () => {
  const redirectUri = `http://127.0.0.1:${server.address().port}`;
  const authUrl = `${AUTH_ENDPOINT}?${new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPE,
    // offline + consent is what makes Google return a refresh token at all.
    access_type: 'offline',
    prompt: 'consent',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })}`;

  // Desktop-app clients accept any loopback port without pre-registering it,
  // so nothing needs adding in the Cloud console for this redirect.
  console.log('\nOpen this URL and sign in as contact@ram-strategicsystems.com:\n');
  console.log(`   ${authUrl}\n`);
  console.log(`Listening on ${redirectUri} — waiting for consent...`);
});
