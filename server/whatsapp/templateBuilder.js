/**
 * Official Meta WhatsApp Cloud API Template Request Builder & Parameter Validator
 * Strictly adheres to Meta Graph API v20.0 specification for Template Messages.
 *
 * Prevents Meta Error #132000 ("Number of parameters does not match the expected number of params")
 * by analyzing exact component requirements from the approved template definition.
 */

/**
 * Inspect an approved Meta message template definition
 * Analyzes HEADER, BODY, and BUTTONS components for variable placeholders ({{1}}, {{2}}, etc.)
 *
 * @param {Object} template - The template definition from Meta Graph API or DB
 * @returns {Object} Inspection summary with variable counts and component requirements
 */
function inspectTemplate(template) {
  if (!template || typeof template !== 'object') {
    throw new Error('Invalid template definition: expected an object.');
  }

  const components = Array.isArray(template.components) ? template.components : [];

  const result = {
    name: template.name || '',
    category: template.category || 'UTILITY',
    language: template.language || 'en_US',
    status: template.status || 'APPROVED',
    header: {
      type: 'header',
      format: null,
      variableCount: 0,
      variables: [],
      text: null,
    },
    body: {
      type: 'body',
      variableCount: 0,
      variables: [],
      text: '',
    },
    buttons: [],
    totalVariableCount: 0,
    expectedComponents: [],
  };

  for (const comp of components) {
    const compType = String(comp.type || '').toUpperCase();

    if (compType === 'HEADER') {
      const format = String(comp.format || 'TEXT').toUpperCase();
      result.header.format = format;
      result.header.text = comp.text || null;

      if (format === 'TEXT' && typeof comp.text === 'string') {
        const matches = Array.from(comp.text.matchAll(/\{\{(\d+)\}\}/g));
        const vars = Array.from(new Set(matches.map((m) => m[1]))).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        result.header.variables = vars;
        result.header.variableCount = vars.length;
      } else if (['IMAGE', 'DOCUMENT', 'VIDEO', 'LOCATION'].includes(format)) {
        // Media header requires 1 media parameter
        result.header.variableCount = 1;
        result.header.variables = ['media'];
      }

      if (result.header.variableCount > 0) {
        result.expectedComponents.push('header');
      }
    } else if (compType === 'BODY') {
      const text = String(comp.text || '');
      result.body.text = text;
      const matches = Array.from(text.matchAll(/\{\{(\d+)\}\}/g));
      const vars = Array.from(new Set(matches.map((m) => m[1]))).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
      result.body.variables = vars;
      result.body.variableCount = vars.length;

      if (result.body.variableCount > 0) {
        result.expectedComponents.push('body');
      }
    } else if (compType === 'BUTTONS' && Array.isArray(comp.buttons)) {
      comp.buttons.forEach((btn, idx) => {
        const btnType = String(btn.type || '').toUpperCase();
        const btnUrl = btn.url || '';
        let hasVariable = false;
        let variableCount = 0;

        if (btnType === 'URL') {
          // Dynamic URL contains {{1}} placeholder
          hasVariable = /\{\{(\d+)\}\}/.test(btnUrl);
          variableCount = hasVariable ? 1 : 0;
        } else if (btnType === 'QUICK_REPLY' && btn.payload && /\{\{(\d+)\}\}/.test(btn.payload)) {
          hasVariable = true;
          variableCount = 1;
        }

        const buttonDef = {
          index: idx,
          type: btnType,
          sub_type: btnType.toLowerCase(),
          text: btn.text || '',
          url: btnUrl,
          hasVariable,
          variableCount,
        };

        result.buttons.push(buttonDef);
        if (hasVariable) {
          result.expectedComponents.push(`button_${idx}`);
        }
      });
    }
  }

  const buttonVarCount = result.buttons.reduce((sum, b) => sum + b.variableCount, 0);
  result.totalVariableCount = result.header.variableCount + result.body.variableCount + buttonVarCount;

  return result;
}

/**
 * Builds Meta-compliant components array from input parameters and template definition.
 * Strictly guarantees that each component contains ONLY the parameters required by that component.
 *
 * @param {Object} template - The template definition
 * @param {Object|Array} inputs - The input parameters (array of strings, object with components/variables, or raw components)
 * @returns {Object} { success: boolean, components: Array, languageCode: string, error?: string, details?: Object }
 */
function buildTemplateComponents(template, inputs = {}) {
  const inspection = inspectTemplate(template);
  const languageCode = template.language || 'en_US';

  // CASE 1: Template expects ZERO parameters (e.g., 3p_direct_integration_test_template)
  if (inspection.totalVariableCount === 0) {
    return {
      success: true,
      components: [], // Zero components to send to Meta
      languageCode,
      inspection,
    };
  }

  // Determine input structure
  let headerParams = [];
  let bodyParams = [];
  const buttonParamsMap = {}; // index -> [params]

  // If inputs is an array of raw components already structured
  const isComponentArray = Array.isArray(inputs) && inputs.length > 0 && typeof inputs[0] === 'object' && ('type' in inputs[0] || 'parameters' in inputs[0]);
  const hasComponentsProp = inputs && typeof inputs === 'object' && Array.isArray(inputs.components);

  if (isComponentArray || hasComponentsProp) {
    const rawComponents = isComponentArray ? inputs : inputs.components;

    for (const c of rawComponents) {
      const type = String(c.type || '').toLowerCase();
      if (type === 'header' && Array.isArray(c.parameters)) {
        headerParams = c.parameters.map((p) => (typeof p === 'object' && p.type ? p : { type: 'text', text: String(p) }));
      } else if (type === 'body' && Array.isArray(c.parameters)) {
        bodyParams = c.parameters.map((p) => (typeof p === 'object' && p.type ? p : { type: 'text', text: String(p) }));
      } else if (type === 'button') {
        const idx = parseInt(c.index ?? 0, 10);
        buttonParamsMap[idx] = Array.isArray(c.parameters)
          ? c.parameters.map((p) => (typeof p === 'object' && p.type ? p : { type: 'text', text: String(p) }))
          : [];
      }
    }
  } else if (
    Array.isArray(inputs) ||
    (inputs && (Array.isArray(inputs.parameters) || Array.isArray(inputs.previewValues) || Array.isArray(inputs.params)))
  ) {
    // Positional flat parameters array (e.g. ['Ansh', 'Web Development', 'https://astitvainnovation.in/'])
    const flatParams = Array.isArray(inputs)
      ? inputs
      : Array.isArray(inputs.parameters)
        ? inputs.parameters
        : Array.isArray(inputs.previewValues)
          ? inputs.previewValues
          : inputs.params;

    let offset = 0;

    // 1. Consume for Header if header expects text variable
    if (inspection.header.variableCount > 0) {
      for (let i = 0; i < inspection.header.variableCount; i++) {
        const val = flatParams[offset++];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          headerParams.push(typeof val === 'object' && val.type ? val : { type: 'text', text: String(val).trim() });
        }
      }
    }

    // 2. Consume for Body (only up to body variable count!)
    if (inspection.body.variableCount > 0) {
      for (let i = 0; i < inspection.body.variableCount; i++) {
        const val = flatParams[offset++];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          bodyParams.push(typeof val === 'object' && val.type ? val : { type: 'text', text: String(val).trim() });
        }
      }
    }

    // 3. Consume for dynamic Buttons
    for (const btn of inspection.buttons) {
      if (btn.hasVariable) {
        const val = flatParams[offset++];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          buttonParamsMap[btn.index] = [
            typeof val === 'object' && val.type ? val : { type: 'text', text: String(val).trim() }
          ];
        }
      }
    }
  } else if (inputs && typeof inputs === 'object') {
    // Keyed object inputs: e.g. { body: ['Ansh', 'Web Dev'], buttons: [{ index: 0, text: 'https://...' }] }
    // or { '1': 'Ansh', '2': 'Web Dev', '3': 'https://...' }
    // or { 'body_1': 'Ansh', 'button_0': 'https://...' }

    if (Array.isArray(inputs.header)) {
      headerParams = inputs.header.map((v) => (typeof v === 'object' && v.type ? v : { type: 'text', text: String(v) }));
    }
    if (Array.isArray(inputs.body)) {
      bodyParams = inputs.body.map((v) => (typeof v === 'object' && v.type ? v : { type: 'text', text: String(v) }));
    }
    if (inputs.buttons && typeof inputs.buttons === 'object') {
      if (Array.isArray(inputs.buttons)) {
        inputs.buttons.forEach((b, idx) => {
          const btnIndex = b.index !== undefined ? b.index : idx;
          const param = b.text ? { type: 'text', text: String(b.text) } : (b.parameters ? b.parameters[0] : null);
          if (param) buttonParamsMap[btnIndex] = [param];
        });
      } else {
        for (const [k, v] of Object.entries(inputs.buttons)) {
          const idx = parseInt(k, 10);
          buttonParamsMap[idx] = Array.isArray(v) ? v : [{ type: 'text', text: String(v) }];
        }
      }
    }

    // Check if indexed variables like '1', '2', '3' or 'body_1' were provided
    const variables = inputs.variables || inputs;
    if (bodyParams.length === 0 && inspection.body.variableCount > 0) {
      inspection.body.variables.forEach((varKey) => {
        const val = variables[varKey] || variables[`body_${varKey}`] || variables[`var_${varKey}`];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          bodyParams.push({ type: 'text', text: String(val).trim() });
        }
      });
    }

    if (headerParams.length === 0 && inspection.header.variableCount > 0) {
      inspection.header.variables.forEach((varKey) => {
        const val = variables[`header_${varKey}`] || variables[`header`];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          headerParams.push({ type: 'text', text: String(val).trim() });
        }
      });
    }

    inspection.buttons.forEach((btn) => {
      if (btn.hasVariable && !buttonParamsMap[btn.index]) {
        const val = variables[`button_${btn.index}`] || variables[`url_button_${btn.index}`] || variables[`button`];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          buttonParamsMap[btn.index] = [{ type: 'text', text: String(val).trim() }];
        }
      }
    });
  }

  // Parameter Count Validation & Component Packaging
  const finalComponents = [];

  // Validate Header
  if (inspection.header.variableCount > 0) {
    if (headerParams.length < inspection.header.variableCount) {
      return {
        success: false,
        error: `Parameter count mismatch for HEADER: Template "${template.name}" expects ${inspection.header.variableCount} parameter(s), but received ${headerParams.length}.`,
        details: { component: 'header', expected: inspection.header.variableCount, received: headerParams.length },
      };
    }
    // Trim extra parameters to exact expected count
    finalComponents.push({
      type: 'header',
      parameters: headerParams.slice(0, inspection.header.variableCount),
    });
  }

  // Validate Body
  if (inspection.body.variableCount > 0) {
    if (bodyParams.length < inspection.body.variableCount) {
      return {
        success: false,
        error: `Parameter count mismatch for BODY: Template "${template.name}" expects ${inspection.body.variableCount} parameter(s), but received ${bodyParams.length}.`,
        details: { component: 'body', expected: inspection.body.variableCount, received: bodyParams.length },
      };
    }
    // Trim extra parameters to exact expected count
    finalComponents.push({
      type: 'body',
      parameters: bodyParams.slice(0, inspection.body.variableCount),
    });
  }

  // Validate Buttons
  for (const btn of inspection.buttons) {
    if (btn.hasVariable) {
      const params = buttonParamsMap[btn.index] || [];
      if (params.length === 0) {
        return {
          success: false,
          error: `Parameter count mismatch for BUTTON [${btn.index}]: URL button expects dynamic parameter, but none was provided.`,
          details: { component: 'button', index: btn.index, expected: 1, received: 0 },
        };
      }
      finalComponents.push({
        type: 'button',
        sub_type: btn.sub_type || 'url',
        index: String(btn.index),
        parameters: params.slice(0, 1),
      });
    }
  }

  return {
    success: true,
    components: finalComponents,
    languageCode,
    inspection,
  };
}

/**
 * Builds the complete Graph API /messages payload
 *
 * @param {Object} options
 * @param {string} options.to - Recipient phone number
 * @param {Object} options.template - Approved template definition
 * @param {string} [options.languageCode] - Optional override/check language code
 * @param {Object|Array} [options.inputs] - Parameters or variable inputs
 * @param {Array} [options.components] - Pre-built components array
 * @returns {Object} Fully compliant Meta Graph API payload
 */
function buildGraphApiPayload({ to, template, languageCode, inputs, components }) {
  if (!to) {
    throw new Error('Recipient destination phone number (to) is required.');
  }
  if (!template || !template.name) {
    throw new Error('Valid template definition with a template name is required.');
  }

  const cleanTo = String(to).replace(/\D/g, '');
  if (cleanTo.length < 10 || cleanTo.length > 15) {
    throw new Error(`Invalid recipient phone number "${to}". Must contain 10-15 digits including country code.`);
  }

  // Build and validate components
  const buildResult = buildTemplateComponents(template, components || inputs || {});
  if (!buildResult.success) {
    const err = new Error(buildResult.error);
    err.details = buildResult.details;
    err.code = 132000; // Meta Error #132000 equivalent caught at request builder layer
    throw err;
  }

  // Language code must match approved template definition
  const resolvedLanguage = template.language || languageCode || 'en_US';

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanTo,
    type: 'template',
    template: {
      name: template.name,
      language: {
        code: resolvedLanguage,
      },
    },
  };

  // Only attach components if there are non-empty components
  if (buildResult.components.length > 0) {
    payload.template.components = buildResult.components;
  }

  return {
    payload,
    inspection: buildResult.inspection,
    components: buildResult.components,
    languageCode: resolvedLanguage,
  };
}

module.exports = {
  inspectTemplate,
  buildTemplateComponents,
  buildGraphApiPayload,
};
