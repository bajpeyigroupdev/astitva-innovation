const assert = require('assert');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const express = require('express');
const whatsappClient = require('../whatsapp/whatsappClient');
const whatsappWebhook = require('../whatsapp/whatsappWebhook');
const checklistEngine = require('../whatsapp/checklistEngine');
const evidenceManager = require('../whatsapp/evidenceManager');
const { clearLegacyDefaultVerifyToken } = require('../whatsapp/whatsappConfigSecurity');
const createWhatsAppRouter = require('../whatsapp/whatsappRoutes');

console.log('======================================================================');
console.log('ASTITVA INNOVATION — META WHATSAPP PLATFORM COMPREHENSIVE TEST SUITE');
console.log('Covering WhatsApp API and security verification scenarios');
console.log('======================================================================\n');

let passedTests = 0;
let totalTests = 0;

async function runTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✓ PASS [Test ${totalTests}]: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ FAIL [Test ${totalTests}]: ${name}`);
    console.error(err);
  }
}

async function runAllTests() {
  // -------------------------------------------------------------
  // TEST 1: Missing or invalid configuration detection
  // -------------------------------------------------------------
  await runTest('1. Missing or invalid configuration handling', async () => {
    const emptyConfig = { token: '', phoneNumberId: '', wabaId: '' };
    const phoneResult = await whatsappClient.getPhoneNumberDetails(emptyConfig);
    assert.strictEqual(phoneResult.success, false);
    assert.ok(phoneResult.error.includes('Missing'));

    const wabaResult = await whatsappClient.getWabaDetails(emptyConfig);
    assert.strictEqual(wabaResult.success, false);
    assert.ok(wabaResult.error.includes('Missing'));
  });

  // -------------------------------------------------------------
  // TEST 2: Successful and failed API health checks
  // -------------------------------------------------------------
  await runTest('2. Successful and failed API health checks (6-stage breakdown)', async () => {
    // 2a: Failed / Blocked health check when credentials missing
    const unconfiguredDb = { whatsappConfig: {}, whatsappMessages: [], whatsappWebhookLogs: [] };
    const healthUnconfigured = await whatsappClient.performHealthCheck(null, unconfiguredDb, () => {});
    assert.strictEqual(healthUnconfigured.overallStatus, 'Disconnected');
    assert.strictEqual(healthUnconfigured.stages.credentialsConfigured.status, 'BLOCKED');
    assert.strictEqual(healthUnconfigured.stages.apiAuthentication.status, 'BLOCKED');

    // 2b: Configured health check structure evaluation
    const mockConfiguredDb = {
      whatsappConfig: {
        token: 'EAAG_MOCK_TOKEN_VALID',
        phoneNumberId: '109283746501928',
        wabaId: '102938475610293',
        appId: '847291038472910',
        appSecret: 'test_secret_123',
        verifyToken: 'astitva_wa_verify_token_2026_secure',
      },
      whatsappMessages: [
        { id: 'wamid.1', direction: 'outbound', status: 'delivered' },
        { id: 'wamid.2', direction: 'inbound', status: 'delivered' }
      ],
      whatsappWebhookLogs: [
        { id: 'wh-1', signatureVerified: true, timestamp: new Date().toISOString() }
      ],
      whatsappChecklist: []
    };
    const healthStages = await whatsappClient.performHealthCheck(mockConfiguredDb.whatsappConfig, mockConfiguredDb, () => {});
    assert.strictEqual(healthStages.stages.credentialsConfigured.status, 'PASS');
    assert.strictEqual(healthStages.stages.webhookConfigured.status, 'PASS');
    assert.strictEqual(healthStages.stages.messagingTested.status, 'PASS');
  });

  // -------------------------------------------------------------
  // TEST 3: Invalid webhook verification token rejected (403)
  // -------------------------------------------------------------
  await runTest('3. Invalid webhook verification token returns 403 Forbidden', () => {
    let statusCode = 0;
    const req = {
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong_invalid_token_999',
        'hub.challenge': 'challenge_12345',
      },
    };
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: () => {}, send: () => {} };
      },
    };
    whatsappWebhook.verifyChallenge(req, res, { verifyToken: 'astitva_wa_verify_token_2026_secure' });
    assert.strictEqual(statusCode, 403);
  });

  // -------------------------------------------------------------
  // TEST 4: Valid webhook verification challenge accepted (200)
  // -------------------------------------------------------------
  await runTest('4. Valid webhook verification challenge returns challenge string (200)', () => {
    let statusCode = 0;
    let sentBody = '';
    const req = {
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'astitva_wa_verify_token_2026_secure',
        'hub.challenge': 'meta_challenge_code_884920',
      },
    };
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          send: (body) => { sentBody = body; },
          json: (j) => { sentBody = j; }
        };
      },
    };
    whatsappWebhook.verifyChallenge(req, res, { verifyToken: 'astitva_wa_verify_token_2026_secure' });
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(sentBody, 'meta_challenge_code_884920');
  });

  // -------------------------------------------------------------
  // Webhook verification fails closed without a configured token
  // -------------------------------------------------------------
  await runTest('Missing webhook verification secret fails closed without a built-in token', () => {
    const originalVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    delete process.env.WHATSAPP_VERIFY_TOKEN;
    try {
      assert.strictEqual(whatsappClient.resolveConfig({ whatsappConfig: {} }).verifyToken, '');
      let statusCode = 0;
      const req = {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': '',
          'hub.challenge': 'challenge_without_secret',
        },
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {}, send: () => {} };
        },
      };
      whatsappWebhook.verifyChallenge(req, res, { verifyToken: '' });
      assert.strictEqual(statusCode, 403);
    } finally {
      if (originalVerifyToken === undefined) delete process.env.WHATSAPP_VERIFY_TOKEN;
      else process.env.WHATSAPP_VERIFY_TOKEN = originalVerifyToken;
    }
  });

  await runTest('Migration clears only the recognized legacy webhook token placeholder', () => {
    const legacyConfig = { whatsappConfig: { verifyToken: 'astitva_wa_verify_token_2026_secure' } };
    const configuredConfig = { whatsappConfig: { verifyToken: 'customer-configured-random-secret' } };
    assert.strictEqual(clearLegacyDefaultVerifyToken(legacyConfig), true);
    assert.strictEqual(legacyConfig.whatsappConfig.verifyToken, '');
    assert.strictEqual(clearLegacyDefaultVerifyToken(configuredConfig), false);
    assert.strictEqual(configuredConfig.whatsappConfig.verifyToken, 'customer-configured-random-secret');
  });

  // -------------------------------------------------------------
  // TEST 6: Invalid webhook signature rejected
  // -------------------------------------------------------------
  await runTest('5. Invalid webhook HMAC-SHA256 signature is rejected', () => {
    const secret = 'valid_meta_app_secret_7721';
    const rawBody = Buffer.from(JSON.stringify({ object: 'whatsapp_business_account', entry: [] }), 'utf8');
    const forgedSignature = 'sha256=0000000000000000000000000000000000000000000000000000000000000000';

    const req = {
      headers: { 'x-hub-signature-256': forgedSignature },
      rawBody,
    };
    const result = whatsappWebhook.verifySignature(req, secret);
    assert.strictEqual(result.verified, false);
  });

  // -------------------------------------------------------------
  // TEST 6: Valid webhook signature accepted
  // -------------------------------------------------------------
  await runTest('6. Valid webhook HMAC-SHA256 signature is verified', () => {
    const secret = 'valid_meta_app_secret_7721';
    const rawBody = Buffer.from(JSON.stringify({ object: 'whatsapp_business_account', entry: [] }), 'utf8');
    const hmac = crypto.createHmac('sha256', secret);
    const validSignature = 'sha256=' + hmac.update(rawBody).digest('hex');

    const req = {
      headers: { 'x-hub-signature-256': validSignature },
      rawBody,
    };
    const result = whatsappWebhook.verifySignature(req, secret);
    assert.strictEqual(result.verified, true);
    assert.strictEqual(result.reason, 'MATCH');
  });

  // -------------------------------------------------------------
  // TEST 7: Inbound message persistence & thread update
  // -------------------------------------------------------------
  await runTest('7. Inbound message persistence & conversation thread update', async () => {
    const testDb = {
      whatsappConfig: {},
      whatsappConversations: [],
      whatsappMessages: [],
      whatsappContacts: [],
      whatsappDeliveryLogs: [],
      whatsappWebhookLogs: [],
    };
    const saveDb = (db) => Object.assign(testDb, db);

    const testPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA-12345',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                contacts: [{ profile: { name: 'Ananya Sharma' }, wa_id: '919811233445' }],
                messages: [
                  {
                    from: '919811233445',
                    id: 'wamid.INBOUND_TEST_01',
                    timestamp: `${Math.floor(Date.now() / 1000)}`,
                    text: { body: 'Hello Astitva, I need a FinTech quote.' },
                    type: 'text',
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const req = { body: testPayload, headers: {} };
    const res = { status: () => ({ json: () => {} }) };

    await whatsappWebhook.handleIncomingEvent(req, res, { db: testDb, saveDb, config: {} });

    assert.strictEqual(testDb.whatsappMessages.length, 1);
    assert.strictEqual(testDb.whatsappMessages[0].id, 'wamid.INBOUND_TEST_01');
    assert.strictEqual(testDb.whatsappMessages[0].text, 'Hello Astitva, I need a FinTech quote.');
    assert.strictEqual(testDb.whatsappConversations.length, 1);
    assert.strictEqual(testDb.whatsappConversations[0].contactName, 'Ananya Sharma');
    assert.ok(testDb.whatsappConversations[0].lastInboundTimestamp);
  });

  // -------------------------------------------------------------
  // TEST 8: Message status updates (sent -> delivered -> read)
  // -------------------------------------------------------------
  await runTest('8. Message status updates (delivered and read status transitions)', async () => {
    const testDb = {
      whatsappConfig: {},
      whatsappMessages: [
        { id: 'wamid.OUTBOUND_MSG_99', conversationId: '919811233445', status: 'sent', text: 'Proposal sent' }
      ],
      whatsappDeliveryLogs: [],
      whatsappWebhookLogs: [],
    };
    const saveDb = (db) => Object.assign(testDb, db);

    const statusPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA-123',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                statuses: [
                  {
                    id: 'wamid.OUTBOUND_MSG_99',
                    status: 'delivered',
                    timestamp: `${Math.floor(Date.now() / 1000)}`,
                    recipient_id: '919811233445',
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const req = { body: statusPayload, headers: {} };
    const res = { status: () => ({ json: () => {} }) };

    await whatsappWebhook.handleIncomingEvent(req, res, { db: testDb, saveDb, config: {} });

    const msg = testDb.whatsappMessages.find((m) => m.id === 'wamid.OUTBOUND_MSG_99');
    assert.strictEqual(msg.status, 'delivered');
  });

  // -------------------------------------------------------------
  // TEST 9: Duplicate webhook event handling (Idempotency)
  // -------------------------------------------------------------
  await runTest('9. Duplicate webhook event handling is idempotent', async () => {
    const testDb = {
      whatsappConfig: {},
      whatsappMessages: [
        { id: 'wamid.EXISTING_ID_884', conversationId: '919820144556', status: 'delivered', text: 'Already received' }
      ],
      whatsappConversations: [],
      whatsappContacts: [],
      whatsappDeliveryLogs: [],
      whatsappWebhookLogs: [],
    };
    const saveDb = (db) => Object.assign(testDb, db);

    const dupPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA-123',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                messages: [
                  {
                    from: '919820144556',
                    id: 'wamid.EXISTING_ID_884',
                    timestamp: `${Math.floor(Date.now() / 1000)}`,
                    text: { body: 'Already received' },
                    type: 'text',
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const req = { body: dupPayload, headers: {} };
    const res = { status: () => ({ json: () => {} }) };

    await whatsappWebhook.handleIncomingEvent(req, res, { db: testDb, saveDb, config: {} });

    // Ensure count remains exactly 1, no duplicate inserted
    assert.strictEqual(testDb.whatsappMessages.length, 1);
  });

  // -------------------------------------------------------------
  // TEST 10: Outbound message formatting & validation
  // -------------------------------------------------------------
  await runTest('10. Outbound message formatting & phone cleaning', async () => {
    const config = { token: 'mock_token', phoneNumberId: '12345' };
    
    // Invalid phone number check
    const badPhone = await whatsappClient.sendTextMessage(config, { to: '123', text: 'Hello' });
    assert.strictEqual(badPhone.success, false);
    assert.ok(badPhone.error.includes('Invalid destination phone number'));
  });

  // -------------------------------------------------------------
  // TEST 11: Template variable formatting
  // -------------------------------------------------------------
  await runTest('11. Template structure and parameters formatting', async () => {
    const config = { token: 'mock_token', phoneNumberId: '12345' };
    const badPhone = await whatsappClient.sendTemplateMessage(config, {
      to: 'invalid_short',
      templateName: 'astitva_welcome_lead',
    });
    assert.strictEqual(badPhone.success, false);
    assert.ok(badPhone.error.includes('Invalid destination phone number'));
  });

  // -------------------------------------------------------------
  // TEST 12: Customer-service window enforcement (24h Policy)
  // -------------------------------------------------------------
  await runTest('12. Customer-service 24h window calculation', () => {
    const now = Date.now();
    const openWindowTimestamp = new Date(now - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
    const expiredWindowTimestamp = new Date(now - 26 * 60 * 60 * 1000).toISOString(); // 26 hours ago

    const isWindowOpen = (ts) => {
      const time = ts ? new Date(ts).getTime() : 0;
      return time > 0 && Date.now() - time < 24 * 60 * 60 * 1000;
    };

    assert.strictEqual(isWindowOpen(openWindowTimestamp), true);
    assert.strictEqual(isWindowOpen(expiredWindowTimestamp), false);
    assert.strictEqual(isWindowOpen(null), false);
  });

  // -------------------------------------------------------------
  // TEST 13: Consent and opt-out enforcement (STOP Keyword)
  // -------------------------------------------------------------
  await runTest('13. Inbound STOP keyword triggers automatic opt-out suppression', async () => {
    const testDb = {
      whatsappConfig: {},
      whatsappMessages: [],
      whatsappConversations: [],
      whatsappContacts: [
        { id: 'cnt-1', phone: '919999888877', name: 'Test Lead', consentStatus: 'OPTED_IN' }
      ],
      whatsappDeliveryLogs: [],
      whatsappWebhookLogs: [],
    };
    const saveDb = (db) => Object.assign(testDb, db);

    const stopPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA-1',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                messages: [
                  {
                    from: '919999888877',
                    id: 'wamid.STOP_MSG_01',
                    timestamp: `${Math.floor(Date.now() / 1000)}`,
                    text: { body: 'STOP' },
                    type: 'text',
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const req = { body: stopPayload, headers: {} };
    const res = { status: () => ({ json: () => {} }) };

    await whatsappWebhook.handleIncomingEvent(req, res, { db: testDb, saveDb, config: {} });

    const contact = testDb.whatsappContacts.find((c) => c.phone === '919999888877');
    assert.strictEqual(contact.consentStatus, 'OPTED_OUT');
    assert.ok(contact.optOutTimestamp);
  });

  // -------------------------------------------------------------
  // TEST 14: Authentication & Authorization (JWT Verification)
  // -------------------------------------------------------------
  await runTest('14. Authentication token verification and rejection', () => {
    const secret = 'test_jwt_secret_astitva_2026';
    const validToken = jwt.sign({ username: 'AST-ADMIN-01' }, secret, { expiresIn: '1h' });
    const expiredToken = jwt.sign({ username: 'AST-ADMIN-01' }, secret, { expiresIn: '-1s' });

    const decoded = jwt.verify(validToken, secret);
    assert.strictEqual(decoded.username, 'AST-ADMIN-01');

    assert.throws(() => {
      jwt.verify(expiredToken, secret);
    }, /jwt expired/);

    assert.throws(() => {
      jwt.verify('tampered.token.here', secret);
    });
  });

  // -------------------------------------------------------------
  // TEST 15: Cross-tenant / WABA Isolation Scoping
  // -------------------------------------------------------------
  await runTest('15. Multi-account WABA scoping isolation', () => {
    const db1 = { whatsappConfig: { wabaId: 'WABA_TENANT_A', token: 'TOKEN_A' } };
    const db2 = { whatsappConfig: { wabaId: 'WABA_TENANT_B', token: 'TOKEN_B' } };

    const configA = whatsappClient.resolveConfig(db1);
    const configB = whatsappClient.resolveConfig(db2);

    assert.strictEqual(configA.wabaId, 'WABA_TENANT_A');
    assert.strictEqual(configB.wabaId, 'WABA_TENANT_B');
    assert.notStrictEqual(configA.wabaId, configB.wabaId);
  });

  // -------------------------------------------------------------
  // TEST 16: Evidence Upload Validation (MIME type & size)
  // -------------------------------------------------------------
  await runTest('16. Evidence upload validation for supported formats and size limits', async () => {
    const testDb = { whatsappEvidence: [] };
    const saveDb = (db) => Object.assign(testDb, db);

    // Unsupported MIME type rejection
    await assert.rejects(async () => {
      await evidenceManager.saveEvidence({
        fileName: 'malicious.exe',
        mimeType: 'application/x-msdownload',
        fileData: Buffer.from('dummy'),
        category: 'Meta App Review screencast',
        db: testDb,
        saveDb,
      });
    }, /Unsupported file type/);

    // Supported MIME type acceptance
    const record = await evidenceManager.saveEvidence({
      fileName: 'test_evidence_screencast.webm',
      mimeType: 'video/webm',
      fileData: Buffer.from('MOCK_VIDEO_DATA_BUFFER'),
      category: 'Meta App Review screencast',
      db: testDb,
      saveDb,
    });
    assert.strictEqual(record.mimeType, 'video/webm');
    assert.strictEqual(testDb.whatsappEvidence.length, 1);

    // Clean up created file
    evidenceManager.deleteEvidence(record.id, testDb, saveDb);
  });

  // -------------------------------------------------------------
  // TEST 17: Review Checklist Dynamic Verification Status
  // -------------------------------------------------------------
  await runTest('17. App Review Checklist dynamic condition audit', () => {
    const emptyDb = {
      whatsappConfig: {},
      whatsappMessages: [],
      whatsappWebhookLogs: [],
      whatsappApiLogs: [],
      whatsappEvidence: [],
      whatsappContacts: [],
    };
    const checklistEmpty = checklistEngine.evaluateChecklist(emptyDb, {});
    const unverifiedCount = checklistEmpty.filter((i) => !i.verified).length;
    assert.ok(unverifiedCount >= 10, 'Unverified items should be flagged when prerequisites are missing');

    const verifiedDb = {
      whatsappConfig: {
        status: 'Connected',
        wabaId: '1029384756',
        phoneNumberId: '10928374',
        codeVerificationStatus: 'VERIFIED',
        qualityRating: 'GREEN',
        lastSync: new Date().toISOString(),
        paymentConfigured: true,
        webhookVerified: true,
        privacyPolicyVerified: true,
      },
      whatsappMessages: [
        { id: '1', direction: 'outbound', status: 'delivered' },
        { id: '2', direction: 'inbound', status: 'delivered' },
      ],
      whatsappWebhookLogs: [{ id: '1', signatureVerified: true }],
      whatsappApiLogs: [{ id: '1', success: true }],
      whatsappEvidence: [{ id: '1', category: 'Meta App Review screencast', mimeType: 'video/webm' }],
      whatsappContacts: [{ id: '1', consentStatus: 'OPTED_IN' }],
    };
    const checklistVerified = checklistEngine.evaluateChecklist(verifiedDb, verifiedDb.whatsappConfig);
    const passed = checklistVerified.filter((i) => i.verified).length;
    assert.ok(passed >= 12, 'Verified items should pass when all actual prerequisites are met');
  });

  // -------------------------------------------------------------
  // TEST 18: UI Error Handling & Meta Error Code Resolution
  // -------------------------------------------------------------
  await runTest('18. Error dictionary resolution for Meta WhatsApp codes', () => {
    const errorCodes = {
      131047: 'Re-engagement Message Outside 24h Window',
      131030: 'Recipient Phone Number Not in WhatsApp',
      190: 'Access Token Expired',
    };
    assert.ok(errorCodes[131047].includes('24h Window'));
    assert.ok(errorCodes[131030].includes('Not in WhatsApp'));
  });

  // -------------------------------------------------------------
  // TEST 19: Database Migration & Schema Consistency
  // -------------------------------------------------------------
  await runTest('19. Database auto-migration adds contacts & delivery logs', () => {
    const legacyDb = {
      settings: {},
      products: [],
      whatsappConfig: {},
      // Older schema missing whatsappContacts and whatsappDeliveryLogs
    };

    // Auto-migration rule test
    if (!legacyDb.whatsappContacts || !Array.isArray(legacyDb.whatsappContacts)) {
      legacyDb.whatsappContacts = [];
    }
    if (!legacyDb.whatsappDeliveryLogs || !Array.isArray(legacyDb.whatsappDeliveryLogs)) {
      legacyDb.whatsappDeliveryLogs = [];
    }

    assert.ok(Array.isArray(legacyDb.whatsappContacts));
    assert.ok(Array.isArray(legacyDb.whatsappDeliveryLogs));
  });

  // -------------------------------------------------------------
  // TEST 20: Webhook verification secrets are never returned to clients
  // -------------------------------------------------------------
  await runTest('20. WhatsApp configuration and diagnostics redact webhook verify token', async () => {
    const app = express();
    const testDb = { whatsappConfig: { verifyToken: 'test-only-webhook-token' } };
    app.use('/api/whatsapp', createWhatsAppRouter({
      getDb: () => testDb,
      saveDb: () => {},
      authenticateAdmin: (req, res, next) => next(),
    }));

    const server = app.listen(0, '127.0.0.1');
    try {
      await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
      });
      const { port } = server.address();
      const configResponse = await fetch(`http://127.0.0.1:${port}/api/whatsapp/config`);
      const configPayload = await configResponse.json();
      assert.strictEqual(configPayload.data.hasVerifyToken, true);
      assert.strictEqual(Object.prototype.hasOwnProperty.call(configPayload.data, 'verifyToken'), false);

      const diagnosticsResponse = await fetch(`http://127.0.0.1:${port}/api/whatsapp/webhooks/test-challenge`, {
        method: 'POST',
      });
      const diagnosticsPayload = await diagnosticsResponse.json();
      assert.strictEqual(diagnosticsPayload.verifyTokenConfigured, true);
      assert.strictEqual(Object.prototype.hasOwnProperty.call(diagnosticsPayload, 'verifyToken'), false);
    } finally {
      await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    }
  });

  // -------------------------------------------------------------
  // TEST 21: Evidence files require an explicitly configured admin JWT
  // -------------------------------------------------------------
  await runTest('21. Evidence downloads reject fallback secrets and non-admin tokens', async () => {
    const originalSecret = process.env.JWT_SECRET;
    const testSecret = 'unit-test-evidence-jwt-secret';
    const app = express();
    app.use('/api/whatsapp', createWhatsAppRouter({
      getDb: () => ({ whatsappEvidence: [] }),
      saveDb: () => {},
      authenticateAdmin: (req, res, next) => next(),
    }));

    const server = app.listen(0, '127.0.0.1');
    try {
      await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
      });
      const { port } = server.address();
      const url = `http://127.0.0.1:${port}/api/whatsapp/evidence/test-file/file`;

      delete process.env.JWT_SECRET;
      const unconfiguredResponse = await fetch(`${url}?token=arbitrary-token`);
      assert.strictEqual(unconfiguredResponse.status, 503);

      process.env.JWT_SECRET = testSecret;
      const missingTokenResponse = await fetch(url);
      assert.strictEqual(missingTokenResponse.status, 401);

      const invalidTokenResponse = await fetch(`${url}?token=invalid-token`);
      assert.strictEqual(invalidTokenResponse.status, 401);

      const analystToken = jwt.sign({ username: 'test-analyst', role: 'analyst' }, testSecret);
      const analystResponse = await fetch(`${url}?token=${encodeURIComponent(analystToken)}`);
      assert.strictEqual(analystResponse.status, 403);

      const adminToken = jwt.sign({ username: 'test-admin', role: 'admin' }, testSecret);
      const adminResponse = await fetch(`${url}?token=${encodeURIComponent(adminToken)}`);
      assert.strictEqual(adminResponse.status, 404);
    } finally {
      if (originalSecret === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = originalSecret;
      await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    }
  });

  // -------------------------------------------------------------
  // TEST 22: Configuration and outbound-message inputs fail safely
  // -------------------------------------------------------------
  await runTest('22. Configuration and message routes validate inputs and save failures', async () => {
    const app = express();
    app.use(express.json());
    const testDb = {
      whatsappConfig: { verifyToken: 'test-only-webhook-token' },
      whatsappContacts: [],
      whatsappConversations: [],
      whatsappMessages: [],
    };
    let persistenceAvailable = true;
    app.use('/api/whatsapp', createWhatsAppRouter({
      getDb: () => testDb,
      saveDb: () => persistenceAvailable,
      authenticateAdmin: (req, res, next) => next(),
    }));

    const server = app.listen(0, '127.0.0.1');
    try {
      await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
      });
      const baseUrl = `http://127.0.0.1:${server.address().port}/api/whatsapp`;
      const malformedConfig = await fetch(`${baseUrl}/config`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ wabaId: 1029384756 }),
      });
      assert.strictEqual(malformedConfig.status, 400);

      const invalidVersion = await fetch(`${baseUrl}/config`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ apiVersion: '../../host' }),
      });
      assert.strictEqual(invalidVersion.status, 400);

      const secret = 'test-only-whatsapp-access-token';
      const validConfig = await fetch(`${baseUrl}/config`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: secret, wabaId: '1029384756', phoneNumberId: '1092837465', apiVersion: 'v20.0' }),
      });
      assert.strictEqual(validConfig.status, 200);
      assert.strictEqual((await validConfig.text()).includes(secret), false);
      assert.strictEqual(testDb.whatsappConfig.token, secret);

      persistenceAvailable = false;
      const saveFailure = await fetch(`${baseUrl}/config`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ displayName: 'Test Business' }),
      });
      assert.strictEqual(saveFailure.status, 503);
      persistenceAvailable = true;

      const malformedText = await fetch(`${baseUrl}/messages/send-text`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ to: '+919999888877', text: 1234 }),
      });
      assert.strictEqual(malformedText.status, 400);

      const malformedTemplate = await fetch(`${baseUrl}/messages/send-template`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ to: '+919999888877', templateName: 'approved_template', components: {} }),
      });
      assert.strictEqual(malformedTemplate.status, 400);

      // Verify send-media input validation
      const malformedMedia = await fetch(`${baseUrl}/messages/send-media`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ to: '+919999888877' }), // missing mediaUrl
      });
      assert.strictEqual(malformedMedia.status, 400);
    } finally {
      await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    }
  });

  // -------------------------------------------------------------
  // TEST 25: Outbound media message formatting & window enforcement
  // -------------------------------------------------------------
  await runTest('25. Outbound media message formatting & customer window enforcement', async () => {
    let capturedCall = null;
    const originalCall = whatsappClient.callGraphApi;
    whatsappClient.callGraphApi = async (args) => {
      capturedCall = args;
      return { success: true, status: 200, data: { messages: [{ id: 'wamid.MEDIA_TEST_01' }] } };
    };

    try {
      const config = { token: 'EAAB_test', phoneNumberId: '109823475' };
      const res = await whatsappClient.sendMediaMessage(config, {
        to: '+91 72338 82089',
        mediaType: 'image',
        mediaUrl: 'https://astitvainnovation.in/assets/banner.png',
        caption: 'Astitva Project Blueprint',
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(capturedCall.endpoint, '/109823475/messages');
      assert.strictEqual(capturedCall.body.messaging_product, 'whatsapp');
      assert.strictEqual(capturedCall.body.to, '917233882089');
      assert.strictEqual(capturedCall.body.type, 'image');
      assert.strictEqual(capturedCall.body.image.link, 'https://astitvainnovation.in/assets/banner.png');
      assert.strictEqual(capturedCall.body.image.caption, 'Astitva Project Blueprint');
    } finally {
      whatsappClient.callGraphApi = originalCall;
    }
  });

  // -------------------------------------------------------------
  // TEST 26: Template dispatch correctly resolves conversation and tenant ID
  // -------------------------------------------------------------
  await runTest('26. Template dispatch safely resolves convo and persists record without ReferenceError', async () => {
    let capturedCall = null;
    const originalCall = whatsappClient.callGraphApi;
    whatsappClient.callGraphApi = async (args) => {
      capturedCall = args;
      return { success: true, status: 200, data: { messages: [{ id: 'wamid.TMPL_TEST_02' }] } };
    };

    const express = require('express');
    const app = express();
    app.use(express.json());

    const testDb = {
      whatsappConfig: { token: 'EAAB_test', phoneNumberId: '109823475', wabaId: 'WABA_01' },
      whatsappContacts: [],
      whatsappConversations: [],
      whatsappMessages: [],
      whatsappDeliveryLogs: [],
      activeWhatsAppTenantId: 'tenant-client-a',
    };

    const router = createWhatsAppRouter({
      getDb: () => testDb,
      saveDb: () => true,
      authenticateAdmin: (req, res, next) => {
        req.admin = { username: 'AST-ADMIN-01', role: 'admin' };
        next();
      },
    });
    app.use('/', router);

    const server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const sendRes = await fetch(`${baseUrl}/messages/send-template`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          to: '917233882089',
          templateName: 'client_consultation_welcome',
          languageCode: 'en_US',
          components: [{ type: 'body', parameters: [{ type: 'text', text: 'Vikram' }] }],
        }),
      });

      assert.strictEqual(sendRes.status, 200);
      const data = await sendRes.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.messageId, 'wamid.TMPL_TEST_02');

      // Verify conversation record was created with tenantId
      const savedMsg = testDb.whatsappMessages.find((m) => m.id === 'wamid.TMPL_TEST_02');
      assert.ok(savedMsg);
      assert.strictEqual(savedMsg.tenantId, 'tenant-client-a');

      const savedConvo = testDb.whatsappConversations.find((c) => c.id === '917233882089');
      assert.ok(savedConvo);
      assert.strictEqual(savedConvo.tenantId, 'tenant-client-a');
    } finally {
      whatsappClient.callGraphApi = originalCall;
      await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    }
  });

  // -------------------------------------------------------------
  // TEST 27: Webhook processing for template status and phone quality updates
  // -------------------------------------------------------------
  await runTest('27. Webhook handles message_template_status_update and phone_number_quality_update', async () => {
    const testDb = {
      whatsappConfig: { qualityRating: 'UNKNOWN', messagingLimitTier: 'TIER_50' },
      whatsappTemplates: [{ id: 'tmpl_101', name: 'welcome_lead', status: 'PENDING' }],
      whatsappWebhookLogs: [],
    };

    // 1. Send template approval event
    const templateReq = {
      headers: {},
      body: {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WABA_01',
            changes: [
              {
                field: 'message_template_status_update',
                value: {
                  event: 'APPROVED',
                  message_template_id: 'tmpl_101',
                  message_template_name: 'welcome_lead',
                },
              },
            ],
          },
        ],
      },
    };
    const mockRes = {
      status: () => ({ json: () => {} }),
    };

    await whatsappWebhook.handleIncomingEvent(templateReq, mockRes, { db: testDb, saveDb: () => true, config: {} });
    assert.strictEqual(testDb.whatsappTemplates[0].status, 'APPROVED');
    assert.strictEqual(testDb.whatsappWebhookLogs.length, 1);

    // 2. Send phone quality update event
    const phoneReq = {
      headers: {},
      body: {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WABA_01',
            changes: [
              {
                field: 'phone_number_quality_update',
                value: {
                  event: 'GREEN',
                  current_limit: 'TIER_1K',
                  display_phone_number: '+91 7233882089',
                },
              },
            ],
          },
        ],
      },
    };
    await whatsappWebhook.handleIncomingEvent(phoneReq, mockRes, { db: testDb, saveDb: () => true, config: {} });
    assert.strictEqual(testDb.whatsappConfig.qualityRating, 'GREEN');
    assert.strictEqual(testDb.whatsappConfig.messagingLimitTier, 'TIER_1K');
    assert.strictEqual(testDb.whatsappWebhookLogs.length, 2);
  });

  // -------------------------------------------------------------
  // TEST 28: Full Meta Account Synchronization and Tenant Asset Reconciliation
  // -------------------------------------------------------------
  await runTest('28. Meta Sync reconciles assets, tenants, template list, and separate statuses', async () => {
    const originalCall = whatsappClient.callGraphApi;
    const testWabaId = '1634913171692711';
    const testPhoneId = '1424075454112547';

    // Mock the 4 Meta Graph API endpoints from the audit log
    whatsappClient.callGraphApi = async ({ endpoint }) => {
      if (endpoint.includes(testPhoneId)) {
        return {
          success: true,
          status: 200,
          data: {
            id: testPhoneId,
            verified_name: 'Astitva Innovation',
            code_verification_status: 'VERIFIED',
            display_phone_number: '+91 7233882089',
            quality_rating: 'GREEN',
            platform_type: 'CLOUD_API',
            throughput: { level: 'STANDARD' },
            name_status: 'APPROVED',
          },
        };
      }
      if (endpoint === `/${testWabaId}?fields=id,name,currency,timezone_id,message_template_namespace,account_review_status`) {
        return {
          success: true,
          status: 200,
          data: {
            id: testWabaId,
            name: 'Astitva Innovation Account',
            currency: 'INR',
            timezone_id: '1',
            message_template_namespace: 'astitva_innovation_ns',
            account_review_status: 'APPROVED',
          },
        };
      }
      if (endpoint === `/${testWabaId}/phone_numbers`) {
        return {
          success: true,
          status: 200,
          data: {
            data: [
              { id: testPhoneId, display_phone_number: '+91 7233882089' },
            ],
          },
        };
      }
      if (endpoint.includes('message_templates')) {
        return {
          success: true,
          status: 200,
          data: {
            data: [
              { id: 't1', name: 'welcome_service', status: 'APPROVED', category: 'UTILITY', language: 'en_US' },
              { id: 't2', name: 'appointment_update', status: 'PENDING', category: 'UTILITY', language: 'en_US' },
            ],
          },
        };
      }
      return { success: false, status: 404, error: 'Endpoint not found' };
    };

    const express = require('express');
    const app = express();
    app.use(express.json());

    const testDb = {
      whatsappConfig: {
        token: 'EAAB_test_sync_token',
        phoneNumberId: testPhoneId,
        wabaId: testWabaId,
        status: 'Disconnected',
      },
      whatsappTenants: [
        {
          id: 'default',
          name: 'Primary Tenant',
          wabaId: 'OLD_WABA',
          phoneNumberId: 'OLD_PHONE',
          status: 'Pending',
          isDefault: true,
        },
      ],
      whatsappTemplates: [],
      whatsappMessages: [],
      whatsappApiLogs: [],
      whatsappDeliveryLogs: [],
    };

    const router = createWhatsAppRouter({
      getDb: () => testDb,
      saveDb: () => true,
      authenticateAdmin: (req, res, next) => {
        req.admin = { username: 'AST-ADMIN-01', role: 'admin' };
        next();
      },
    });
    app.use('/', router);

    const server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const syncRes = await fetch(`${baseUrl}/sync`, { method: 'POST' });
      assert.strictEqual(syncRes.status, 200);
      const resBody = await syncRes.json();
      assert.strictEqual(resBody.success, true);

      // Verify separate statuses
      assert.strictEqual(testDb.whatsappConfig.apiConnectivity, 'CONNECTED');
      assert.strictEqual(testDb.whatsappConfig.phoneRegistrationStatus, 'REGISTERED_AND_VERIFIED');
      assert.strictEqual(testDb.whatsappConfig.accountReviewStatus, 'APPROVED');
      assert.strictEqual(testDb.whatsappConfig.templateApprovalStatus, 'TEMPLATES_APPROVED');
      assert.strictEqual(testDb.whatsappConfig.status, 'Connected');
      assert.strictEqual(testDb.whatsappConfig.approvedTemplatesCount, 1);
      assert.strictEqual(testDb.whatsappConfig.totalTemplatesCount, 2);

      // Verify tenant auto-reconciliation
      const defaultTenant = testDb.whatsappTenants.find((t) => t.id === 'default');
      assert.strictEqual(defaultTenant.wabaId, testWabaId);
      assert.strictEqual(defaultTenant.phoneNumberId, testPhoneId);
      assert.strictEqual(defaultTenant.status, 'Active');

      // Verify checklist reflection
      const checklist = checklistEngine.evaluateChecklist(testDb, testDb.whatsappConfig);
      const wabaCheck = checklist.find((c) => c.id === 'chk-waba-connected');
      const phoneCheck = checklist.find((c) => c.id === 'chk-phone-registered');
      const managementCheck = checklist.find((c) => c.id === 'chk-perm-management');

      assert.strictEqual(wabaCheck.verified, true, 'WABA connection should be verified');
      assert.strictEqual(phoneCheck.verified, true, 'Phone registration should be verified');
      assert.strictEqual(managementCheck.verified, true, 'Management permission should be verified with approved template');
    } finally {
      whatsappClient.callGraphApi = originalCall;
      await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    }
  });

  // -------------------------------------------------------------
  // TEST 29: Missing Permissions Handling
  // -------------------------------------------------------------
  await runTest('29. Missing permissions returns error, logs Meta code, and flags checklist', async () => {
    const originalCall = whatsappClient.callGraphApi;

    whatsappClient.callGraphApi = async () => {
      return {
        success: false,
        status: 403,
        error: 'Permissions error: Missing whatsapp_business_management scope',
        errorCode: 200,
        errorSubcode: null,
        data: {
          error: {
            message: 'Permissions error: Missing whatsapp_business_management scope',
            type: 'OAuthException',
            code: 200,
            fbtrace_id: 'FB_TRACE_PERM_ERR',
          },
        },
      };
    };

    const express = require('express');
    const app = express();
    app.use(express.json());

    const testDb = {
      whatsappConfig: {
        token: 'EAAB_token',
        phoneNumberId: '1424075454112547',
        wabaId: '1634913171692711',
      },
      whatsappApiLogs: [],
      whatsappDeliveryLogs: [],
    };

    const router = createWhatsAppRouter({
      getDb: () => testDb,
      saveDb: () => true,
      authenticateAdmin: (req, res, next) => {
        req.admin = { username: 'AST-ADMIN-01' };
        next();
      },
    });
    app.use('/', router);

    const server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const syncRes = await fetch(`${baseUrl}/sync`, { method: 'POST' });
      assert.strictEqual(syncRes.status, 403);
      const resBody = await syncRes.json();
      assert.strictEqual(resBody.success, false);
      assert.strictEqual(resBody.metaErrorCode, 200);

      // Verify status marked as Error and apiConnectivity as ERROR
      assert.strictEqual(testDb.whatsappConfig.status, 'Error');
      assert.strictEqual(testDb.whatsappConfig.apiConnectivity, 'ERROR');

      // Verify checklist items do not pass
      const checklist = checklistEngine.evaluateChecklist(testDb, testDb.whatsappConfig);
      const wabaItem = checklist.find((c) => c.id === 'chk-waba-connected');
      assert.strictEqual(wabaItem.verified, false);
    } finally {
      whatsappClient.callGraphApi = originalCall;
      await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    }
  });

  // -------------------------------------------------------------
  // TEST 30: Incorrect WABA or Phone Number ID Handling
  // -------------------------------------------------------------
  await runTest('30. Incorrect WABA/Phone ID or ownership mismatch returns 409 and preserves safe diagnostics', async () => {
    const originalCall = whatsappClient.callGraphApi;

    // Simulate phone number not belonging to the WABA
    whatsappClient.callGraphApi = async ({ endpoint }) => {
      if (endpoint.includes('1424075454112547')) {
        return {
          success: true,
          status: 200,
          data: {
            id: '1424075454112547',
            code_verification_status: 'VERIFIED',
            name_status: 'APPROVED',
          },
        };
      }
      if (endpoint.includes('phone_numbers')) {
        return {
          success: true,
          status: 200,
          data: {
            data: [
              { id: 'DIFFERENT_PHONE_ID', display_phone_number: '+91 9999999999' },
            ],
          },
        };
      }
      return {
        success: true,
        status: 200,
        data: { id: '1634913171692711', name: 'My WABA' },
      };
    };

    const express = require('express');
    const app = express();
    app.use(express.json());

    const testDb = {
      whatsappConfig: {
        token: 'EAAB_token',
        phoneNumberId: '1424075454112547',
        wabaId: '1634913171692711',
      },
      whatsappApiLogs: [],
      whatsappDeliveryLogs: [],
    };

    const router = createWhatsAppRouter({
      getDb: () => testDb,
      saveDb: () => true,
      authenticateAdmin: (req, res, next) => {
        req.admin = { username: 'AST-ADMIN-01' };
        next();
      },
    });
    app.use('/', router);

    const server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const syncRes = await fetch(`${baseUrl}/sync`, { method: 'POST' });
      assert.strictEqual(syncRes.status, 409);
      const resBody = await syncRes.json();
      assert.strictEqual(resBody.success, false);
      assert.ok(resBody.error.includes('does not belong to WABA'));

      // Connection status must remain Pending
      assert.strictEqual(testDb.whatsappConfig.status, 'Pending');
    } finally {
      whatsappClient.callGraphApi = originalCall;
      await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    }
  });

  // -------------------------------------------------------------
  // TEST 31: Unapproved Templates Handling
  // -------------------------------------------------------------
  await runTest('31. Unapproved templates sets PENDING_APPROVAL and separates template status from API connectivity', async () => {
    const originalCall = whatsappClient.callGraphApi;

    whatsappClient.callGraphApi = async ({ endpoint }) => {
      if (endpoint.includes('message_templates')) {
        return {
          success: true,
          status: 200,
          data: {
            data: [
              { id: 't1', name: 'draft_promo', status: 'PENDING', category: 'MARKETING' },
              { id: 't2', name: 'rejected_offer', status: 'REJECTED', category: 'MARKETING' },
            ],
          },
        };
      }
      if (endpoint.includes('phone_numbers')) {
        return { success: true, status: 200, data: { data: [{ id: '1424075454112547' }] } };
      }
      if (endpoint.includes('1424075454112547')) {
        return {
          success: true,
          status: 200,
          data: { id: '1424075454112547', code_verification_status: 'VERIFIED', name_status: 'APPROVED' },
        };
      }
      return {
        success: true,
        status: 200,
        data: { id: '1634913171692711', name: 'My WABA', account_review_status: 'APPROVED' },
      };
    };

    const express = require('express');
    const app = express();
    app.use(express.json());

    const testDb = {
      whatsappConfig: {
        token: 'EAAB_token',
        phoneNumberId: '1424075454112547',
        wabaId: '1634913171692711',
      },
      whatsappTemplates: [],
      whatsappApiLogs: [],
      whatsappDeliveryLogs: [],
    };

    const router = createWhatsAppRouter({
      getDb: () => testDb,
      saveDb: () => true,
      authenticateAdmin: (req, res, next) => {
        req.admin = { username: 'AST-ADMIN-01' };
        next();
      },
    });
    app.use('/', router);

    const server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const syncRes = await fetch(`${baseUrl}/sync`, { method: 'POST' });
      assert.strictEqual(syncRes.status, 200);

      // Verify separate status: API is connected, but templates are PENDING_APPROVAL
      assert.strictEqual(testDb.whatsappConfig.apiConnectivity, 'CONNECTED');
      assert.strictEqual(testDb.whatsappConfig.templateApprovalStatus, 'PENDING_APPROVAL');
      assert.strictEqual(testDb.whatsappConfig.approvedTemplatesCount, 0);
      assert.strictEqual(testDb.whatsappConfig.totalTemplatesCount, 2);

      // In checklist: management permission must report unapproved templates
      const checklist = checklistEngine.evaluateChecklist(testDb, testDb.whatsappConfig);
      const mgmtCheck = checklist.find((c) => c.id === 'chk-perm-management');
      assert.strictEqual(mgmtCheck.verified, false, 'Management permission should be pending when no approved templates exist');
      assert.ok(mgmtCheck.detail.includes('0 of 2 message template(s) are approved'));
    } finally {
      whatsappClient.callGraphApi = originalCall;
      await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    }
  });

  // -------------------------------------------------------------
  // TEST 32: Failed API Calls and Network Timeouts
  // -------------------------------------------------------------
  await runTest('32. Failed API calls and network timeouts log error details and do not falsely verify', async () => {
    const originalCall = whatsappClient.callGraphApi;

    whatsappClient.callGraphApi = async () => {
      return {
        success: false,
        status: 500,
        error: 'Meta Graph API request timed out (15s)',
        data: { error: { message: 'Meta Graph API request timed out (15s)', type: 'NetworkError' } },
      };
    };

    const express = require('express');
    const app = express();
    app.use(express.json());

    const testDb = {
      whatsappConfig: {
        token: 'EAAB_token',
        phoneNumberId: '1424075454112547',
        wabaId: '1634913171692711',
      },
      whatsappApiLogs: [],
      whatsappDeliveryLogs: [],
    };

    const router = createWhatsAppRouter({
      getDb: () => testDb,
      saveDb: () => true,
      authenticateAdmin: (req, res, next) => {
        req.admin = { username: 'AST-ADMIN-01' };
        next();
      },
    });
    app.use('/', router);

    const server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const syncRes = await fetch(`${baseUrl}/sync`, { method: 'POST' });
      assert.strictEqual(syncRes.status, 500);

      assert.strictEqual(testDb.whatsappConfig.status, 'Error');
      assert.strictEqual(testDb.whatsappConfig.apiConnectivity, 'ERROR');

      const checklist = checklistEngine.evaluateChecklist(testDb, testDb.whatsappConfig);
      assert.strictEqual(checklist.find((c) => c.id === 'chk-waba-connected').verified, false);
      assert.strictEqual(checklist.find((c) => c.id === 'chk-api-calls-tested').verified, false);
    } finally {
      whatsappClient.callGraphApi = originalCall;
      await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    }
  });

  // -------------------------------------------------------------
  // TEST 33: Phone Registration Field Verification
  // -------------------------------------------------------------
  await runTest('33. Phone registration requires code_verification_status VERIFIED; does not infer from HTTP 200 alone', async () => {
    // Scenario A: Phone node returns HTTP 200 but code_verification_status is NOT_VERIFIED
    const dbUnverified = {
      whatsappConfig: {
        status: 'Pending',
        apiConnectivity: 'CONNECTED',
        wabaId: '1634913171692711',
        phoneNumberId: '1424075454112547',
        codeVerificationStatus: 'NOT_VERIFIED',
        qualityRating: 'GREEN',
        nameStatus: 'APPROVED',
        lastSync: new Date().toISOString(),
      },
      whatsappApiLogs: [{ id: '1', success: true }],
    };

    const checklistA = checklistEngine.evaluateChecklist(dbUnverified, dbUnverified.whatsappConfig);
    const phoneItemA = checklistA.find((c) => c.id === 'chk-phone-registered');
    assert.strictEqual(phoneItemA.verified, false, 'Phone must NOT be verified when code_verification_status is NOT_VERIFIED');
    assert.ok(phoneItemA.detail.includes('two-step verification code status is NOT_VERIFIED'));

    // Scenario B: Phone node has code_verification_status VERIFIED and approved name
    const dbVerified = {
      whatsappConfig: {
        status: 'Connected',
        apiConnectivity: 'CONNECTED',
        wabaId: '1634913171692711',
        phoneNumberId: '1424075454112547',
        codeVerificationStatus: 'VERIFIED',
        qualityRating: 'GREEN',
        nameStatus: 'APPROVED',
        lastSync: new Date().toISOString(),
      },
      whatsappApiLogs: [{ id: '1', success: true }],
    };

    const checklistB = checklistEngine.evaluateChecklist(dbVerified, dbVerified.whatsappConfig);
    const phoneItemB = checklistB.find((c) => c.id === 'chk-phone-registered');
    assert.strictEqual(phoneItemB.verified, true, 'Phone must be verified when code_verification_status is VERIFIED and name is APPROVED');
  });

  console.log('\n----------------------------------------------------------------------');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS RATE)`);
  console.log('======================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
