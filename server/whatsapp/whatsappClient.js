const crypto = require('crypto');

/**
 * Official Meta WhatsApp Cloud API Client for Astitva Innovation
 * Implements Meta Graph API v20.0 specification
 */

const DEFAULT_GRAPH_VERSION = process.env.WHATSAPP_API_VERSION || 'v20.0';
const GRAPH_BASE_URL = 'https://graph.facebook.com';

class WhatsAppClient {
  constructor() {
    this.version = DEFAULT_GRAPH_VERSION;
  }

  /**
   * Resolve active configuration from environment or database
   */
  resolveConfig(db) {
    const dbConfig = db?.whatsappConfig || {};
    return {
      token: process.env.WHATSAPP_API_TOKEN || dbConfig.token || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || dbConfig.phoneNumberId || '',
      wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || dbConfig.wabaId || '',
      appId: process.env.WHATSAPP_APP_ID || dbConfig.appId || '',
      appSecret: process.env.WHATSAPP_APP_SECRET || dbConfig.appSecret || '',
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || dbConfig.verifyToken || '',
      apiVersion: process.env.WHATSAPP_API_VERSION || dbConfig.apiVersion || DEFAULT_GRAPH_VERSION,
      status: dbConfig.status || 'Disconnected',
    };
  }

  /**
   * Helper to redact sensitive information from logs
   */
  redactPayload(data) {
    if (!data) return data;
    try {
      const cloned = JSON.parse(JSON.stringify(data));
      const redactKeys = ['token', 'access_token', 'app_secret', 'secret', 'client_secret'];
      
      const walk = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (const k of Object.keys(obj)) {
          if (redactKeys.includes(k.toLowerCase()) && typeof obj[k] === 'string') {
            obj[k] = obj[k].length > 8 ? `${obj[k].substring(0, 4)}••••${obj[k].substring(obj[k].length - 4)}` : '••••••••';
          } else if (typeof obj[k] === 'object') {
            walk(obj[k]);
          }
        }
      };
      walk(cloned);
      return cloned;
    } catch {
      return { redacted: true };
    }
  }

  /**
   * Centralized HTTP caller for Meta Graph API with audit logging
   */
  async callGraphApi({ endpoint, method = 'GET', body = null, token, db, saveDb }) {
    const startTime = Date.now();
    const url = `${GRAPH_BASE_URL}/${this.version}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'AstitvaInnovation-WhatsAppClient/1.0',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      headers['Content-Type'] = 'application/json';
    }

    let responseStatus = 0;
    let responseData = null;
    let success = false;
    let errorMessage = null;

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      responseStatus = response.status;
      responseData = await response.json().catch(() => null);
      success = response.ok;

      if (!response.ok) {
        errorMessage = responseData?.error?.message || `Meta API Error (${response.status})`;
      }
    } catch (err) {
      responseStatus = 500;
      errorMessage = err.name === 'TimeoutError' ? 'Meta Graph API request timed out (15s)' : err.message;
      responseData = { error: { message: errorMessage, type: 'NetworkError' } };
    }

    const latencyMs = Date.now() - startTime;

    // Log Graph API call in database
    if (db && saveDb) {
      try {
        if (!Array.isArray(db.whatsappApiLogs)) {
          db.whatsappApiLogs = [];
        }
        db.whatsappApiLogs.unshift({
          id: `LOG-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
          timestamp: new Date().toISOString(),
          method,
          endpoint,
          requestPayload: this.redactPayload(body),
          responseStatus,
          responseBody: this.redactPayload(responseData),
          latencyMs,
          success,
          errorMessage,
        });

        // Keep last 250 API logs to manage database size
        if (db.whatsappApiLogs.length > 250) {
          db.whatsappApiLogs = db.whatsappApiLogs.slice(0, 250);
        }
        saveDb(db);
      } catch (logErr) {
        console.error('Failed to save WhatsApp API log:', logErr);
      }
    }

    return {
      success,
      status: responseStatus,
      data: responseData,
      latencyMs,
      error: errorMessage,
    };
  }

  /**
   * Fetch live Phone Number details from Meta Cloud API
   */
  async getPhoneNumberDetails(config, db, saveDb) {
    if (!config.token || !config.phoneNumberId) {
      return {
        success: false,
        error: 'Missing WhatsApp API Token or Phone Number ID in configuration.',
      };
    }

    const fields = 'verified_name,code_verification_status,display_phone_number,quality_rating,platform_type,throughput,name_status';
    return this.callGraphApi({
      endpoint: `/${config.phoneNumberId}?fields=${fields}`,
      method: 'GET',
      token: config.token,
      db,
      saveDb,
    });
  }

  /**
   * Fetch WABA details from Meta Cloud API
   */
  async getWabaDetails(config, db, saveDb) {
    if (!config.token || !config.wabaId) {
      return {
        success: false,
        error: 'Missing WhatsApp Business Account ID (WABA ID) in configuration.',
      };
    }

    const fields = 'id,name,currency,timezone_id,message_template_namespace,account_review_status';
    return this.callGraphApi({
      endpoint: `/${config.wabaId}?fields=${fields}`,
      method: 'GET',
      token: config.token,
      db,
      saveDb,
    });
  }

  /**
   * Fetch phone numbers under WABA
   */
  async getWabaPhoneNumbers(config, db, saveDb) {
    if (!config.token || !config.wabaId) {
      return {
        success: false,
        error: 'Missing WhatsApp Business Account ID (WABA ID) in configuration.',
      };
    }

    return this.callGraphApi({
      endpoint: `/${config.wabaId}/phone_numbers`,
      method: 'GET',
      token: config.token,
      db,
      saveDb,
    });
  }

  /**
   * Fetch approved message templates from Meta Cloud API
   */
  async getMessageTemplates(config, db, saveDb) {
    if (!config.token || !config.wabaId) {
      return {
        success: false,
        error: 'Missing WABA ID or Access Token in configuration.',
      };
    }

    return this.callGraphApi({
      endpoint: `/${config.wabaId}/message_templates?limit=100`,
      method: 'GET',
      token: config.token,
      db,
      saveDb,
    });
  }

  /**
   * Create / Submit a new message template for Meta approval
   */
  async createMessageTemplate(config, templateData, db, saveDb) {
    if (!config.token || !config.wabaId) {
      return {
        success: false,
        error: 'Missing WABA ID or Access Token in configuration.',
      };
    }

    return this.callGraphApi({
      endpoint: `/${config.wabaId}/message_templates`,
      method: 'POST',
      body: templateData,
      token: config.token,
      db,
      saveDb,
    });
  }

  /**
   * Send text message via official Meta WhatsApp Cloud API
   */
  async sendTextMessage(config, { to, text, previewUrl = false }, db, saveDb) {
    if (!config.token || !config.phoneNumberId) {
      return {
        success: false,
        error: 'WhatsApp Business API is not configured. Missing Phone Number ID or Token.',
      };
    }

    // Clean destination phone number (digits only)
    const cleanTo = String(to).replace(/\D/g, '');
    if (!cleanTo || cleanTo.length < 10) {
      return {
        success: false,
        error: `Invalid destination phone number "${to}". Must include country code with at least 10 digits.`,
      };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'text',
      text: {
        preview_url: Boolean(previewUrl),
        body: text.trim(),
      },
    };

    return this.callGraphApi({
      endpoint: `/${config.phoneNumberId}/messages`,
      method: 'POST',
      body: payload,
      token: config.token,
      db,
      saveDb,
    });
  }

  /**
   * Send approved template message via official Meta WhatsApp Cloud API
   */
  async sendTemplateMessage(config, { to, templateName, languageCode = 'en_US', components = [] }, db, saveDb) {
    if (!config.token || !config.phoneNumberId) {
      return {
        success: false,
        error: 'WhatsApp Business API is not configured. Missing Phone Number ID or Token.',
      };
    }

    const cleanTo = String(to).replace(/\D/g, '');
    if (!cleanTo || cleanTo.length < 10) {
      return {
        success: false,
        error: `Invalid destination phone number "${to}". Must include country code with at least 10 digits.`,
      };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components: Array.isArray(components) ? components : [],
      },
    };

    return this.callGraphApi({
      endpoint: `/${config.phoneNumberId}/messages`,
      method: 'POST',
      body: payload,
      token: config.token,
      db,
      saveDb,
    });
  }

  /**
   * Exchange Meta Embedded Signup OAuth authorization code for Access Token
   */
  async exchangeOAuthCode(config, code, db, saveDb) {
    if (!config.appId || !config.appSecret) {
      return {
        success: false,
        error: 'Missing Meta App ID or App Secret for OAuth token exchange.',
      };
    }

    const endpoint = `/oauth/access_token?client_id=${encodeURIComponent(config.appId)}&client_secret=${encodeURIComponent(config.appSecret)}&code=${encodeURIComponent(code)}`;

    return this.callGraphApi({
      endpoint,
      method: 'GET',
      token: null,
      db,
      saveDb,
    });
  }

  /**
   * Subscribe Webhooks App to WABA
   */
  async subscribeAppToWaba(config, db, saveDb) {
    if (!config.token || !config.wabaId) {
      return {
        success: false,
        error: 'Missing WABA ID or Access Token.',
      };
    }

    return this.callGraphApi({
      endpoint: `/${config.wabaId}/subscribed_apps`,
      method: 'POST',
      token: config.token,
      db,
      saveDb,
    });
  }

  /**
   * Helper to append a structured delivery log into db.whatsappDeliveryLogs
   */
  recordDeliveryLog(db, saveDb, {
    correlationId,
    messageId = null,
    to = '',
    operationType = 'TEXT_SEND',
    httpStatus = 200,
    metaErrorCode = null,
    metaErrorMessage = null,
    retryCount = 0,
    durationMs = 0,
    success = true,
    tenantId = 'default',
  }) {
    if (!db || !saveDb) return null;
    if (!Array.isArray(db.whatsappDeliveryLogs)) {
      db.whatsappDeliveryLogs = [];
    }
    const logEntry = {
      id: `DLV-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      correlationId: correlationId || `COR-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      timestamp: new Date().toISOString(),
      messageId,
      to: to ? String(to).replace(/\D/g, '') : '',
      operationType,
      httpStatus,
      metaErrorCode,
      metaErrorMessage: metaErrorMessage ? String(metaErrorMessage).slice(0, 300) : null,
      retryCount,
      durationMs,
      success: Boolean(success),
      tenantId: tenantId || 'default',
    };
    db.whatsappDeliveryLogs.unshift(logEntry);
    if (db.whatsappDeliveryLogs.length > 500) {
      db.whatsappDeliveryLogs = db.whatsappDeliveryLogs.slice(0, 500);
    }
    try {
      saveDb(db);
    } catch (e) {
      console.warn('Failed to save delivery log:', e.message);
    }
    return logEntry;
  }

  /**
   * Comprehensive, safe API Health Check distinguishing all 6 verification stages
   */
  async performHealthCheck(config, db, saveDb) {
    const activeConfig = config || this.resolveConfig(db);
    const messages = Array.isArray(db?.whatsappMessages) ? db.whatsappMessages : [];
    const webhookLogs = Array.isArray(db?.whatsappWebhookLogs) ? db.whatsappWebhookLogs : [];
    const checklist = Array.isArray(db?.whatsappChecklist) ? db.whatsappChecklist : [];

    // Stage 1: Credentials configured
    const hasToken = Boolean(activeConfig.token);
    const hasPhoneId = Boolean(activeConfig.phoneNumberId);
    const hasWabaId = Boolean(activeConfig.wabaId);
    const hasAppId = Boolean(activeConfig.appId);
    const hasAppSecret = Boolean(activeConfig.appSecret);
    const hasVerifyToken = Boolean(activeConfig.verifyToken);

    const credentialsConfigured = hasToken && hasPhoneId && hasWabaId;

    // Stage 2 & 3: Live API authentication & Phone accessibility
    let apiAuth = { tested: false, status: 'BLOCKED', detail: 'Missing WhatsApp API Token or WABA ID in configuration.' };
    let phoneAccess = { tested: false, status: 'BLOCKED', detail: 'Missing Phone Number ID in configuration.' };

    if (hasToken && hasWabaId) {
      try {
        const wabaRes = await this.getWabaDetails(activeConfig, db, saveDb);
        if (wabaRes.success && wabaRes.data) {
          apiAuth = {
            tested: true,
            status: 'PASS',
            detail: `Authenticated with Meta Graph API (${activeConfig.apiVersion}). Account: ${wabaRes.data.name || wabaRes.data.id}`,
            wabaName: wabaRes.data.name,
            wabaId: wabaRes.data.id,
          };
        } else {
          apiAuth = {
            tested: true,
            status: 'FAIL',
            detail: wabaRes.error || `Meta API error (${wabaRes.status})`,
            errorCode: wabaRes.data?.error?.code,
          };
        }
      } catch (err) {
        apiAuth = { tested: true, status: 'FAIL', detail: err.message };
      }
    }

    if (hasToken && hasPhoneId) {
      try {
        const phoneRes = await this.getPhoneNumberDetails(activeConfig, db, saveDb);
        if (phoneRes.success && phoneRes.data) {
          phoneAccess = {
            tested: true,
            status: 'PASS',
            detail: `Phone active (${phoneRes.data.display_phone_number || activeConfig.phoneNumberId}). Verified Name: "${phoneRes.data.verified_name || 'N/A'}", Quality: ${phoneRes.data.quality_rating || 'UNKNOWN'}`,
            displayPhoneNumber: phoneRes.data.display_phone_number,
            verifiedName: phoneRes.data.verified_name,
            qualityRating: phoneRes.data.quality_rating,
            codeVerificationStatus: phoneRes.data.code_verification_status,
          };
        } else {
          phoneAccess = {
            tested: true,
            status: 'FAIL',
            detail: phoneRes.error || `Meta Phone API error (${phoneRes.status})`,
            errorCode: phoneRes.data?.error?.code,
          };
        }
      } catch (err) {
        phoneAccess = { tested: true, status: 'FAIL', detail: err.message };
      }
    }

    // Stage 4: Webhook configured
    const lastWebhookEvent = webhookLogs[0];
    const hasVerifiedWebhook = webhookLogs.some((l) => l.signatureVerified === true);
    const webhookStatus = {
      tested: webhookLogs.length > 0,
      status: hasVerifiedWebhook ? 'PASS' : (webhookLogs.length > 0 ? 'PARTIAL' : 'NOT_TESTED'),
      detail: hasVerifiedWebhook
        ? `Webhook verified with HMAC-SHA256. ${webhookLogs.length} events logged.`
        : (webhookLogs.length > 0 ? 'Webhook events received but HMAC signature validation is pending or failed.' : 'No webhook events received yet from Meta Cloud API.'),
      lastEventTimestamp: lastWebhookEvent?.timestamp || null,
    };

    // Stage 5: End-to-end messaging tested
    const outboundSuccess = messages.filter((m) => m.direction === 'outbound' && m.status !== 'failed');
    const inboundSuccess = messages.filter((m) => m.direction === 'inbound');
    const lastOutbound = outboundSuccess[outboundSuccess.length - 1];
    const lastInbound = inboundSuccess[inboundSuccess.length - 1];

    const messagingTested = outboundSuccess.length > 0 && inboundSuccess.length > 0;
    const messagingStatus = {
      tested: messages.length > 0,
      status: messagingTested ? 'PASS' : (messages.length > 0 ? 'PARTIAL' : 'NOT_TESTED'),
      detail: messagingTested
        ? `End-to-end messaging verified (Outbound: ${outboundSuccess.length}, Inbound: ${inboundSuccess.length}).`
        : (outboundSuccess.length > 0 ? 'Outbound messaging sent, waiting for inbound webhook receipt.' : (inboundSuccess.length > 0 ? 'Inbound message received, waiting for outbound test send.' : 'No messages sent or received yet.')),
      lastOutboundTimestamp: lastOutbound?.timestamp || null,
      lastInboundTimestamp: lastInbound?.timestamp || null,
    };

    // Stage 6: Meta App Review approval
    const verifiedChecklistCount = checklist.filter((c) => c.verified || c.manuallyVerified).length;
    const totalChecklist = checklist.length || 15;
    const isApprovedInMeta = activeConfig.metaReviewApproved === true;
    const appReviewStatus = {
      tested: true,
      status: isApprovedInMeta ? 'PASS' : 'BLOCKED',
      detail: isApprovedInMeta
        ? 'Meta App Review approved and permissions active in production.'
        : `Pending Meta App Review submission & approval (${verifiedChecklistCount}/${totalChecklist} technical prerequisites verified).`,
      completionPercentage: Math.round((verifiedChecklistCount / totalChecklist) * 100),
    };

    // Overall summary status
    let overallStatus = 'Disconnected';
    if (apiAuth.status === 'PASS' && phoneAccess.status === 'PASS') {
      overallStatus = 'Connected';
    } else if (apiAuth.status === 'FAIL' || phoneAccess.status === 'FAIL') {
      overallStatus = 'Error';
    } else if (credentialsConfigured) {
      overallStatus = 'Pending';
    }

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      stages: {
        credentialsConfigured: {
          status: credentialsConfigured ? 'PASS' : 'BLOCKED',
          detail: credentialsConfigured ? 'All required credentials present.' : 'Missing required API credentials in configuration.',
          breakdown: { hasToken, hasPhoneId, hasWabaId, hasAppId, hasAppSecret, hasVerifyToken }
        },
        apiAuthentication: apiAuth,
        phoneNumberAccessible: phoneAccess,
        webhookConfigured: webhookStatus,
        messagingTested: messagingStatus,
        appReviewApproved: appReviewStatus,
      }
    };
  }
}

module.exports = new WhatsAppClient();
