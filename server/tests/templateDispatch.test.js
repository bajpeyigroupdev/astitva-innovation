const assert = require('assert');
const express = require('express');
const whatsappClient = require('../whatsapp/whatsappClient');
const templateBuilder = require('../whatsapp/templateBuilder');
const createWhatsAppRouter = require('../whatsapp/whatsappRoutes');

console.log('======================================================================');
console.log('ASTITVA INNOVATION — META WHATSAPP TEMPLATE DISPATCH TEST SUITE');
console.log('Testing Parameter Validation, Component Mapping & Error #132000 Prevention');
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
    process.exitCode = 1;
  }
}

async function runAllTests() {
  // Mock template definitions
  const staticTestTemplate = {
    id: 'tmpl_3p_direct_integration_test',
    name: '3p_direct_integration_test_template',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    components: [
      {
        type: 'BODY',
        text: 'Integration Test: Welcome! This is a test message from the WhatsApp Business Platform. You have successfully configured your WhatsApp Business account and completed onboarding. You can now start sending messages to your customers.',
      },
    ],
  };

  const bodyAndButtonTemplate = {
    id: 'tmpl_consultation_proposal_v1',
    name: 'astitva_consultation_proposal',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    components: [
      {
        type: 'BODY',
        text: 'Hello {{1}}, your consultation on {{2}} is confirmed.',
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'View Proposal',
            url: 'https://astitvainnovation.in/proposals/{{1}}',
          },
        ],
      },
    ],
  };

  const fullComponentTemplate = {
    id: 'tmpl_full_v1',
    name: 'astitva_full_service_alert',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Dear {{1}}',
      },
      {
        type: 'BODY',
        text: 'Your service {{1}} is active.',
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Portal',
            url: 'https://astitvainnovation.in/{{1}}',
          },
        ],
      },
    ],
  };

  // -------------------------------------------------------------------
  // TEST 1: Inspect 3p_direct_integration_test_template definition
  // -------------------------------------------------------------------
  await runTest('1. Exact approved definition of 3p_direct_integration_test_template has 0 variables', () => {
    const inspection = templateBuilder.inspectTemplate(staticTestTemplate);

    assert.strictEqual(inspection.name, '3p_direct_integration_test_template');
    assert.strictEqual(inspection.category, 'UTILITY');
    assert.strictEqual(inspection.status, 'APPROVED');
    assert.strictEqual(inspection.language, 'en_US');
    assert.strictEqual(inspection.body.variableCount, 0, 'Body must have 0 variables');
    assert.strictEqual(inspection.header.variableCount, 0, 'Header must have 0 variables');
    assert.strictEqual(inspection.buttons.length, 0, 'Buttons must have 0 entries');
    assert.strictEqual(inspection.totalVariableCount, 0, 'Total variable count must be 0');
  });

  // -------------------------------------------------------------------
  // TEST 2: Request builder prevents Error #132000 for 3p_direct_integration_test_template
  // -------------------------------------------------------------------
  await runTest('2. Request builder strips preview values for 0-parameter template (Prevents #132000)', () => {
    const previewValues = ['Ansh', 'Web Development', 'https://astitvainnovation.in/'];
    const result = templateBuilder.buildTemplateComponents(staticTestTemplate, { previewValues });

    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.components, [], 'Components must be empty array');

    const built = templateBuilder.buildGraphApiPayload({
      to: '+91 7233882089',
      template: staticTestTemplate,
      inputs: previewValues,
    });

    assert.strictEqual(built.payload.messaging_product, 'whatsapp');
    assert.strictEqual(built.payload.to, '917233882089');
    assert.strictEqual(built.payload.template.name, '3p_direct_integration_test_template');
    assert.strictEqual(built.payload.template.language.code, 'en_US');
    assert.strictEqual(built.payload.template.components, undefined, 'components property should be omitted when empty');
  });

  // -------------------------------------------------------------------
  // TEST 3: Correct component distribution for Body + URL Button template
  // -------------------------------------------------------------------
  await runTest('3. Request builder distributes 3 inputs to 2 Body params and 1 URL Button param', () => {
    const previewValues = ['Ansh', 'Web Development', 'https://astitvainnovation.in/'];
    const built = templateBuilder.buildGraphApiPayload({
      to: '917233882089',
      template: bodyAndButtonTemplate,
      inputs: previewValues,
    });

    const components = built.payload.template.components;
    assert.ok(Array.isArray(components), 'Components array must be present');
    assert.strictEqual(components.length, 2, 'Should have exactly 2 components (body + button)');

    // Body component checks
    const bodyComp = components.find((c) => c.type === 'body');
    assert.ok(bodyComp, 'Body component must be present');
    assert.strictEqual(bodyComp.parameters.length, 2, 'Body must contain exactly 2 parameters');
    assert.strictEqual(bodyComp.parameters[0].text, 'Ansh');
    assert.strictEqual(bodyComp.parameters[1].text, 'Web Development');

    // Button component checks
    const btnComp = components.find((c) => c.type === 'button');
    assert.ok(btnComp, 'Button component must be present');
    assert.strictEqual(btnComp.sub_type, 'url', 'Button sub_type must be lowercase "url"');
    assert.strictEqual(btnComp.index, '0', 'Button index must be "0"');
    assert.strictEqual(btnComp.parameters.length, 1, 'Button must contain exactly 1 parameter');
    assert.strictEqual(btnComp.parameters[0].text, 'https://astitvainnovation.in/');
  });

  // -------------------------------------------------------------------
  // TEST 4: Distribution across HEADER, BODY, and URL BUTTON
  // -------------------------------------------------------------------
  await runTest('4. Request builder distributes inputs across HEADER, BODY, and URL BUTTON', () => {
    const previewValues = ['Ansh', 'Web Development', 'https://astitvainnovation.in/'];
    const built = templateBuilder.buildGraphApiPayload({
      to: '917233882089',
      template: fullComponentTemplate,
      inputs: previewValues,
    });

    const components = built.payload.template.components;
    assert.strictEqual(components.length, 3, 'Must have header, body, and button components');

    const header = components.find((c) => c.type === 'header');
    assert.strictEqual(header.parameters.length, 1);
    assert.strictEqual(header.parameters[0].text, 'Ansh');

    const body = components.find((c) => c.type === 'body');
    assert.strictEqual(body.parameters.length, 1);
    assert.strictEqual(body.parameters[0].text, 'Web Development');

    const btn = components.find((c) => c.type === 'button');
    assert.strictEqual(btn.sub_type, 'url');
    assert.strictEqual(btn.index, '0');
    assert.strictEqual(btn.parameters.length, 1);
    assert.strictEqual(btn.parameters[0].text, 'https://astitvainnovation.in/');
  });

  // -------------------------------------------------------------------
  // TEST 5: Surplus parameters do not spill into body
  // -------------------------------------------------------------------
  await runTest('5. Extra/surplus parameters are trimmed and do not cause #132000 parameter overflow', () => {
    const surplusInputs = ['Ansh', 'Web Development', 'extra_1', 'extra_2', 'extra_3'];
    const built = templateBuilder.buildGraphApiPayload({
      to: '917233882089',
      template: {
        name: 'two_var_body_template',
        category: 'UTILITY',
        language: 'en_US',
        status: 'APPROVED',
        components: [{ type: 'BODY', text: 'Hello {{1}}, code {{2}}.' }],
      },
      inputs: surplusInputs,
    });

    const bodyComp = built.payload.template.components.find((c) => c.type === 'body');
    assert.strictEqual(bodyComp.parameters.length, 2, 'Body must only receive the expected 2 parameters');
    assert.strictEqual(bodyComp.parameters[0].text, 'Ansh');
    assert.strictEqual(bodyComp.parameters[1].text, 'Web Development');
  });

  // -------------------------------------------------------------------
  // TEST 6: Missing parameters trigger early 400 validation error
  // -------------------------------------------------------------------
  await runTest('6. Missing parameters are rejected early with clear error description', () => {
    assert.throws(
      () => {
        templateBuilder.buildGraphApiPayload({
          to: '917233882089',
          template: bodyAndButtonTemplate,
          inputs: ['Ansh'], // Missing 2nd body param and button param
        });
      },
      (err) => {
        assert.ok(err.message.includes('Parameter count mismatch for BODY'));
        assert.strictEqual(err.code, 132000);
        return true;
      }
    );
  });

  // -------------------------------------------------------------------
  // TEST 7: Template language matches approved language exactly
  // -------------------------------------------------------------------
  await runTest('7. Template language matches approved template language exactly', () => {
    const hindiTemplate = {
      name: 'hindi_notification',
      category: 'UTILITY',
      language: 'hi_IN',
      status: 'APPROVED',
      components: [{ type: 'BODY', text: 'नमस्ते {{1}}' }],
    };

    const built = templateBuilder.buildGraphApiPayload({
      to: '917233882089',
      template: hindiTemplate,
      inputs: ['अंश'],
    });

    assert.strictEqual(built.payload.template.language.code, 'hi_IN');
  });

  // -------------------------------------------------------------------
  // TEST 8: Full End-to-End Route Dispatch with Mocked Graph API for 3p_direct_integration_test_template
  // -------------------------------------------------------------------
  await runTest('8. End-to-End /messages/send-template dispatches 3p_direct_integration_test_template without #132000', async () => {
    let capturedGraphCall = null;
    const originalCall = whatsappClient.callGraphApi;

    whatsappClient.callGraphApi = async (args) => {
      capturedGraphCall = args;
      return {
        success: true,
        status: 200,
        data: {
          messaging_product: 'whatsapp',
          contacts: [{ input: '917233882089', wa_id: '917233882089' }],
          messages: [{ id: 'wamid.HBgLMjAyNjEwMTgxMDAxAA==' }],
        },
      };
    };

    try {
      const app = express();
      app.use(express.json());

      const testDb = {
        whatsappConfig: { token: 'EAAG_TEST_TOKEN', phoneNumberId: '109823475', wabaId: 'WABA_01' },
        whatsappContacts: [],
        whatsappConversations: [],
        whatsappMessages: [],
        whatsappDeliveryLogs: [],
        whatsappTemplates: [staticTestTemplate, bodyAndButtonTemplate],
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

      // Simulate Admin Panel dispatch with the 3 preview values
      const res = await fetch(`${baseUrl}/messages/send-template`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          to: '917233882089',
          templateName: '3p_direct_integration_test_template',
          previewValues: ['Ansh', 'Web Development', 'https://astitvainnovation.in/'],
        }),
      });

      assert.strictEqual(res.status, 200);
      const resBody = await res.json();
      assert.strictEqual(resBody.success, true);
      assert.strictEqual(resBody.messageId, 'wamid.HBgLMjAyNjEwMTgxMDAxAA==');

      // Verify the payload sent to Meta Graph API
      assert.ok(capturedGraphCall);
      assert.strictEqual(capturedGraphCall.endpoint, '/109823475/messages');
      assert.strictEqual(capturedGraphCall.method, 'POST');

      const metaPayload = capturedGraphCall.body;
      assert.strictEqual(metaPayload.messaging_product, 'whatsapp');
      assert.strictEqual(metaPayload.to, '917233882089');
      assert.strictEqual(metaPayload.type, 'template');
      assert.strictEqual(metaPayload.template.name, '3p_direct_integration_test_template');
      assert.strictEqual(metaPayload.template.language.code, 'en_US');
      assert.strictEqual(
        metaPayload.template.components,
        undefined,
        'Meta payload for 3p_direct_integration_test_template MUST NOT contain components parameter'
      );

      server.close();
    } finally {
      whatsappClient.callGraphApi = originalCall;
    }
  });

  // -------------------------------------------------------------------
  // TEST 9: Full End-to-End Route Dispatch for URL Button template
  // -------------------------------------------------------------------
  await runTest('9. End-to-End /messages/send-template correctly packages URL Button and Body parameters', async () => {
    let capturedGraphCall = null;
    const originalCall = whatsappClient.callGraphApi;

    whatsappClient.callGraphApi = async (args) => {
      capturedGraphCall = args;
      return {
        success: true,
        status: 200,
        data: {
          messaging_product: 'whatsapp',
          messages: [{ id: 'wamid.BUTTON_TEST_OK' }],
        },
      };
    };

    try {
      const app = express();
      app.use(express.json());

      const testDb = {
        whatsappConfig: { token: 'EAAG_TEST_TOKEN', phoneNumberId: '109823475', wabaId: 'WABA_01' },
        whatsappContacts: [],
        whatsappConversations: [],
        whatsappMessages: [],
        whatsappDeliveryLogs: [],
        whatsappTemplates: [bodyAndButtonTemplate],
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

      const res = await fetch(`${baseUrl}/messages/send-template`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          to: '917233882089',
          templateName: 'astitva_consultation_proposal',
          previewValues: ['Ansh', 'Web Development', 'https://astitvainnovation.in/'],
        }),
      });

      assert.strictEqual(res.status, 200);
      const metaPayload = capturedGraphCall.body;
      const comps = metaPayload.template.components;

      assert.strictEqual(comps.length, 2);
      const bodyComp = comps.find((c) => c.type === 'body');
      assert.strictEqual(bodyComp.parameters.length, 2);
      assert.strictEqual(bodyComp.parameters[0].text, 'Ansh');
      assert.strictEqual(bodyComp.parameters[1].text, 'Web Development');

      const btnComp = comps.find((c) => c.type === 'button');
      assert.strictEqual(btnComp.sub_type, 'url');
      assert.strictEqual(btnComp.index, '0');
      assert.strictEqual(btnComp.parameters[0].text, 'https://astitvainnovation.in/');

      server.close();
    } finally {
      whatsappClient.callGraphApi = originalCall;
    }
  });

  console.log('\n----------------------------------------------------------------------');
  console.log(`TEMPLATE DISPATCH SUITE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('======================================================================\n');
}

runAllTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
