const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const express = require('express');
const {
  getDataDeletionStatus,
  registerDataDeletionRequest,
  verifyMetaSignedRequest,
} = require('../metaDataDeletion');
const createMetaDataDeletionRouter = require('../metaDataDeletionRoutes');

const appSecret = 'test-only-meta-app-secret';
const metaUserId = 'meta-user-987654321';

function makeSignedRequest(payload, secret = appSecret) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  return `${signature}.${encodedPayload}`;
}

const signedRequest = makeSignedRequest({ algorithm: 'HMAC-SHA256', user_id: metaUserId });
const verified = verifyMetaSignedRequest(signedRequest, appSecret);
assert.ok(verified);
assert.equal(verified.userIdHash, crypto.createHash('sha256').update(metaUserId).digest('hex'));
assert.equal(verifyMetaSignedRequest(signedRequest, ''), null);
assert.equal(verifyMetaSignedRequest('invalid', appSecret), null);
assert.equal(verifyMetaSignedRequest(makeSignedRequest({ algorithm: 'HMAC-SHA1', user_id: metaUserId }), appSecret), null);
assert.equal(verifyMetaSignedRequest(makeSignedRequest({ algorithm: 'HMAC-SHA256', user_id: '' }), appSecret), null);

const originalContact = { id: 'contact-1', phone: '919999888877' };
const db = { whatsappContacts: [originalContact] };
const invalidRequest = registerDataDeletionRequest(db, `${signedRequest}x`, appSecret);
assert.deepEqual(invalidRequest, { error: 'INVALID_SIGNED_REQUEST' });
assert.deepEqual(db.whatsappContacts, [originalContact]);
assert.equal(db.metaDataDeletionRequests, undefined);

const first = registerDataDeletionRequest(db, signedRequest, appSecret, '2026-10-15T00:00:00.000Z');
assert.equal(first.created, true);
assert.equal(first.request.status, 'PENDING');
assert.equal(first.request.requestedAt, '2026-10-15T00:00:00.000Z');
assert.deepEqual(db.whatsappContacts, [originalContact]);
assert.equal(JSON.stringify(db).includes(metaUserId), false);

const repeated = registerDataDeletionRequest(db, signedRequest, appSecret);
assert.equal(repeated.created, false);
assert.equal(repeated.request.confirmationCode, first.request.confirmationCode);
assert.equal(db.metaDataDeletionRequests.length, 1);

const status = getDataDeletionStatus(db, first.request.confirmationCode);
assert.equal(status.status, 'PENDING');
assert.equal(status.confirmationCode, first.request.confirmationCode);
assert.equal(getDataDeletionStatus(db, 'unissued-code'), null);
assert.equal(getDataDeletionStatus(db, undefined), null);

async function verifyHttpRoutes() {
  const previousSecret = process.env.WHATSAPP_APP_SECRET;
  const routeDb = { whatsappConfig: {}, whatsappContacts: [originalContact] };
  let saveCount = 0;
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', createMetaDataDeletionRouter({
    getDb: () => routeDb,
    saveDb: () => {
      saveCount++;
      return true;
    },
  }));
  app.use('/api/failure', createMetaDataDeletionRouter({
    getDb: () => ({ whatsappConfig: {} }),
    saveDb: () => false,
  }));

  const server = await new Promise((resolve) => {
    const listeningServer = app.listen(0, '127.0.0.1', () => resolve(listeningServer));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  try {
    delete process.env.WHATSAPP_APP_SECRET;
    const unconfigured = await fetch(`${baseUrl}/auth/data-deletion`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ signed_request: signedRequest }),
    });
    assert.equal(unconfigured.status, 503);

    process.env.WHATSAPP_APP_SECRET = appSecret;
    const invalid = await fetch(`${baseUrl}/auth/data-deletion`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ signed_request: `${signedRequest}x` }),
    });
    assert.equal(invalid.status, 403);
    assert.equal(saveCount, 0);

    const accepted = await fetch(`${baseUrl}/auth/data-deletion`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ signed_request: signedRequest }),
    });
    assert.equal(accepted.status, 200);
    const acceptedBody = await accepted.json();
    assert.match(acceptedBody.confirmation_code, /^DEL-[A-F0-9]{36}$/);
    assert.match(acceptedBody.url, /data-deletion-status\?code=/);
    assert.equal(saveCount, 1);

    const persistenceFailure = await fetch(`${baseUrl}/failure/auth/data-deletion`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ signed_request: makeSignedRequest({ algorithm: 'HMAC-SHA256', user_id: 'meta-user-db-failure' }) }),
    });
    assert.equal(persistenceFailure.status, 503);
    assert.equal(JSON.stringify(await persistenceFailure.json()).includes('confirmation_code'), false);

    const retry = await fetch(`${baseUrl}/whatsapp/data-deletion`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ signed_request: signedRequest }),
    });
    assert.equal(retry.status, 200);
    assert.equal((await retry.json()).confirmation_code, acceptedBody.confirmation_code);
    assert.equal(saveCount, 1);

    const status = await fetch(`${baseUrl}/auth/data-deletion-status?code=${encodeURIComponent(acceptedBody.confirmation_code)}`);
    assert.equal(status.status, 200);
    const statusBody = await status.json();
    assert.equal(statusBody.status, 'PENDING');
    assert.match(statusBody.message, /has not been confirmed/);

    const unknownCode = await fetch(`${baseUrl}/auth/data-deletion-status?code=not-a-real-code`);
    assert.equal(unknownCode.status, 404);
    assert.equal(JSON.stringify(routeDb).includes(metaUserId), false);
    assert.deepEqual(routeDb.whatsappContacts, [originalContact]);
  } finally {
    if (previousSecret === undefined) delete process.env.WHATSAPP_APP_SECRET;
    else process.env.WHATSAPP_APP_SECRET = previousSecret;
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

verifyHttpRoutes()
  .then(() => console.log('PASS: Meta data deletion validates signatures, persists privacy-minimized requests, deduplicates retries, and returns only real statuses'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
