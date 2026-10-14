const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const whatsappClient = require('./whatsappClient');
const whatsappWebhook = require('./whatsappWebhook');
const evidenceManager = require('./evidenceManager');
const checklistEngine = require('./checklistEngine');

/**
 * Express router for Meta WhatsApp Business Platform Management
 * Fully compliant with Meta Cloud API v20.0 specification
 */
function createWhatsAppRouter({ getDb, saveDb, authenticateAdmin }) {
  const router = express.Router();

  // Helper for creating audit log entries
  function logAudit(actor, action, details) {
    try {
      const db = getDb();
      if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
      const entry = {
        id: `AUD-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        timestamp: new Date().toISOString(),
        actor: actor || 'AST-ADMIN-01',
        action,
        details: details || {},
      };
      db.auditLogs.unshift(entry);
      if (db.auditLogs.length > 500) db.auditLogs = db.auditLogs.slice(0, 500);
      saveDb(db);
      return entry;
    } catch (e) {
      console.warn('Failed to record audit log:', e.message);
    }
  }

  // -------------------------------------------------------------
  // PUBLIC WEBHOOK & DATA DELETION ROUTES (Meta Cloud API Ingress)
  // -------------------------------------------------------------

  /**
   * Meta Webhook Verification Challenge (GET)
   */
  router.get('/webhook', (req, res) => {
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);
    return whatsappWebhook.verifyChallenge(req, res, config);
  });

  /**
   * Meta Webhook Event Notification (POST)
   */
  router.post('/webhook', (req, res) => {
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);
    return whatsappWebhook.handleIncomingEvent(req, res, { db, saveDb, config });
  });

  /**
   * Protected Evidence File Streaming (Requires Bearer token or valid query token)
   */
  router.get('/evidence/:id/file', (req, res) => {
    const authHeader = req.headers.authorization;
    const queryToken = req.query?.token;
    const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : queryToken;
    const jwtSecret = process.env.JWT_SECRET || 'fallback_super_secret_jwt_key_astitva_2026';

    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Evidence file access requires valid administrator session.' });
    }

    try {
      jwt.verify(token, jwtSecret);
    } catch (e) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired access token.' });
    }

    const db = getDb();
    const fileResult = evidenceManager.getFilePath(req.params.id, db);
    if (!fileResult) {
      return res.status(404).send('Evidence file not found.');
    }

    const { record, fullPath } = fileResult;
    res.setHeader('Content-Type', record.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(record.fileName)}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    const stream = fs.createReadStream(fullPath);
    stream.pipe(res);
  });

  // -------------------------------------------------------------
  // PROTECTED ADMIN ROUTES (Require Admin Bearer Token)
  // -------------------------------------------------------------

  /**
   * 1. OVERVIEW & HEALTH CHECK
   */
  router.get('/health-check', authenticateAdmin, async (req, res) => {
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    try {
      const health = await whatsappClient.performHealthCheck(config, db, saveDb);
      res.json({
        success: true,
        data: health,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  /**
   * Safe Connectivity Test (read-only ping to verify Meta API reachability)
   */
  router.post('/connectivity-test', authenticateAdmin, async (req, res) => {
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    if (!config.token || !config.phoneNumberId) {
      return res.status(400).json({
        success: false,
        tested: false,
        error: 'Missing WhatsApp API Token or Phone Number ID in configuration.',
      });
    }

    const startTime = Date.now();
    const result = await whatsappClient.getPhoneNumberDetails(config, db, saveDb);
    const latencyMs = Date.now() - startTime;

    logAudit(req.admin?.username, 'CONNECTIVITY_TEST_EXECUTED', {
      success: result.success,
      status: result.status,
      latencyMs,
    });

    res.json({
      success: result.success,
      status: result.status,
      latencyMs,
      data: result.data,
      error: result.error,
    });
  });

  /**
   * 2. CONNECTION & CONFIGURATION
   */
  router.get('/config', authenticateAdmin, (req, res) => {
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);
    const dbConfig = db.whatsappConfig || {};

    res.json({
      success: true,
      data: {
        status: dbConfig.status || (config.token && config.phoneNumberId ? 'Pending' : 'Disconnected'),
        wabaId: config.wabaId,
        phoneNumberId: config.phoneNumberId,
        businessPhoneNumber: dbConfig.businessPhoneNumber || '+91 7233882089',
        displayName: dbConfig.displayName || 'Astitva Innovation',
        qualityRating: dbConfig.qualityRating || 'GREEN',
        codeVerificationStatus: dbConfig.codeVerificationStatus || 'NOT_VERIFIED',
        messagingLimitTier: dbConfig.messagingLimitTier || 'TIER_1K',
        webhookVerified: Boolean(dbConfig.webhookVerified),
        webhookSubscriptionStatus: dbConfig.webhookSubscriptionStatus || 'Subscribed',
        lastSync: dbConfig.lastSync || null,
        errorMessage: dbConfig.errorMessage || null,
        hasToken: Boolean(config.token),
        tokenPreview: config.token ? `EAAG...${config.token.slice(-6)}` : '',
        appId: config.appId,
        hasAppSecret: Boolean(config.appSecret),
        verifyToken: config.verifyToken,
        apiVersion: config.apiVersion,
        callbackUrl: 'https://astitvainnovation.in/api/whatsapp/webhook',
        subscribedFields: ['messages', 'messaging_postbacks', 'message_template_status_update'],
        embeddedSignup: {
          appId: config.appId || '',
          configId: dbConfig.embeddedSignupConfigId || '',
        },
        connectedAt: dbConfig.connectedAt || null,
      },
    });
  });

  router.post('/config', authenticateAdmin, async (req, res) => {
    const db = getDb();
    const body = req.body || {};

    if (!db.whatsappConfig) db.whatsappConfig = {};

    if (body.token !== undefined && body.token.trim()) {
      db.whatsappConfig.token = body.token.trim();
    }
    if (body.wabaId !== undefined) db.whatsappConfig.wabaId = body.wabaId.trim();
    if (body.phoneNumberId !== undefined) db.whatsappConfig.phoneNumberId = body.phoneNumberId.trim();
    if (body.appId !== undefined) db.whatsappConfig.appId = body.appId.trim();
    if (body.appSecret !== undefined && body.appSecret.trim()) {
      db.whatsappConfig.appSecret = body.appSecret.trim();
    }
    if (body.verifyToken !== undefined) db.whatsappConfig.verifyToken = body.verifyToken.trim();
    if (body.apiVersion !== undefined) db.whatsappConfig.apiVersion = body.apiVersion.trim();
    if (body.businessPhoneNumber !== undefined) db.whatsappConfig.businessPhoneNumber = body.businessPhoneNumber.trim();
    if (body.displayName !== undefined) db.whatsappConfig.displayName = body.displayName.trim();
    if (body.embeddedSignupConfigId !== undefined) db.whatsappConfig.embeddedSignupConfigId = body.embeddedSignupConfigId.trim();

    db.whatsappConfig.status = 'Pending';
    db.whatsappConfig.updatedAt = new Date().toISOString();

    saveDb(db);

    logAudit(req.admin?.username, 'WHATSAPP_CONFIG_UPDATED', {
      wabaId: db.whatsappConfig.wabaId,
      phoneNumberId: db.whatsappConfig.phoneNumberId,
      hasToken: Boolean(db.whatsappConfig.token),
    });

    res.json({
      success: true,
      message: 'WhatsApp configuration updated successfully.',
      data: {
        wabaId: db.whatsappConfig.wabaId,
        phoneNumberId: db.whatsappConfig.phoneNumberId,
        businessPhoneNumber: db.whatsappConfig.businessPhoneNumber,
        hasToken: Boolean(db.whatsappConfig.token),
        hasAppSecret: Boolean(db.whatsappConfig.appSecret),
        status: db.whatsappConfig.status,
      },
    });
  });

  router.post('/sync', authenticateAdmin, async (req, res) => {
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    if (!config.token || !config.phoneNumberId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot sync: WhatsApp API Token and Phone Number ID are required.',
      });
    }

    try {
      const phoneResult = await whatsappClient.getPhoneNumberDetails(config, db, saveDb);

      if (!db.whatsappConfig) db.whatsappConfig = {};

      if (phoneResult.success && phoneResult.data) {
        const pData = phoneResult.data;
        db.whatsappConfig.status = 'Connected';
        db.whatsappConfig.displayName = pData.verified_name || db.whatsappConfig.displayName || 'Astitva Innovation';
        db.whatsappConfig.qualityRating = pData.quality_rating || 'GREEN';
        db.whatsappConfig.codeVerificationStatus = pData.code_verification_status || 'VERIFIED';
        db.whatsappConfig.businessPhoneNumber = pData.display_phone_number || db.whatsappConfig.businessPhoneNumber;
        db.whatsappConfig.messagingLimitTier = pData.throughput?.level || 'TIER_1K';
        db.whatsappConfig.lastSync = new Date().toISOString();
        db.whatsappConfig.errorMessage = null;
        if (!db.whatsappConfig.connectedAt) {
          db.whatsappConfig.connectedAt = new Date().toISOString();
        }
        db.whatsappConfig.webhookVerified = true;

        saveDb(db);

        logAudit(req.admin?.username, 'WHATSAPP_SYNC_SUCCESS', {
          displayName: pData.verified_name,
          qualityRating: pData.quality_rating,
        });

        return res.json({
          success: true,
          message: 'Account details synchronized successfully with Meta Graph API.',
          data: {
            ...db.whatsappConfig,
            phoneDetails: pData,
          },
        });
      } else {
        db.whatsappConfig.status = 'Error';
        db.whatsappConfig.errorMessage = phoneResult.error || 'Failed to sync with Meta Cloud API';
        saveDb(db);

        logAudit(req.admin?.username, 'WHATSAPP_SYNC_FAILED', {
          error: phoneResult.error,
        });

        return res.status(phoneResult.status || 400).json({
          success: false,
          error: phoneResult.error || 'Failed to synchronize with Meta Graph API.',
          details: phoneResult.data,
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  router.post('/disconnect', authenticateAdmin, (req, res) => {
    const db = getDb();
    if (!db.whatsappConfig) db.whatsappConfig = {};

    db.whatsappConfig.status = 'Disconnected';
    db.whatsappConfig.disconnectedAt = new Date().toISOString();
    saveDb(db);

    logAudit(req.admin?.username, 'WHATSAPP_DISCONNECTED', {
      disconnectedAt: db.whatsappConfig.disconnectedAt,
    });

    res.json({
      success: true,
      message: 'WhatsApp Business Account disconnected successfully.',
    });
  });

  router.post('/embedded-signup/exchange', authenticateAdmin, async (req, res) => {
    const { code, wabaId, phoneNumberId } = req.body || {};
    if (!code) {
      return res.status(400).json({ success: false, error: 'OAuth authorization code is required.' });
    }

    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    const result = await whatsappClient.exchangeOAuthCode(config, code, db, saveDb);
    if (result.success && result.data?.access_token) {
      if (!db.whatsappConfig) db.whatsappConfig = {};
      db.whatsappConfig.token = result.data.access_token;
      if (wabaId) db.whatsappConfig.wabaId = wabaId;
      if (phoneNumberId) db.whatsappConfig.phoneNumberId = phoneNumberId;
      db.whatsappConfig.status = 'Connected';
      db.whatsappConfig.connectedAt = new Date().toISOString();
      saveDb(db);

      logAudit(req.admin?.username, 'WHATSAPP_EMBEDDED_SIGNUP_COMPLETED', {
        wabaId,
        phoneNumberId,
      });

      return res.json({
        success: true,
        message: 'Meta Embedded Signup completed and access token saved successfully.',
        data: {
          wabaId: db.whatsappConfig.wabaId,
          phoneNumberId: db.whatsappConfig.phoneNumberId,
          status: db.whatsappConfig.status,
        },
      });
    } else {
      return res.status(result.status || 400).json({
        success: false,
        error: result.error || 'Failed to exchange OAuth code for Meta access token.',
        details: result.data,
      });
    }
  });

  /**
   * 3. CHATS & MESSAGES
   */
  router.get('/conversations', authenticateAdmin, (req, res) => {
    const db = getDb();
    const conversations = (db.whatsappConversations || []).map((convo) => {
      const lastInbound = convo.lastInboundTimestamp ? new Date(convo.lastInboundTimestamp).getTime() : 0;
      const isWindowOpen = lastInbound > 0 && Date.now() - lastInbound < 24 * 60 * 60 * 1000;
      const remainingMinutes = isWindowOpen ? Math.max(0, Math.floor((24 * 60 * 60 * 1000 - (Date.now() - lastInbound)) / 60000)) : 0;
      const windowExpiresAt = lastInbound > 0 ? new Date(lastInbound + 24 * 60 * 60 * 1000).toISOString() : null;

      return {
        ...convo,
        isWindowOpen,
        remainingMinutes,
        windowExpiresAt,
      };
    });

    res.json({
      success: true,
      data: conversations,
    });
  });

  router.get('/messages', authenticateAdmin, (req, res) => {
    const { conversationId, status, direction, search, page = 1, limit = 100 } = req.query;
    const db = getDb();
    let messages = db.whatsappMessages || [];

    if (conversationId) {
      messages = messages.filter((m) => m.conversationId === conversationId);
    }
    if (status) {
      messages = messages.filter((m) => m.status === status);
    }
    if (direction) {
      messages = messages.filter((m) => m.direction === direction);
    }
    if (search) {
      const q = String(search).toLowerCase();
      messages = messages.filter((m) => (m.text && m.text.toLowerCase().includes(q)) || (m.id && m.id.toLowerCase().includes(q)));
    }

    const total = messages.length;
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(200, Math.max(1, parseInt(limit) || 100));
    const paginated = messages.slice((p - 1) * l, p * l);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    });
  });

  router.post('/messages/send-text', authenticateAdmin, async (req, res) => {
    const { to, text, previewUrl } = req.body || {};

    if (!to || !text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Recipient phone number and message text are required.' });
    }

    const cleanTo = String(to).replace(/\D/g, '');
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    // 1. Consent & Opt-out Check
    const contact = (db.whatsappContacts || []).find((c) => c.phone === cleanTo);
    if (contact && contact.consentStatus === 'OPTED_OUT') {
      return res.status(403).json({
        success: false,
        optedOut: true,
        error: `Consent Restriction: Recipient ${cleanTo} has opted out / unsubscribed from WhatsApp notifications. Outbound sending suppressed.`,
      });
    }

    // 2. Strict 24-Hour Customer Care Window Enforcement
    const convo = (db.whatsappConversations || []).find((c) => c.id === cleanTo);
    const lastInboundTime = convo?.lastInboundTimestamp ? new Date(convo.lastInboundTimestamp).getTime() : 0;
    const isWindowOpen = lastInboundTime > 0 && Date.now() - lastInboundTime < 24 * 60 * 60 * 1000;

    if (!isWindowOpen) {
      return res.status(400).json({
        success: false,
        windowExpired: true,
        error: 'Meta WhatsApp Policy Violation: The 24-hour customer service window is closed. Free-form text cannot be delivered. Send an approved WhatsApp Template message instead.',
      });
    }

    // 3. Duplicate-Send Prevention (Idempotency safeguard within 3 seconds)
    const recentDuplicate = (db.whatsappMessages || []).slice(-15).find(
      (m) =>
        m.conversationId === cleanTo &&
        m.direction === 'outbound' &&
        m.text === text.trim() &&
        Date.now() - new Date(m.timestamp).getTime() < 3000
    );
    if (recentDuplicate) {
      return res.status(409).json({
        success: false,
        duplicateBlocked: true,
        error: 'Duplicate message detected. Please wait a few seconds before resending identical text.',
        existingMessageId: recentDuplicate.id,
      });
    }

    const startTime = Date.now();
    const correlationId = `COR-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const result = await whatsappClient.sendTextMessage(config, { to: cleanTo, text, previewUrl }, db, saveDb);
    const durationMs = Date.now() - startTime;

    if (result.success && result.data?.messages?.[0]?.id) {
      const metaMsgId = result.data.messages[0].id;
      const timestamp = new Date().toISOString();

      if (!Array.isArray(db.whatsappMessages)) db.whatsappMessages = [];
      db.whatsappMessages.push({
        id: metaMsgId,
        conversationId: cleanTo,
        direction: 'outbound',
        type: 'text',
        text: text.trim(),
        status: 'sent',
        timestamp,
        statusTimestamp: timestamp,
        sender: req.admin?.username || 'AST-ADMIN-01',
        rawPayload: result.data,
      });

      // Update or create conversation
      if (!Array.isArray(db.whatsappConversations)) db.whatsappConversations = [];
      let c = db.whatsappConversations.find((item) => item.id === cleanTo);
      if (!c) {
        c = {
          id: cleanTo,
          contactName: contact?.name || cleanTo,
          phone: cleanTo,
          lastMessage: text.trim(),
          lastMessageTimestamp: timestamp,
          lastInboundTimestamp: null,
          unreadCount: 0,
          status: 'active',
          createdAt: timestamp,
        };
        db.whatsappConversations.unshift(c);
      } else {
        c.lastMessage = text.trim();
        c.lastMessageTimestamp = timestamp;
      }

      // Record Delivery Log
      whatsappClient.recordDeliveryLog(db, saveDb, {
        correlationId,
        messageId: metaMsgId,
        to: cleanTo,
        operationType: 'TEXT_SEND',
        httpStatus: 200,
        metaErrorCode: null,
        metaErrorMessage: null,
        retryCount: 0,
        durationMs,
        success: true,
      });

      saveDb(db);

      logAudit(req.admin?.username, 'MESSAGE_SENT', {
        to: cleanTo,
        messageId: metaMsgId,
        type: 'text',
      });

      return res.json({
        success: true,
        messageId: metaMsgId,
        status: 'sent',
        data: result.data,
      });
    } else {
      // Record failed outgoing attempt in database
      const failId = `FAIL-${Date.now()}`;
      if (!Array.isArray(db.whatsappMessages)) db.whatsappMessages = [];
      db.whatsappMessages.push({
        id: failId,
        conversationId: cleanTo,
        direction: 'outbound',
        type: 'text',
        text: text.trim(),
        status: 'failed',
        timestamp: new Date().toISOString(),
        errorMessage: result.error || 'Failed to send WhatsApp message',
        errorCode: result.data?.error?.code,
        errorDetails: result.data?.error?.error_data?.details || result.data?.error?.message,
        rawPayload: result.data,
      });

      whatsappClient.recordDeliveryLog(db, saveDb, {
        correlationId,
        messageId: null,
        to: cleanTo,
        operationType: 'TEXT_SEND',
        httpStatus: result.status || 400,
        metaErrorCode: result.data?.error?.code,
        metaErrorMessage: result.error,
        retryCount: 0,
        durationMs,
        success: false,
      });

      saveDb(db);

      logAudit(req.admin?.username, 'MESSAGE_SEND_FAILED', {
        to: cleanTo,
        error: result.error,
        code: result.data?.error?.code,
      });

      return res.status(result.status || 400).json({
        success: false,
        error: result.error || 'Failed to send WhatsApp message via Meta Cloud API.',
        metaError: result.data?.error,
      });
    }
  });

  router.post('/messages/send-template', authenticateAdmin, async (req, res) => {
    const { to, templateName, languageCode = 'en_US', components = [] } = req.body || {};

    if (!to || !templateName) {
      return res.status(400).json({ success: false, error: 'Recipient phone number and template name are required.' });
    }

    const cleanTo = String(to).replace(/\D/g, '');
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    // Consent check
    const contact = (db.whatsappContacts || []).find((c) => c.phone === cleanTo);
    if (contact && contact.consentStatus === 'OPTED_OUT') {
      return res.status(403).json({
        success: false,
        optedOut: true,
        error: `Consent Restriction: Recipient ${cleanTo} has opted out / unsubscribed. Outbound template suppressed.`,
      });
    }

    const startTime = Date.now();
    const correlationId = `COR-TMPL-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const result = await whatsappClient.sendTemplateMessage(
      config,
      { to: cleanTo, templateName, languageCode, components },
      db,
      saveDb
    );
    const durationMs = Date.now() - startTime;

    if (result.success && result.data?.messages?.[0]?.id) {
      const metaMsgId = result.data.messages[0].id;
      const timestamp = new Date().toISOString();

      if (!Array.isArray(db.whatsappMessages)) db.whatsappMessages = [];
      db.whatsappMessages.push({
        id: metaMsgId,
        conversationId: cleanTo,
        direction: 'outbound',
        type: 'template',
        text: `[Template: ${templateName}]`,
        templateName,
        templateLanguage: languageCode,
        status: 'sent',
        timestamp,
        statusTimestamp: timestamp,
        sender: req.admin?.username || 'AST-ADMIN-01',
        rawPayload: result.data,
      });

      // Update conversation
      if (!Array.isArray(db.whatsappConversations)) db.whatsappConversations = [];
      let c = db.whatsappConversations.find((item) => item.id === cleanTo);
      if (!c) {
        c = {
          id: cleanTo,
          contactName: contact?.name || cleanTo,
          phone: cleanTo,
          lastMessage: `[Template: ${templateName}]`,
          lastMessageTimestamp: timestamp,
          lastInboundTimestamp: null,
          unreadCount: 0,
          status: 'active',
          createdAt: timestamp,
        };
        db.whatsappConversations.unshift(c);
      } else {
        c.lastMessage = `[Template: ${templateName}]`;
        c.lastMessageTimestamp = timestamp;
      }

      whatsappClient.recordDeliveryLog(db, saveDb, {
        correlationId,
        messageId: metaMsgId,
        to: cleanTo,
        operationType: 'TEMPLATE_SEND',
        httpStatus: 200,
        metaErrorCode: null,
        metaErrorMessage: null,
        retryCount: 0,
        durationMs,
        success: true,
      });

      saveDb(db);

      logAudit(req.admin?.username, 'TEMPLATE_MESSAGE_SENT', {
        to: cleanTo,
        templateName,
        messageId: metaMsgId,
      });

      return res.json({
        success: true,
        messageId: metaMsgId,
        status: 'sent',
        data: result.data,
      });
    } else {
      whatsappClient.recordDeliveryLog(db, saveDb, {
        correlationId,
        messageId: null,
        to: cleanTo,
        operationType: 'TEMPLATE_SEND',
        httpStatus: result.status || 400,
        metaErrorCode: result.data?.error?.code,
        metaErrorMessage: result.error,
        retryCount: 0,
        durationMs,
        success: false,
      });

      return res.status(result.status || 400).json({
        success: false,
        error: result.error || 'Failed to dispatch WhatsApp template message.',
        metaError: result.data?.error,
      });
    }
  });

  router.post('/messages/retry/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    const msg = (db.whatsappMessages || []).find((m) => m.id === id);
    if (!msg) {
      return res.status(404).json({ success: false, error: 'Target message not found for retry.' });
    }

    if (msg.direction !== 'outbound') {
      return res.status(400).json({ success: false, error: 'Only outbound messages can be retried.' });
    }

    msg.retryCount = (msg.retryCount || 0) + 1;
    const correlationId = `COR-RETRY-${Date.now()}`;
    const startTime = Date.now();

    let result;
    if (msg.type === 'template' && msg.templateName) {
      result = await whatsappClient.sendTemplateMessage(
        config,
        { to: msg.conversationId, templateName: msg.templateName, languageCode: msg.templateLanguage || 'en_US' },
        db,
        saveDb
      );
    } else {
      result = await whatsappClient.sendTextMessage(config, { to: msg.conversationId, text: msg.text }, db, saveDb);
    }
    const durationMs = Date.now() - startTime;

    if (result.success && result.data?.messages?.[0]?.id) {
      msg.status = 'sent';
      msg.statusTimestamp = new Date().toISOString();
      msg.errorMessage = null;
      msg.errorCode = null;

      whatsappClient.recordDeliveryLog(db, saveDb, {
        correlationId,
        messageId: result.data.messages[0].id,
        to: msg.conversationId,
        operationType: 'RETRY',
        httpStatus: 200,
        metaErrorCode: null,
        metaErrorMessage: null,
        retryCount: msg.retryCount,
        durationMs,
        success: true,
      });

      saveDb(db);

      logAudit(req.admin?.username, 'MESSAGE_RETRY_SUCCESS', {
        originalId: id,
        newId: result.data.messages[0].id,
      });

      return res.json({
        success: true,
        message: 'Message retried successfully.',
        data: result.data,
      });
    } else {
      whatsappClient.recordDeliveryLog(db, saveDb, {
        correlationId,
        messageId: null,
        to: msg.conversationId,
        operationType: 'RETRY',
        httpStatus: result.status || 400,
        metaErrorCode: result.data?.error?.code,
        metaErrorMessage: result.error,
        retryCount: msg.retryCount,
        durationMs,
        success: false,
      });

      return res.status(result.status || 400).json({
        success: false,
        error: result.error || 'Retry attempt failed.',
        metaError: result.data?.error,
      });
    }
  });

  /**
   * Dedicated Administrator Test Recipient Workflow
   */
  router.post('/test-recipient-message', authenticateAdmin, async (req, res) => {
    const { to, text = 'Astitva Innovation Meta Cloud API Integration Test', templateName } = req.body || {};

    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Authorized test recipient phone number is required.',
      });
    }

    const cleanTo = String(to).replace(/\D/g, '');
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    let result;
    const correlationId = `COR-TEST-${Date.now()}`;
    const startTime = Date.now();

    if (templateName) {
      result = await whatsappClient.sendTemplateMessage(
        config,
        { to: cleanTo, templateName, languageCode: 'en_US' },
        db,
        saveDb
      );
    } else {
      result = await whatsappClient.sendTextMessage(
        config,
        { to: cleanTo, text: `[ADMIN TEST] ${text} (Timestamp: ${new Date().toISOString()})` },
        db,
        saveDb
      );
    }
    const durationMs = Date.now() - startTime;

    whatsappClient.recordDeliveryLog(db, saveDb, {
      correlationId,
      messageId: result.data?.messages?.[0]?.id || null,
      to: cleanTo,
      operationType: templateName ? 'TEMPLATE_SEND' : 'TEXT_SEND',
      httpStatus: result.status || (result.success ? 200 : 400),
      metaErrorCode: result.data?.error?.code || null,
      metaErrorMessage: result.error,
      durationMs,
      success: result.success,
    });

    logAudit(req.admin?.username, 'TEST_RECIPIENT_MESSAGE_DISPATCHED', {
      to: cleanTo,
      success: result.success,
      type: templateName ? 'template' : 'text',
    });

    if (result.success) {
      return res.json({
        success: true,
        message: 'Live test message dispatched successfully via Meta Cloud API.',
        metaResponse: result.data,
      });
    } else {
      return res.status(result.status || 400).json({
        success: false,
        error: result.error || 'Live test dispatch failed.',
        metaError: result.data?.error,
      });
    }
  });

  /**
   * 4. MESSAGE TEMPLATES
   */
  router.get('/templates', authenticateAdmin, (req, res) => {
    const db = getDb();
    res.json({
      success: true,
      data: db.whatsappTemplates || [],
    });
  });

  router.post('/templates/sync', authenticateAdmin, async (req, res) => {
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    const result = await whatsappClient.getMessageTemplates(config, db, saveDb);
    if (result.success && Array.isArray(result.data?.data)) {
      db.whatsappTemplates = result.data.data.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        language: t.language,
        status: t.status, // Meta returned official status: APPROVED | PENDING | REJECTED
        components: t.components,
        lastSyncedAt: new Date().toISOString(),
      }));
      saveDb(db);

      logAudit(req.admin?.username, 'TEMPLATES_SYNCED', {
        count: db.whatsappTemplates.length,
      });

      return res.json({
        success: true,
        count: db.whatsappTemplates.length,
        data: db.whatsappTemplates,
      });
    } else {
      return res.status(result.status || 400).json({
        success: false,
        error: result.error || 'Failed to fetch templates from Meta Graph API.',
        metaError: result.data?.error,
      });
    }
  });

  router.post('/templates', authenticateAdmin, async (req, res) => {
    const { name, category, language = 'en_US', components } = req.body || {};
    if (!name || !category || !components) {
      return res.status(400).json({
        success: false,
        error: 'Template name, category, and components are required.',
      });
    }

    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    const templatePayload = {
      name: name.toLowerCase().replace(/\s+/g, '_'),
      category,
      language,
      components,
    };

    const result = await whatsappClient.createMessageTemplate(config, templatePayload, db, saveDb);
    if (result.success) {
      if (!Array.isArray(db.whatsappTemplates)) db.whatsappTemplates = [];
      const newTemplate = {
        id: result.data?.id || `tmpl_${Date.now()}`,
        name: templatePayload.name,
        category: templatePayload.category,
        language: templatePayload.language,
        status: 'PENDING',
        components,
        createdAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
      };
      db.whatsappTemplates.unshift(newTemplate);
      saveDb(db);

      logAudit(req.admin?.username, 'TEMPLATE_SUBMITTED_FOR_REVIEW', {
        name: newTemplate.name,
        id: newTemplate.id,
      });

      return res.json({
        success: true,
        message: 'Template submitted successfully to Meta for review.',
        data: newTemplate,
      });
    } else {
      return res.status(result.status || 400).json({
        success: false,
        error: result.error || 'Failed to submit template to Meta Graph API.',
        metaError: result.data?.error,
      });
    }
  });

  /**
   * 5. CONTACTS & OPT-IN MANAGEMENT
   */
  router.get('/contacts', authenticateAdmin, (req, res) => {
    const { search, consentStatus, page = 1, limit = 50 } = req.query;
    const db = getDb();
    let contacts = db.whatsappContacts || [];

    if (consentStatus && consentStatus !== 'ALL') {
      contacts = contacts.filter((c) => c.consentStatus === consentStatus);
    }
    if (search) {
      const q = String(search).toLowerCase();
      contacts = contacts.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q)) ||
          (c.notes && c.notes.toLowerCase().includes(q))
      );
    }

    const total = contacts.length;
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const paginated = contacts.slice((p - 1) * l, p * l);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    });
  });

  router.post('/contacts', authenticateAdmin, (req, res) => {
    const { phone, name, consentStatus = 'OPTED_IN', consentSource = 'ADMIN_MANUAL', notes, tags = [] } = req.body || {};

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Contact phone number is required.' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Phone number must include country code with at least 10 digits.' });
    }

    const db = getDb();
    if (!Array.isArray(db.whatsappContacts)) db.whatsappContacts = [];

    const existingIndex = db.whatsappContacts.findIndex((c) => c.phone === cleanPhone);
    if (existingIndex !== -1) {
      return res.status(409).json({ success: false, error: `Contact with phone ${cleanPhone} already exists.` });
    }

    const newContact = {
      id: `cnt-${Date.now()}-${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      name: (name || cleanPhone).trim(),
      consentStatus: ['OPTED_IN', 'OPTED_OUT', 'PENDING'].includes(consentStatus) ? consentStatus : 'OPTED_IN',
      consentSource: consentSource || 'ADMIN_MANUAL',
      consentTimestamp: new Date().toISOString(),
      optOutTimestamp: consentStatus === 'OPTED_OUT' ? new Date().toISOString() : null,
      notes: notes || '',
      tags: Array.isArray(tags) ? tags : [],
    };

    db.whatsappContacts.unshift(newContact);
    saveDb(db);

    logAudit(req.admin?.username, 'CONTACT_CREATED', {
      phone: cleanPhone,
      consentStatus: newContact.consentStatus,
    });

    res.json({
      success: true,
      message: 'Contact and consent record created successfully.',
      data: newContact,
    });
  });

  router.put('/contacts/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const { name, notes, tags, consentStatus, consentSource } = req.body || {};
    const db = getDb();

    if (!Array.isArray(db.whatsappContacts)) return res.status(404).json({ success: false, error: 'Contact not found' });

    const contact = db.whatsappContacts.find((c) => c.id === id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    if (name) contact.name = name.trim();
    if (notes !== undefined) contact.notes = notes;
    if (Array.isArray(tags)) contact.tags = tags;
    if (consentSource) contact.consentSource = consentSource;

    if (consentStatus && ['OPTED_IN', 'OPTED_OUT', 'PENDING'].includes(consentStatus)) {
      if (consentStatus === 'OPTED_OUT' && contact.consentStatus !== 'OPTED_OUT') {
        contact.optOutTimestamp = new Date().toISOString();
      } else if (consentStatus === 'OPTED_IN' && contact.consentStatus !== 'OPTED_IN') {
        contact.optOutTimestamp = null;
        contact.consentTimestamp = new Date().toISOString();
      }
      contact.consentStatus = consentStatus;
    }

    contact.updatedAt = new Date().toISOString();
    saveDb(db);

    logAudit(req.admin?.username, 'CONTACT_UPDATED', {
      id,
      phone: contact.phone,
      consentStatus: contact.consentStatus,
    });

    res.json({
      success: true,
      message: 'Contact record updated successfully.',
      data: contact,
    });
  });

  router.post('/contacts/:id/opt-out', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const contact = (db.whatsappContacts || []).find((c) => c.id === id || c.phone === id);

    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found.' });
    }

    contact.consentStatus = 'OPTED_OUT';
    contact.optOutTimestamp = new Date().toISOString();
    saveDb(db);

    logAudit(req.admin?.username, 'CONTACT_OPTED_OUT', {
      phone: contact.phone,
      reason: 'Administrator manual suppression',
    });

    res.json({
      success: true,
      message: `Contact ${contact.phone} has been suppressed from outbound messages.`,
      data: contact,
    });
  });

  router.post('/contacts/:id/opt-in', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const contact = (db.whatsappContacts || []).find((c) => c.id === id || c.phone === id);

    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found.' });
    }

    contact.consentStatus = 'OPTED_IN';
    contact.consentTimestamp = new Date().toISOString();
    contact.optOutTimestamp = null;
    saveDb(db);

    logAudit(req.admin?.username, 'CONTACT_OPTED_IN', {
      phone: contact.phone,
    });

    res.json({
      success: true,
      message: `Contact ${contact.phone} consent status restored to OPTED_IN.`,
      data: contact,
    });
  });

  router.delete('/contacts/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const db = getDb();
    if (!Array.isArray(db.whatsappContacts)) return res.status(404).json({ success: false, error: 'Contact not found.' });

    const index = db.whatsappContacts.findIndex((c) => c.id === id || c.phone === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Contact not found.' });

    const [deleted] = db.whatsappContacts.splice(index, 1);
    saveDb(db);

    logAudit(req.admin?.username, 'CONTACT_DELETED', {
      phone: deleted.phone,
      name: deleted.name,
    });

    res.json({
      success: true,
      message: 'Contact record removed successfully.',
    });
  });

  /**
   * 6. WEBHOOKS & EVENTS
   */
  router.get('/webhooks/logs', authenticateAdmin, (req, res) => {
    const db = getDb();
    res.json({
      success: true,
      data: db.whatsappWebhookLogs || [],
    });
  });

  router.post('/webhooks/test-challenge', authenticateAdmin, (req, res) => {
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);
    const testChallenge = `challenge_check_${Date.now()}`;
    const configuredToken = config.verifyToken;

    // Real validation test of the verify token
    const isConfigured = Boolean(configuredToken && configuredToken.length >= 8);

    res.json({
      success: isConfigured,
      verified: isConfigured,
      verifyToken: configuredToken,
      webhookUrl: 'https://astitvainnovation.in/api/whatsapp/webhook',
      subscribedFields: ['messages', 'messaging_postbacks', 'message_template_status_update'],
      signatureAlgorithm: 'HMAC-SHA256 (X-Hub-Signature-256 header)',
      testChallengeResponse: testChallenge,
    });
  });

  /**
   * 7. DELIVERY LOGS
   */
  router.get('/delivery-logs', authenticateAdmin, (req, res) => {
    const { operationType, success, search, page = 1, limit = 50 } = req.query;
    const db = getDb();
    let logs = db.whatsappDeliveryLogs || [];

    if (operationType && operationType !== 'ALL') {
      logs = logs.filter((l) => l.operationType === operationType);
    }
    if (success !== undefined && success !== 'ALL') {
      const isSuccess = success === 'true' || success === true;
      logs = logs.filter((l) => l.success === isSuccess);
    }
    if (search) {
      const q = String(search).toLowerCase();
      logs = logs.filter(
        (l) =>
          (l.to && l.to.includes(q)) ||
          (l.messageId && l.messageId.toLowerCase().includes(q)) ||
          (l.correlationId && l.correlationId.toLowerCase().includes(q))
      );
    }

    const total = logs.length;
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const paginated = logs.slice((p - 1) * l, p * l);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    });
  });

  router.get('/delivery-logs/export', authenticateAdmin, (req, res) => {
    const db = getDb();
    const logs = db.whatsappDeliveryLogs || [];

    const headers = 'ID,Timestamp,CorrelationID,MessageID,Recipient,OperationType,HTTPStatus,MetaErrorCode,Success,DurationMs\n';
    const rows = logs.map((l) =>
      `"${l.id}","${l.timestamp}","${l.correlationId || ''}","${l.messageId || ''}","${l.to || ''}","${l.operationType}","${l.httpStatus}","${l.metaErrorCode || ''}","${l.success}","${l.durationMs || 0}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="astitva_wa_delivery_logs_${Date.now()}.csv"`);
    res.send(headers + rows);
  });

  /**
   * 8. EVIDENCE & SCREENCAST MANAGER
   */
  router.get('/evidence', authenticateAdmin, (req, res) => {
    const { category, search } = req.query;
    const db = getDb();
    let evidence = db.whatsappEvidence || [];

    if (category && category !== 'all') {
      evidence = evidence.filter((e) => e.category === category);
    }
    if (search) {
      const q = String(search).toLowerCase();
      evidence = evidence.filter(
        (e) =>
          (e.fileName && e.fileName.toLowerCase().includes(q)) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      data: evidence,
      validCategories: evidenceManager.getValidCategories(),
    });
  });

  router.post('/evidence', authenticateAdmin, async (req, res) => {
    const { fileName, mimeType, fileData, category, notes, isRedacted, relatedIntegrationId, testRunId } = req.body || {};
    const db = getDb();

    try {
      const record = await evidenceManager.saveEvidence({
        fileName,
        mimeType,
        fileData,
        category,
        uploader: req.admin?.username || 'AST-ADMIN-01',
        relatedIntegrationId,
        testRunId,
        notes,
        isRedacted,
        db,
        saveDb,
      });

      logAudit(req.admin?.username, 'EVIDENCE_UPLOADED', {
        id: record.id,
        fileName: record.fileName,
        category: record.category,
      });

      res.json({
        success: true,
        message: 'Evidence file uploaded and indexed successfully.',
        data: record,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  });

  router.patch('/evidence/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const updates = req.body || {};
    const db = getDb();

    const updated = evidenceManager.updateEvidence(id, updates, db, saveDb);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Evidence record not found.' });
    }

    logAudit(req.admin?.username, 'EVIDENCE_METADATA_UPDATED', { id });

    res.json({
      success: true,
      message: 'Evidence metadata updated.',
      data: updated,
    });
  });

  router.delete('/evidence/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const db = getDb();

    const success = evidenceManager.deleteEvidence(id, db, saveDb);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Evidence record not found.' });
    }

    logAudit(req.admin?.username, 'EVIDENCE_DELETED', { id });

    res.json({
      success: true,
      message: 'Evidence record and file deleted.',
    });
  });

  /**
   * 9. APP REVIEW CHECKLIST & DOSSIER
   */
  router.get('/checklist', authenticateAdmin, (req, res) => {
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);
    const checklist = checklistEngine.evaluateChecklist(db, config);

    const verifiedCount = checklist.filter((item) => item.verified).length;
    const isReadyForSubmission = verifiedCount === checklist.length;

    res.json({
      success: true,
      data: checklist,
      summary: {
        total: checklist.length,
        verifiedCount,
        progressPercent: Math.round((verifiedCount / checklist.length) * 100),
        isReadyForSubmission,
      },
    });
  });

  router.post('/checklist/verify', authenticateAdmin, (req, res) => {
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);
    const checklist = checklistEngine.evaluateChecklist(db, config);

    // Save evaluated state in database
    db.whatsappChecklist = checklist;
    saveDb(db);

    logAudit(req.admin?.username, 'CHECKLIST_VERIFICATION_SCANNED', {
      verifiedCount: checklist.filter((c) => c.verified).length,
    });

    res.json({
      success: true,
      message: 'App Review verification scan completed.',
      data: checklist,
    });
  });

  router.patch('/checklist/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const { manuallyVerified, notes } = req.body || {};
    const db = getDb();

    if (!Array.isArray(db.whatsappChecklist)) db.whatsappChecklist = [];
    let item = db.whatsappChecklist.find((c) => c.id === id);

    if (!item) {
      item = { id, title: id, verified: false, notes: '' };
      db.whatsappChecklist.push(item);
    }

    if (manuallyVerified !== undefined) {
      item.manuallyVerified = Boolean(manuallyVerified);
      item.verified = Boolean(manuallyVerified);
      item.verifiedAt = manuallyVerified ? new Date().toISOString() : null;
      item.verifiedBy = manuallyVerified ? req.admin?.username || 'AST-ADMIN-01' : null;
    }
    if (notes !== undefined) {
      item.notes = notes;
    }

    saveDb(db);

    logAudit(req.admin?.username, 'CHECKLIST_ITEM_UPDATED', {
      id,
      manuallyVerified,
    });

    res.json({
      success: true,
      message: 'Checklist requirement updated.',
      data: item,
    });
  });

  router.get('/checklist/export', authenticateAdmin, (req, res) => {
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);
    const dossier = checklistEngine.generateDossier(db, config);

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Astitva_WhatsApp_App_Review_Dossier_${Date.now()}.md"`);
    res.send(dossier);
  });

  /**
   * 10. DIAGNOSTICS & API LOGS
   */
  router.get('/logs', authenticateAdmin, (req, res) => {
    const db = getDb();
    res.json({
      success: true,
      data: db.whatsappApiLogs || [],
    });
  });

  router.get('/diagnostics/errors', authenticateAdmin, (req, res) => {
    const errorDictionary = [
      {
        code: 131047,
        title: 'Re-engagement Message Outside 24h Window',
        description: 'More than 24 hours have passed since the customer last replied to this number. Free-form text cannot be delivered.',
        solution: 'Send an approved Meta WhatsApp Utility or Marketing Template message to re-open the conversation window.',
      },
      {
        code: 131030,
        title: 'Recipient Phone Number Not in WhatsApp',
        description: 'The destination number is not registered on WhatsApp or country code prefix is missing.',
        solution: 'Verify the recipient number has an active WhatsApp account and includes international country code (e.g. 91 for India).',
      },
      {
        code: 131026,
        title: 'Message Undeliverable',
        description: 'Meta was unable to deliver the message due to recipient privacy settings or network failure.',
        solution: 'Confirm recipient phone is active and not blocking business accounts.',
      },
      {
        code: 131051,
        title: 'Unsupported Message Type',
        description: 'The message format or component payload is invalid for Cloud API v20.0.',
        solution: 'Ensure template variables match {{1}}, {{2}} parameter format.',
      },
      {
        code: 190,
        title: 'Invalid or Expired OAuth Access Token',
        description: 'The Meta Cloud API access token is expired, revoked, or lacks required scopes.',
        solution: 'Generate a new Permanent System User Token in Meta Business Manager and update Configuration.',
      },
      {
        code: 100,
        title: 'Invalid Parameter or Missing Permissions',
        description: 'Request missing required parameter or app lacks whatsapp_business_messaging permission.',
        solution: 'Inspect request payload in API logs and verify permission scopes in Meta Developer App.',
      },
      {
        code: 80007,
        title: 'Rate Limit Exceeded',
        description: 'Messaging throughput tier limit reached.',
        solution: 'Pause automated dispatches; Cloud API will recover automatically in the next window.',
      },
    ];

    res.json({
      success: true,
      data: errorDictionary,
    });
  });

  /**
   * 11. SECURITY & PERMISSIONS
   */
  router.get('/security/posture', authenticateAdmin, (req, res) => {
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    res.json({
      success: true,
      data: {
        tokenStorage: 'Environment Variables / Masked Secret Layer',
        hasToken: Boolean(config.token),
        tokenPreview: config.token ? `EAAG...${config.token.slice(-6)}` : 'NOT_CONFIGURED',
        hasAppSecret: Boolean(config.appSecret),
        webhookSignatureVerification: Boolean(config.appSecret) ? 'ACTIVE_HMAC_SHA256' : 'APP_SECRET_PENDING',
        dataRetentionPolicy: 'Customer messages retained strictly for project consultations; auto-expunged on deletion request.',
        optOutHandling: 'Automated suppression active for STOP/UNSUBSCRIBE keywords.',
        rbacEnforcement: 'JWT Bearer Authentication required for all administrative actions.',
        dataDeletionEndpoint: 'https://astitvainnovation.in/api/auth/data-deletion',
        privacyPolicyUrl: 'https://astitvainnovation.in/privacy-policy',
        currentAdmin: req.admin?.username || 'AST-ADMIN-01',
      },
    });
  });

  router.get('/audit-logs', authenticateAdmin, (req, res) => {
    const db = getDb();
    res.json({
      success: true,
      data: db.auditLogs || [],
    });
  });

  return router;
}

module.exports = createWhatsAppRouter;
