const assert = require('assert');
const express = require('express');
const createWhatsAppRouter = require('../whatsapp/whatsappRoutes');

async function runTenantTests() {
  console.log('Testing WhatsApp Tenant Isolation and Embedded Signup Multi-Client Onboarding...');

  let testDb = {
    whatsappConfig: {
      wabaId: '100000000001',
      phoneNumberId: '200000000002',
      status: 'Connected',
      businessPhoneNumber: '+91 7233882089',
      displayName: 'Astitva Innovation',
    },
    whatsappTenants: [],
  };

  const getDb = () => testDb;
  const saveDb = (db) => {
    testDb = JSON.parse(JSON.stringify(db));
    return true;
  };

  const authenticateAdmin = (req, res, next) => {
    req.admin = { username: 'AST-ADMIN-01' };
    next();
  };

  const app = express();
  app.use(express.json());
  app.use('/api/whatsapp', createWhatsAppRouter({ getDb, saveDb, authenticateAdmin }));

  // Helper request runner using supertest-like fetch against listening app
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/whatsapp`;

  try {
    // 1. GET /api/whatsapp/tenants - should seed default tenant
    const res1 = await fetch(`${baseUrl}/tenants`);
    assert.strictEqual(res1.status, 200);
    const json1 = await res1.json();
    assert.strictEqual(json1.success, true);
    assert.strictEqual(json1.activeTenantId, 'default');
    assert.strictEqual(json1.data.length, 1);
    assert.strictEqual(json1.data[0].id, 'default');
    assert.strictEqual(json1.data[0].isDefault, true);
    assert.strictEqual(json1.data[0].wabaId, '100000000001');

    // 2. POST /api/whatsapp/tenants - create new client tenant
    const res2 = await fetch(`${baseUrl}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Client Alpha Solutions',
        clientName: 'Alpha Corp',
        clientEmail: 'admin@alpha.com',
        wabaId: '300000000003',
        phoneNumberId: '400000000004',
        displayName: 'Alpha Support',
      }),
    });
    assert.strictEqual(res2.status, 201);
    const json2 = await res2.json();
    assert.strictEqual(json2.success, true);
    assert.strictEqual(json2.data.name, 'Client Alpha Solutions');
    const newTenantId = json2.data.id;

    // 3. Switch active tenant
    const res3 = await fetch(`${baseUrl}/tenants/${newTenantId}/activate`, {
      method: 'POST',
    });
    assert.strictEqual(res3.status, 200);
    const json3 = await res3.json();
    assert.strictEqual(json3.activeTenantId, newTenantId);

    // Verify GET reflects the new active tenant
    const res4 = await fetch(`${baseUrl}/tenants`);
    const json4 = await res4.json();
    assert.strictEqual(json4.activeTenantId, newTenantId);
    assert.strictEqual(json4.count, 2);

    // 4. Update tenant
    const res5 = await fetch(`${baseUrl}/tenants/${newTenantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: 'Alpha Global Support',
      }),
    });
    assert.strictEqual(res5.status, 200);
    const json5 = await res5.json();
    assert.strictEqual(json5.data.displayName, 'Alpha Global Support');

    // 5. Delete protection for default tenant
    const res6 = await fetch(`${baseUrl}/tenants/default`, {
      method: 'DELETE',
    });
    assert.strictEqual(res6.status, 400);

    // 6. Delete client tenant
    const res7 = await fetch(`${baseUrl}/tenants/${newTenantId}`, {
      method: 'DELETE',
    });
    assert.strictEqual(res7.status, 200);

    // 7. Verify cross-tenant data isolation on conversations, contacts, messages, and delivery logs
    testDb.whatsappConversations = [
      { id: 'conv-default-1', tenantId: 'default', contactPhone: '+919876543210', lastMessage: 'Hello Default' },
      { id: 'conv-alpha-1', tenantId: 'tenant-alpha', contactPhone: '+919123456789', lastMessage: 'Hello Alpha' },
    ];
    testDb.whatsappMessages = [
      { id: 'msg-default-1', tenantId: 'default', to: '+919876543210', text: 'Msg Default' },
      { id: 'msg-alpha-1', tenantId: 'tenant-alpha', to: '+919123456789', text: 'Msg Alpha' },
    ];
    testDb.whatsappContacts = [
      { id: 'contact-default-1', tenantId: 'default', phone: '+919876543210', name: 'Contact Default' },
      { id: 'contact-alpha-1', tenantId: 'tenant-alpha', phone: '+919123456789', name: 'Contact Alpha' },
    ];
    testDb.whatsappDeliveryLogs = [
      { id: 'log-default-1', tenantId: 'default', operationType: 'SEND_TEXT', success: true },
      { id: 'log-alpha-1', tenantId: 'tenant-alpha', operationType: 'SEND_TEXT', success: true },
    ];

    // Conversations isolation
    const convAlphaRes = await fetch(`${baseUrl}/conversations?tenantId=tenant-alpha`);
    const convAlphaJson = await convAlphaRes.json();
    assert.strictEqual(convAlphaJson.data.length, 1);
    assert.strictEqual(convAlphaJson.data[0].id, 'conv-alpha-1');

    const convDefaultRes = await fetch(`${baseUrl}/conversations?tenantId=default`);
    const convDefaultJson = await convDefaultRes.json();
    assert.strictEqual(convDefaultJson.data.length, 1);
    assert.strictEqual(convDefaultJson.data[0].id, 'conv-default-1');

    // Messages isolation
    const msgAlphaRes = await fetch(`${baseUrl}/messages?tenantId=tenant-alpha`);
    const msgAlphaJson = await msgAlphaRes.json();
    assert.strictEqual(msgAlphaJson.data.length, 1);
    assert.strictEqual(msgAlphaJson.data[0].id, 'msg-alpha-1');

    const msgDefaultRes = await fetch(`${baseUrl}/messages?tenantId=default`);
    const msgDefaultJson = await msgDefaultRes.json();
    assert.strictEqual(msgDefaultJson.data.length, 1);
    assert.strictEqual(msgDefaultJson.data[0].id, 'msg-default-1');

    // Contacts isolation
    const contactAlphaRes = await fetch(`${baseUrl}/contacts?tenantId=tenant-alpha`);
    const contactAlphaJson = await contactAlphaRes.json();
    assert.strictEqual(contactAlphaJson.data.length, 1);
    assert.strictEqual(contactAlphaJson.data[0].id, 'contact-alpha-1');

    const contactDefaultRes = await fetch(`${baseUrl}/contacts?tenantId=default`);
    const contactDefaultJson = await contactDefaultRes.json();
    assert.strictEqual(contactDefaultJson.data.length, 1);
    assert.strictEqual(contactDefaultJson.data[0].id, 'contact-default-1');

    // Delivery logs isolation
    const logAlphaRes = await fetch(`${baseUrl}/delivery-logs?tenantId=tenant-alpha`);
    const logAlphaJson = await logAlphaRes.json();
    assert.strictEqual(logAlphaJson.data.length, 1);
    assert.strictEqual(logAlphaJson.data[0].id, 'log-alpha-1');

    const logDefaultRes = await fetch(`${baseUrl}/delivery-logs?tenantId=default`);
    const logDefaultJson = await logDefaultRes.json();
    assert.strictEqual(logDefaultJson.data.length, 1);
    assert.strictEqual(logDefaultJson.data[0].id, 'log-default-1');

    console.log('✓ PASS: WhatsApp tenant isolation, switching, CRUD, default safety, and data boundary verified.');
  } finally {
    server.close();
  }
}

runTenantTests().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
