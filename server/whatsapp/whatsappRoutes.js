const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { verifyAdminToken } = require('../adminAuth');
const whatsappClient = require('./whatsappClient');
const whatsappWebhook = require('./whatsappWebhook');
const evidenceManager = require('./evidenceManager');
const checklistEngine = require('./checklistEngine');
const templateBuilder = require('./templateBuilder');

/**
 * Express router for Meta WhatsApp Business Platform Management
 * Fully compliant with Meta Cloud API v20.0 specification
 */
function createWhatsAppRouter({ getDb, saveDb, authenticateAdmin }) {
  const router = express.Router();

  function serializeWhatsAppConfig(dbConfig = {}, activeConfig = {}) {
    return {
      status: dbConfig.status || (activeConfig.token && activeConfig.phoneNumberId && activeConfig.wabaId ? 'Pending' : 'Disconnected'),
      wabaId: activeConfig.wabaId || '',
      phoneNumberId: activeConfig.phoneNumberId || '',
      businessPhoneNumber: dbConfig.businessPhoneNumber || '',
      displayName: dbConfig.displayName || 'Astitva Innovation',
      qualityRating: dbConfig.qualityRating || 'UNKNOWN',
      codeVerificationStatus: dbConfig.codeVerificationStatus || 'NOT_VERIFIED',
      messagingLimitTier: dbConfig.messagingLimitTier || 'UNKNOWN',
      webhookVerified: Boolean(dbConfig.webhookVerified),
      webhookSubscriptionStatus: dbConfig.webhookSubscriptionStatus || 'Pending',
      lastSync: dbConfig.lastSync || null,
      errorMessage: dbConfig.errorMessage || null,
      hasToken: Boolean(activeConfig.token),
      appId: activeConfig.appId,
      hasAppSecret: Boolean(activeConfig.appSecret),
      hasVerifyToken: Boolean(activeConfig.verifyToken),
      apiVersion: activeConfig.apiVersion,
      apiConnectivity: dbConfig.apiConnectivity || (dbConfig.lastSync ? 'CONNECTED' : 'DISCONNECTED'),
      accountReviewStatus: dbConfig.accountReviewStatus || 'UNKNOWN',
      templateApprovalStatus: dbConfig.templateApprovalStatus || 'UNKNOWN',
      phoneRegistrationStatus: dbConfig.phoneRegistrationStatus || (dbConfig.codeVerificationStatus === 'VERIFIED' ? 'REGISTERED_AND_VERIFIED' : 'PENDING_VERIFICATION'),
      nameStatus: dbConfig.nameStatus || 'UNKNOWN',
      platformType: dbConfig.platformType || null,
      approvedTemplatesCount: dbConfig.approvedTemplatesCount ?? 0,
      totalTemplatesCount: dbConfig.totalTemplatesCount ?? 0,
      callbackUrl: 'https://astitvainnovation.in/api/whatsapp/webhook',
      subscribedFields: ['messages', 'messaging_postbacks', 'message_template_status_update'],
      embeddedSignup: {
        appId: activeConfig.appId || '',
        configId: dbConfig.embeddedSignupConfigId || '',
      },
      connectedAt: dbConfig.connectedAt || null,
      connectionVerifiedAt: dbConfig.connectionVerifiedAt || null,
    };
  }

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
    const expectedToken = config.verifyToken || process.env.WHATSAPP_VERIFY_TOKEN || '';
    const validChallenge = expectedToken
      && req.query['hub.mode'] === 'subscribe'
      && req.query['hub.verify_token'] === expectedToken
      && typeof req.query['hub.challenge'] === 'string';

    if (validChallenge) {
      if (!db.whatsappConfig) db.whatsappConfig = {};
      db.whatsappConfig.webhookVerified = true;
      db.whatsappConfig.webhookVerifiedAt = new Date().toISOString();
      if (!saveDb(db)) {
        return res.status(503).json({ error: 'Webhook challenge was valid, but its verification state could not be saved.' });
      }
    }
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
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Evidence file access requires valid administrator session.' });
    }

    let admin;
    try {
      admin = verifyAdminToken(token);
    } catch (e) {
      const status = Number.isInteger(e.status) ? e.status : 401;
      const message = status === 503
        ? 'Authentication service is not configured.'
        : status === 403
          ? 'Administrator role required.'
          : 'Unauthorized: Invalid or expired access token.';
      return res.status(status).json({ success: false, error: message });
    }
    req.admin = admin;

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
      data: serializeWhatsAppConfig(dbConfig, config),
    });
  });

  router.post('/config', authenticateAdmin, async (req, res) => {
    const db = getDb();
    const body = req.body || {};
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ success: false, error: 'WhatsApp configuration must be a JSON object.' });
    }

    const fieldLimits = {
      token: 4096,
      wabaId: 64,
      phoneNumberId: 64,
      appId: 64,
      appSecret: 1024,
      verifyToken: 255,
      apiVersion: 16,
      businessPhoneNumber: 32,
      displayName: 120,
      embeddedSignupConfigId: 128,
    };
    for (const [field, maxLength] of Object.entries(fieldLimits)) {
      if (body[field] === undefined) continue;
      if (typeof body[field] !== 'string') {
        return res.status(400).json({ success: false, error: `Configuration field "${field}" must be text.` });
      }
      body[field] = body[field].trim();
      if (body[field].length > maxLength) {
        return res.status(400).json({ success: false, error: `Configuration field "${field}" is too long.` });
      }
    }
    if (body.apiVersion && !/^v\d{1,3}\.\d{1,2}$/.test(body.apiVersion)) {
      return res.status(400).json({ success: false, error: 'API version must use the format vNN.N.' });
    }

    if (!db.whatsappConfig) db.whatsappConfig = {};
    const appSecretChanged = Boolean(body.appSecret && body.appSecret !== db.whatsappConfig.appSecret);
    const verifyTokenChanged = body.verifyToken !== undefined && body.verifyToken !== db.whatsappConfig.verifyToken;

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
    db.whatsappConfig.connectionVerifiedAt = null;
    db.whatsappConfig.codeVerificationStatus = 'NOT_VERIFIED';
    db.whatsappConfig.qualityRating = 'UNKNOWN';
    db.whatsappConfig.messagingLimitTier = 'UNKNOWN';
    db.whatsappConfig.lastSync = null;
    db.whatsappConfig.verificationSchemaVersion = 2;
    if (appSecretChanged || verifyTokenChanged) {
      db.whatsappConfig.webhookVerified = false;
      db.whatsappConfig.webhookVerifiedAt = null;
    }
    if (body.token || body.wabaId !== undefined) {
      db.whatsappConfig.webhookSubscriptionStatus = 'Pending';
    }
    db.whatsappConfig.updatedAt = new Date().toISOString();

    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'WhatsApp configuration could not be saved. Please retry.' });
    }

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

    if (!config.token || !config.phoneNumberId || !config.wabaId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot sync: WhatsApp API Token, WABA ID, and Phone Number ID are required.',
      });
    }

    try {
      const [phoneResult, wabaResult, phoneNumbersResult, templatesResult] = await Promise.all([
        whatsappClient.getPhoneNumberDetails(config, db, saveDb),
        whatsappClient.getWabaDetails(config, db, saveDb),
        whatsappClient.getWabaPhoneNumbers(config, db, saveDb),
        whatsappClient.getMessageTemplates(config, db, saveDb),
      ]);

      if (!db.whatsappConfig) db.whatsappConfig = {};

      const failedLookup = [phoneResult, wabaResult, phoneNumbersResult].find((result) => !result?.success || !result.data);
      if (failedLookup) {
        db.whatsappConfig.status = 'Error';
        db.whatsappConfig.apiConnectivity = 'ERROR';
        db.whatsappConfig.connectionVerifiedAt = null;
        db.whatsappConfig.errorMessage = failedLookup.error || 'Meta did not verify the configured WABA and phone number.';
        db.whatsappConfig.metaErrorCode = failedLookup.errorCode || null;
        db.whatsappConfig.metaErrorSubcode = failedLookup.errorSubcode || null;
        if (!saveDb(db)) {
          return res.status(503).json({ success: false, error: 'Meta lookup failed and the connection status could not be saved.' });
        }

        logAudit(req.admin?.username, 'WHATSAPP_SYNC_FAILED', {
          error: db.whatsappConfig.errorMessage,
          errorCode: failedLookup.errorCode,
        });

        return res.status(failedLookup.status || 502).json({
          success: false,
          error: db.whatsappConfig.errorMessage,
          metaErrorCode: failedLookup.errorCode || null,
        });
      }

      const pData = phoneResult.data;
      const returnedPhoneId = typeof pData.id === 'string' ? pData.id : config.phoneNumberId;
      const returnedWabaId = typeof wabaResult.data.id === 'string' ? wabaResult.data.id : '';
      const listedPhoneNumbers = Array.isArray(phoneNumbersResult.data.data) ? phoneNumbersResult.data.data : [];
      const phoneBelongsToWaba = listedPhoneNumbers.some((phone) => String(phone.id) === config.phoneNumberId);
      if (returnedPhoneId !== config.phoneNumberId || returnedWabaId !== config.wabaId || !phoneBelongsToWaba) {
        db.whatsappConfig.status = 'Pending';
        db.whatsappConfig.apiConnectivity = 'CONNECTED';
        db.whatsappConfig.connectionVerifiedAt = null;
        db.whatsappConfig.errorMessage = !phoneBelongsToWaba
          ? `Meta verified API credentials, but Phone Number ID ${config.phoneNumberId} does not belong to WABA ${config.wabaId}.`
          : 'Meta asset IDs returned by Graph API do not match configured WABA ID or Phone Number ID.';
        if (!saveDb(db)) {
          return res.status(503).json({ success: false, error: 'Asset verification failed and its status could not be saved.' });
        }
        return res.status(409).json({ success: false, error: db.whatsappConfig.errorMessage });
      }

      const timestamp = new Date().toISOString();

      // Core Meta API connectivity verified successfully
      db.whatsappConfig.apiConnectivity = 'CONNECTED';
      db.whatsappConfig.lastSync = timestamp;
      db.whatsappConfig.connectionVerifiedAt = timestamp;

      // Phone registration & verification status evaluated from actual Meta response fields
      db.whatsappConfig.displayName = pData.verified_name || db.whatsappConfig.displayName || 'Astitva Innovation';
      db.whatsappConfig.qualityRating = pData.quality_rating || 'UNKNOWN';
      db.whatsappConfig.codeVerificationStatus = pData.code_verification_status || 'NOT_VERIFIED';
      db.whatsappConfig.nameStatus = pData.name_status || 'UNKNOWN';
      db.whatsappConfig.platformType = pData.platform_type || null;
      db.whatsappConfig.businessPhoneNumber = pData.display_phone_number || db.whatsappConfig.businessPhoneNumber;
      db.whatsappConfig.messagingLimitTier = pData.throughput?.level || 'UNKNOWN';
      db.whatsappConfig.phoneRegistrationStatus = pData.code_verification_status === 'VERIFIED'
        ? 'REGISTERED_AND_VERIFIED'
        : 'PENDING_VERIFICATION';

      // WABA account details & review status evaluated separately
      db.whatsappConfig.accountReviewStatus = wabaResult.data?.account_review_status || 'UNKNOWN';
      db.whatsappConfig.wabaName = wabaResult.data?.name || '';
      db.whatsappConfig.currency = wabaResult.data?.currency || '';
      db.whatsappConfig.timezoneId = wabaResult.data?.timezone_id || '';
      db.whatsappConfig.messageTemplateNamespace = wabaResult.data?.message_template_namespace || '';

      // Template list and approval status evaluated separately
      if (templatesResult?.success && Array.isArray(templatesResult.data?.data)) {
        const remoteTemplates = templatesResult.data.data;
        db.whatsappTemplates = remoteTemplates.map((t) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          language: t.language,
          status: t.status,
          components: t.components || [],
          lastSyncedAt: timestamp,
        }));
        const approvedCount = db.whatsappTemplates.filter((t) => t.status === 'APPROVED').length;
        const totalCount = db.whatsappTemplates.length;
        db.whatsappConfig.approvedTemplatesCount = approvedCount;
        db.whatsappConfig.totalTemplatesCount = totalCount;
        db.whatsappConfig.templateApprovalStatus = approvedCount > 0
          ? 'TEMPLATES_APPROVED'
          : (totalCount > 0 ? 'PENDING_APPROVAL' : 'NO_TEMPLATES');
      } else {
        db.whatsappConfig.templateApprovalStatus = 'PERMISSION_OR_FETCH_ERROR';
        db.whatsappConfig.templateErrorMessage = templatesResult?.error || 'Could not fetch message templates.';
        db.whatsappConfig.approvedTemplatesCount = Array.isArray(db.whatsappTemplates)
          ? db.whatsappTemplates.filter((t) => t.status === 'APPROVED').length
          : 0;
        db.whatsappConfig.totalTemplatesCount = Array.isArray(db.whatsappTemplates) ? db.whatsappTemplates.length : 0;
      }

      // Live status depends on actual phone verification
      db.whatsappConfig.status = pData.code_verification_status === 'VERIFIED' ? 'Connected' : 'Pending';
      db.whatsappConfig.errorMessage = db.whatsappConfig.status === 'Connected'
        ? null
        : `Meta API connected and assets verified, but phone two-step verification is pending (code_verification_status: ${pData.code_verification_status || 'NOT_VERIFIED'}).`;
      if (!db.whatsappConfig.connectedAt && db.whatsappConfig.status === 'Connected') {
        db.whatsappConfig.connectedAt = timestamp;
      }

      // Reconcile configured tenant with synced Meta credentials
      ensureTenants(db);
      const activeTenantId = db.activeWhatsAppTenantId || 'default';
      const activeTenant = db.whatsappTenants.find((t) => t.id === activeTenantId) || db.whatsappTenants[0];
      let tenantReconciled = false;
      const tenantMismatches = [];

      if (activeTenant) {
        if (activeTenant.wabaId !== config.wabaId) {
          tenantMismatches.push(`wabaId (${activeTenant.wabaId || 'empty'} -> ${config.wabaId})`);
          activeTenant.wabaId = config.wabaId;
          tenantReconciled = true;
        }
        if (activeTenant.phoneNumberId !== config.phoneNumberId) {
          tenantMismatches.push(`phoneNumberId (${activeTenant.phoneNumberId || 'empty'} -> ${config.phoneNumberId})`);
          activeTenant.phoneNumberId = config.phoneNumberId;
          tenantReconciled = true;
        }
        if (pData.verified_name && activeTenant.displayName !== pData.verified_name) {
          activeTenant.displayName = pData.verified_name;
        }
        if (pData.display_phone_number && activeTenant.businessPhoneNumber !== pData.display_phone_number) {
          activeTenant.businessPhoneNumber = pData.display_phone_number;
        }
        activeTenant.status = db.whatsappConfig.status === 'Connected' ? 'Active' : 'Pending';
        activeTenant.updatedAt = timestamp;
      }

      if (!saveDb(db)) {
        return res.status(503).json({ success: false, error: 'Verified Meta account details could not be saved. Please retry the sync.' });
      }

      logAudit(req.admin?.username, 'WHATSAPP_SYNC_SUCCESS', {
        status: db.whatsappConfig.status,
        apiConnectivity: db.whatsappConfig.apiConnectivity,
        wabaId: config.wabaId,
        phoneNumberId: config.phoneNumberId,
        accountReviewStatus: db.whatsappConfig.accountReviewStatus,
        templateApprovalStatus: db.whatsappConfig.templateApprovalStatus,
      });

      return res.json({
        success: true,
        message: db.whatsappConfig.status === 'Connected'
          ? 'Meta verified the WABA, phone-number association, and phone verification status.'
          : 'Meta API and assets verified. Phone-number two-step verification is pending.',
        data: {
          ...serializeWhatsAppConfig(db.whatsappConfig, config),
          apiConnectivity: db.whatsappConfig.apiConnectivity,
          accountReviewStatus: db.whatsappConfig.accountReviewStatus,
          templateApprovalStatus: db.whatsappConfig.templateApprovalStatus,
          phoneRegistrationStatus: db.whatsappConfig.phoneRegistrationStatus,
          tenantReconciliation: {
            tenantId: activeTenant?.id || 'default',
            tenantName: activeTenant?.name || 'Primary',
            syncedWabaId: config.wabaId,
            syncedPhoneNumberId: config.phoneNumberId,
            matched: tenantMismatches.length === 0,
            reconciled: tenantReconciled,
            mismatches: tenantMismatches,
          },
          phoneDetails: {
            id: returnedPhoneId,
            verifiedName: pData.verified_name || null,
            codeVerificationStatus: pData.code_verification_status || 'NOT_VERIFIED',
            nameStatus: pData.name_status || 'UNKNOWN',
            platformType: pData.platform_type || null,
            displayPhoneNumber: pData.display_phone_number || null,
            qualityRating: pData.quality_rating || 'UNKNOWN',
            messagingLimitTier: pData.throughput?.level || 'UNKNOWN',
          },
          wabaDetails: {
            id: returnedWabaId,
            name: wabaResult.data.name || null,
            accountReviewStatus: wabaResult.data.account_review_status || 'UNKNOWN',
            currency: wabaResult.data.currency || null,
            timezoneId: wabaResult.data.timezone_id || null,
          },
          templatesSummary: {
            total: db.whatsappConfig.totalTemplatesCount,
            approved: db.whatsappConfig.approvedTemplatesCount,
            status: db.whatsappConfig.templateApprovalStatus,
          },
        },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Unable to verify the WhatsApp account with Meta.',
      });
    }
  });

  router.post('/disconnect', authenticateAdmin, (req, res) => {
    const db = getDb();
    if (!db.whatsappConfig) db.whatsappConfig = {};

    db.whatsappConfig.status = 'Disconnected';
    db.whatsappConfig.disconnectedAt = new Date().toISOString();
    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'Failed to persist WhatsApp disconnection.' });
    }

    logAudit(req.admin?.username, 'WHATSAPP_DISCONNECTED', {
      disconnectedAt: db.whatsappConfig.disconnectedAt,
    });

    res.json({
      success: true,
      message: 'WhatsApp Business Account disconnected successfully.',
    });
  });

  // Tenant isolation helper
  function ensureTenants(db) {
    if (!Array.isArray(db.whatsappTenants)) {
      db.whatsappTenants = [];
    }
    const defaultIndex = db.whatsappTenants.findIndex((t) => t.id === 'default' || t.isDefault);
    const config = whatsappClient.resolveConfig(db);
    const dbConfig = db.whatsappConfig || {};

    const activeWabaId = config.wabaId || dbConfig.wabaId || '';
    const activePhoneId = config.phoneNumberId || dbConfig.phoneNumberId || '';

    const defaultTenant = {
      id: 'default',
      name: 'Astitva Innovation (Primary)',
      clientName: 'Astitva Innovation Inc.',
      clientEmail: 'contact@astitvainnovation.in',
      wabaId: activeWabaId,
      phoneNumberId: activePhoneId,
      businessPhoneNumber: dbConfig.businessPhoneNumber || '+91 7233882089',
      displayName: dbConfig.displayName || 'Astitva Innovation',
      status: dbConfig.status || 'Active',
      isDefault: true,
      createdAt: dbConfig.connectedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (defaultIndex === -1) {
      db.whatsappTenants.unshift(defaultTenant);
    } else {
      if (activeWabaId && db.whatsappTenants[defaultIndex].wabaId !== activeWabaId) {
        db.whatsappTenants[defaultIndex].wabaId = activeWabaId;
      }
      if (activePhoneId && db.whatsappTenants[defaultIndex].phoneNumberId !== activePhoneId) {
        db.whatsappTenants[defaultIndex].phoneNumberId = activePhoneId;
      }
      db.whatsappTenants[defaultIndex].isDefault = true;
    }
    return db.whatsappTenants;
  }

  /**
   * TENANT ISOLATION & CLIENT MANAGEMENT ROUTES
   */
  router.get('/tenants', authenticateAdmin, (req, res) => {
    const db = getDb();
    const tenants = ensureTenants(db);
    res.json({
      success: true,
      activeTenantId: db.activeWhatsAppTenantId || 'default',
      count: tenants.length,
      data: tenants,
    });
  });

  router.post('/tenants', authenticateAdmin, (req, res) => {
    const { name, clientName, clientEmail, wabaId, phoneNumberId, businessPhoneNumber, displayName } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Tenant / client organization name is required.' });
    }

    const db = getDb();
    ensureTenants(db);

    const newTenant = {
      id: `tenant-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      name: name.trim().slice(0, 100),
      clientName: (clientName || name).trim().slice(0, 100),
      clientEmail: (clientEmail || '').trim().slice(0, 150),
      wabaId: (wabaId || '').trim().slice(0, 64),
      phoneNumberId: (phoneNumberId || '').trim().slice(0, 64),
      businessPhoneNumber: (businessPhoneNumber || '').trim().slice(0, 32),
      displayName: (displayName || name).trim().slice(0, 120),
      status: 'Active',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.whatsappTenants.push(newTenant);
    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'Failed to persist new WhatsApp tenant.' });
    }

    logAudit(req.admin?.username, 'WHATSAPP_TENANT_CREATED', {
      tenantId: newTenant.id,
      name: newTenant.name,
      clientName: newTenant.clientName,
    });

    res.status(201).json({
      success: true,
      message: `Tenant organization "${newTenant.name}" onboarded successfully.`,
      data: newTenant,
    });
  });

  router.put('/tenants/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const { name, clientName, clientEmail, wabaId, phoneNumberId, businessPhoneNumber, displayName, status } = req.body || {};
    const db = getDb();
    ensureTenants(db);

    const tenant = db.whatsappTenants.find((t) => t.id === id);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant organization not found.' });
    }

    if (name) tenant.name = name.trim().slice(0, 100);
    if (clientName) tenant.clientName = clientName.trim().slice(0, 100);
    if (clientEmail !== undefined) tenant.clientEmail = clientEmail.trim().slice(0, 150);
    if (wabaId !== undefined) tenant.wabaId = wabaId.trim().slice(0, 64);
    if (phoneNumberId !== undefined) tenant.phoneNumberId = phoneNumberId.trim().slice(0, 64);
    if (businessPhoneNumber !== undefined) tenant.businessPhoneNumber = businessPhoneNumber.trim().slice(0, 32);
    if (displayName !== undefined) tenant.displayName = displayName.trim().slice(0, 120);
    if (status && ['Active', 'Pending', 'Disconnected'].includes(status)) tenant.status = status;
    tenant.updatedAt = new Date().toISOString();

    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'Failed to update tenant organization.' });
    }

    logAudit(req.admin?.username, 'WHATSAPP_TENANT_UPDATED', { tenantId: id, name: tenant.name });

    res.json({
      success: true,
      message: `Tenant organization "${tenant.name}" updated successfully.`,
      data: tenant,
    });
  });

  router.delete('/tenants/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const db = getDb();
    ensureTenants(db);

    if (id === 'default') {
      return res.status(400).json({ success: false, error: 'Cannot delete the primary system tenant.' });
    }

    const index = db.whatsappTenants.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Tenant organization not found.' });
    }

    const [deleted] = db.whatsappTenants.splice(index, 1);
    if (db.activeWhatsAppTenantId === id) {
      db.activeWhatsAppTenantId = 'default';
    }

    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'Failed to delete tenant organization.' });
    }

    logAudit(req.admin?.username, 'WHATSAPP_TENANT_DELETED', { tenantId: id, name: deleted.name });

    res.json({
      success: true,
      message: `Tenant organization "${deleted.name}" removed successfully.`,
      data: deleted,
    });
  });

  router.post('/tenants/:id/activate', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const db = getDb();
    ensureTenants(db);

    const tenant = db.whatsappTenants.find((t) => t.id === id);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Target tenant organization not found.' });
    }

    db.activeWhatsAppTenantId = id;
    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'Failed to switch active tenant.' });
    }

    logAudit(req.admin?.username, 'WHATSAPP_TENANT_ACTIVATED', { tenantId: id, name: tenant.name });

    res.json({
      success: true,
      activeTenantId: id,
      message: `Active WhatsApp tenant switched to "${tenant.name}".`,
      data: tenant,
    });
  });

  router.post('/embedded-signup/exchange', authenticateAdmin, async (req, res) => {
    const { code, wabaId, phoneNumberId, tenantId, tenantName } = req.body || {};
    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ success: false, error: 'OAuth authorization code is required.' });
    }
    if ((wabaId !== undefined && (typeof wabaId !== 'string' || !/^\d{5,30}$/.test(wabaId)))
        || (phoneNumberId !== undefined && (typeof phoneNumberId !== 'string' || !/^\d{5,30}$/.test(phoneNumberId)))) {
      return res.status(400).json({ success: false, error: 'WABA and phone-number IDs must contain 5 to 30 digits.' });
    }

    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    const result = await whatsappClient.exchangeOAuthCode(config, code.trim(), db, saveDb);
    if (result.success && result.data?.access_token) {
      ensureTenants(db);

      if (tenantId && tenantId !== 'default') {
        const targetTenant = db.whatsappTenants.find((t) => t.id === tenantId);
        if (targetTenant) {
          if (wabaId) targetTenant.wabaId = wabaId;
          if (phoneNumberId) targetTenant.phoneNumberId = phoneNumberId;
          targetTenant.status = 'Pending';
          targetTenant.token = result.data.access_token;
          targetTenant.updatedAt = new Date().toISOString();
        }
      } else if (tenantName && typeof tenantName === 'string') {
        const newTenant = {
          id: `tenant-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          name: tenantName.trim().slice(0, 100),
          clientName: tenantName.trim().slice(0, 100),
          wabaId: wabaId || '',
          phoneNumberId: phoneNumberId || '',
          status: 'Pending',
          token: result.data.access_token,
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.whatsappTenants.push(newTenant);
      } else {
        if (!db.whatsappConfig) db.whatsappConfig = {};
        db.whatsappConfig.token = result.data.access_token;
        if (wabaId) db.whatsappConfig.wabaId = wabaId;
        if (phoneNumberId) db.whatsappConfig.phoneNumberId = phoneNumberId;
        db.whatsappConfig.status = 'Pending';
        db.whatsappConfig.connectionVerifiedAt = null;
        db.whatsappConfig.codeVerificationStatus = 'NOT_VERIFIED';
        db.whatsappConfig.qualityRating = 'UNKNOWN';
        db.whatsappConfig.messagingLimitTier = 'UNKNOWN';
        db.whatsappConfig.lastSync = null;
        db.whatsappConfig.errorMessage = null;
        db.whatsappConfig.verificationSchemaVersion = 2;
      }

      if (!saveDb(db)) {
        return res.status(503).json({ success: false, error: 'Authorization succeeded, but the connection could not be saved. Please retry setup.' });
      }

      logAudit(req.admin?.username, 'WHATSAPP_EMBEDDED_SIGNUP_COMPLETED', {
        wabaId,
        phoneNumberId,
        tenantId,
        tenantName,
      });

      return res.json({
        success: true,
        message: 'Meta authorization was received. Run account sync to verify the WABA and phone-number connection before use.',
        data: {
          wabaId: wabaId || db.whatsappConfig?.wabaId,
          phoneNumberId: phoneNumberId || db.whatsappConfig?.phoneNumberId,
          status: 'Pending',
        },
      });
    } else {
      return res.status(result.status || 400).json({
        success: false,
        error: result.error || 'Failed to exchange OAuth code for Meta access token.',
      });
    }
  });

  /**
   * 3. CHATS & MESSAGES
   */
  router.get('/conversations', authenticateAdmin, (req, res) => {
    const { tenantId } = req.query;
    const db = getDb();
    let convos = db.whatsappConversations || [];
    if (tenantId) {
      convos = convos.filter((c) => c.tenantId === tenantId || (!c.tenantId && tenantId === 'default'));
    }
    const conversations = convos.map((convo) => {
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
    const { conversationId, status, direction, search, tenantId, page = 1, limit = 100 } = req.query;
    const db = getDb();
    let messages = db.whatsappMessages || [];

    if (tenantId) {
      const tenantConvoIds = new Set(
        (db.whatsappConversations || [])
          .filter((c) => c.tenantId === tenantId || (!c.tenantId && tenantId === 'default'))
          .map((c) => c.id)
      );
      messages = messages.filter((m) => m.tenantId === tenantId || (!m.tenantId && tenantId === 'default') || tenantConvoIds.has(m.conversationId));
    }

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

    if (typeof to !== 'string' || typeof text !== 'string' || !to.trim() || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Recipient phone number and message text are required.' });
    }
    if (previewUrl !== undefined && typeof previewUrl !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Link preview setting must be true or false.' });
    }

    const cleanTo = String(to).replace(/\D/g, '');
    if (cleanTo.length < 10 || cleanTo.length > 15) {
      return res.status(400).json({ success: false, error: 'Recipient phone number must contain 10 to 15 digits including country code.' });
    }
    const normalizedText = text.trim();
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
        m.text === normalizedText &&
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
    const result = await whatsappClient.sendTextMessage(config, { to: cleanTo, text: normalizedText, previewUrl }, db, saveDb);
    const durationMs = Date.now() - startTime;

    if (result.success && result.data?.messages?.[0]?.id) {
      const metaMsgId = result.data.messages[0].id;
      const timestamp = new Date().toISOString();
      const resolvedTenantId = req.body?.tenantId || convo?.tenantId || contact?.tenantId || db.activeWhatsAppTenantId || 'default';

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
        tenantId: resolvedTenantId,
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
          tenantId: resolvedTenantId,
        };
        db.whatsappConversations.unshift(c);
      } else {
        c.lastMessage = text.trim();
        c.lastMessageTimestamp = timestamp;
        if (!c.tenantId) c.tenantId = resolvedTenantId;
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
        tenantId: resolvedTenantId,
      });

      if (!saveDb(db)) {
        return res.status(503).json({ success: false, error: 'Message dispatched to Meta, but failed to persist message record in database.' });
      }

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
        errorCode: result.errorCode || result.data?.error?.code,
        errorSubcode: result.errorSubcode || result.data?.error?.error_subcode,
        errorType: result.errorType || result.data?.error?.type,
        errorDetails: result.errorDetails || result.data?.error?.error_data?.details || result.data?.error?.message,
        fbtraceId: result.fbtraceId || result.data?.error?.fbtrace_id,
        rawPayload: result.data,
      });

      whatsappClient.recordDeliveryLog(db, saveDb, {
        correlationId,
        messageId: null,
        to: cleanTo,
        operationType: 'TEXT_SEND',
        httpStatus: result.status || 400,
        metaErrorCode: result.errorCode || result.data?.error?.code,
        metaErrorSubcode: result.errorSubcode || result.data?.error?.error_subcode,
        metaErrorType: result.errorType || result.data?.error?.type,
        metaErrorDetails: result.errorDetails || result.data?.error?.error_data?.details,
        metaErrorMessage: result.error,
        fbtraceId: result.fbtraceId || result.data?.error?.fbtrace_id,
        retryCount: 0,
        durationMs,
        success: false,
      });

      if (!saveDb(db)) {
        console.warn('Failed to persist failed outgoing message record.');
      }

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
    const { to, templateName, languageCode, components, parameters, variables, previewValues } = req.body || {};

    if (typeof to !== 'string' || !to.trim() || typeof templateName !== 'string' || !templateName.trim()) {
      return res.status(400).json({ success: false, error: 'Recipient phone number and template name are required.' });
    }

    if (languageCode !== undefined && (typeof languageCode !== 'string' || !/^[a-z]{2,3}(_[A-Z]{2,4})?$/.test(languageCode))) {
      return res.status(400).json({ success: false, error: 'Template language code is invalid.' });
    }

    if (components !== undefined && !Array.isArray(components)) {
      return res.status(400).json({ success: false, error: 'Template components must be an array.' });
    }

    const cleanTo = String(to).replace(/\D/g, '');
    if (cleanTo.length < 10 || cleanTo.length > 15) {
      return res.status(400).json({ success: false, error: 'Recipient phone number must contain 10 to 15 digits including country code.' });
    }
    const normalizedTemplateName = templateName.trim();
    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    // Consent check
    const contact = (db.whatsappContacts || []).find((c) => c.phone === cleanTo);
    const convo = (db.whatsappConversations || []).find((c) => c.id === cleanTo);
    if (contact && contact.consentStatus === 'OPTED_OUT') {
      return res.status(403).json({
        success: false,
        optedOut: true,
        error: `Consent Restriction: Recipient ${cleanTo} has opted out / unsubscribed. Outbound template suppressed.`,
      });
    }

    // Resolve template from DB cache if available
    const matchedTemplate = (db.whatsappTemplates || []).find((t) => t.name === normalizedTemplateName);

    let resolvedLanguageCode = languageCode || 'en_US';
    let resolvedComponents = Array.isArray(components) ? components : [];

    if (matchedTemplate) {
      resolvedLanguageCode = matchedTemplate.language || languageCode || 'en_US';

      // Validate and build component parameters according to approved template components
      const buildResult = templateBuilder.buildTemplateComponents(
        matchedTemplate,
        components || parameters || variables || previewValues || {}
      );

      if (!buildResult.success) {
        return res.status(400).json({
          success: false,
          error: buildResult.error,
          errorCode: 132000,
          errorDetails: buildResult.details,
        });
      }

      resolvedComponents = buildResult.components;
    }

    const startTime = Date.now();
    const correlationId = `COR-TMPL-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const result = await whatsappClient.sendTemplateMessage(
      config,
      {
        to: cleanTo,
        templateName: normalizedTemplateName,
        languageCode: resolvedLanguageCode,
        components: resolvedComponents,
        template: matchedTemplate,
      },
      db,
      saveDb
    );
    const durationMs = Date.now() - startTime;

    if (result.success && result.data?.messages?.[0]?.id) {
      const metaMsgId = result.data.messages[0].id;
      const timestamp = new Date().toISOString();
      const resolvedTenantId = req.body?.tenantId || convo?.tenantId || contact?.tenantId || db.activeWhatsAppTenantId || 'default';

      if (!Array.isArray(db.whatsappMessages)) db.whatsappMessages = [];
      db.whatsappMessages.push({
        id: metaMsgId,
        conversationId: cleanTo,
        direction: 'outbound',
        type: 'template',
        text: `[Template: ${templateName}]`,
        templateName,
        templateLanguage: resolvedLanguageCode,
        status: 'sent',
        timestamp,
        statusTimestamp: timestamp,
        sender: req.admin?.username || 'AST-ADMIN-01',
        rawPayload: result.data,
        tenantId: resolvedTenantId,
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
          tenantId: resolvedTenantId,
        };
        db.whatsappConversations.unshift(c);
      } else {
        c.lastMessage = `[Template: ${templateName}]`;
        c.lastMessageTimestamp = timestamp;
        if (!c.tenantId) c.tenantId = resolvedTenantId;
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
        tenantId: resolvedTenantId,
      });

      if (!saveDb(db)) {
        return res.status(503).json({ success: false, error: 'Template dispatched to Meta, but failed to persist template message record in database.' });
      }

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
      const failId = `FAIL-${Date.now()}`;
      if (!Array.isArray(db.whatsappMessages)) db.whatsappMessages = [];
      db.whatsappMessages.push({
        id: failId,
        conversationId: cleanTo,
        direction: 'outbound',
        type: 'template',
        text: `Template: ${templateName}`,
        templateName,
        templateLanguage: resolvedLanguageCode,
        status: 'failed',
        timestamp: new Date().toISOString(),
        errorMessage: result.error || 'Failed to dispatch WhatsApp template message.',
        errorCode: result.errorCode || result.data?.error?.code,
        errorSubcode: result.errorSubcode || result.data?.error?.error_subcode,
        errorType: result.errorType || result.data?.error?.type,
        errorDetails: result.errorDetails || result.data?.error?.error_data?.details || result.data?.error?.message,
        fbtraceId: result.fbtraceId || result.data?.error?.fbtrace_id,
        rawPayload: result.data,
      });

      whatsappClient.recordDeliveryLog(db, saveDb, {
        correlationId,
        messageId: null,
        to: cleanTo,
        operationType: 'TEMPLATE_SEND',
        httpStatus: result.status || 400,
        metaErrorCode: result.errorCode || result.data?.error?.code,
        metaErrorSubcode: result.errorSubcode || result.data?.error?.error_subcode,
        metaErrorType: result.errorType || result.data?.error?.type,
        metaErrorDetails: result.errorDetails || result.data?.error?.error_data?.details,
        metaErrorMessage: result.error,
        fbtraceId: result.fbtraceId || result.data?.error?.fbtrace_id,
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

  router.post('/messages/send-media', authenticateAdmin, async (req, res) => {
    const { to, mediaType = 'image', mediaUrl, mediaId, caption = '', filename = '' } = req.body || {};

    if (!to || (!mediaUrl && !mediaId)) {
      return res.status(400).json({
        success: false,
        error: 'Recipient phone number and either a media URL or Meta media ID are required.',
      });
    }

    const cleanTo = String(to).replace(/\D/g, '');
    if (cleanTo.length < 10 || cleanTo.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Recipient phone number must contain 10 to 15 digits including country code.',
      });
    }

    const validMediaTypes = ['image', 'document', 'audio', 'video'];
    const resolvedType = validMediaTypes.includes(mediaType) ? mediaType : 'image';

    const db = getDb();
    const config = whatsappClient.resolveConfig(db);

    // 1. Consent check
    const contact = (db.whatsappContacts || []).find((c) => c.phone === cleanTo);
    if (contact && contact.consentStatus === 'OPTED_OUT') {
      return res.status(403).json({
        success: false,
        optedOut: true,
        error: `Consent Restriction: Recipient ${cleanTo} has opted out. Outbound media suppressed.`,
      });
    }

    // 2. Customer service 24h window enforcement
    const convo = (db.whatsappConversations || []).find((c) => c.id === cleanTo);
    const lastInbound = convo?.lastInboundTimestamp ? new Date(convo.lastInboundTimestamp).getTime() : 0;
    const isWindowOpen = lastInbound > 0 && Date.now() - lastInbound < 24 * 60 * 60 * 1000;

    if (!isWindowOpen) {
      return res.status(400).json({
        success: false,
        windowExpired: true,
        error: 'Meta Policy Restriction: Outbound media messages require an active 24-hour customer service window. Outside the window, send an approved template.',
      });
    }

    const startTime = Date.now();
    const correlationId = `COR-MEDIA-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const result = await whatsappClient.sendMediaMessage(
      config,
      { to: cleanTo, mediaType: resolvedType, mediaUrl, mediaId, caption, filename },
      db,
      saveDb
    );
    const durationMs = Date.now() - startTime;

    if (result.success && result.data?.messages?.[0]?.id) {
      const metaMsgId = result.data.messages[0].id;
      const timestamp = new Date().toISOString();
      const resolvedTenantId = req.body?.tenantId || convo?.tenantId || contact?.tenantId || db.activeWhatsAppTenantId || 'default';

      if (!Array.isArray(db.whatsappMessages)) db.whatsappMessages = [];
      db.whatsappMessages.push({
        id: metaMsgId,
        conversationId: cleanTo,
        direction: 'outbound',
        type: resolvedType,
        text: caption ? `[${resolvedType.toUpperCase()}] ${caption}` : `[${resolvedType.toUpperCase()}]`,
        mediaUrl: mediaUrl || null,
        mediaId: mediaId || null,
        caption: caption || null,
        filename: filename || null,
        status: 'sent',
        timestamp,
        statusTimestamp: timestamp,
        sender: req.admin?.username || 'AST-ADMIN-01',
        rawPayload: result.data,
        tenantId: resolvedTenantId,
      });

      // Update conversation
      if (!Array.isArray(db.whatsappConversations)) db.whatsappConversations = [];
      let c = db.whatsappConversations.find((item) => item.id === cleanTo);
      if (!c) {
        c = {
          id: cleanTo,
          contactName: contact?.name || cleanTo,
          phone: cleanTo,
          lastMessage: `[${resolvedType.toUpperCase()}] ${caption || filename || ''}`.trim(),
          lastMessageTimestamp: timestamp,
          lastInboundTimestamp: null,
          unreadCount: 0,
          status: 'active',
          createdAt: timestamp,
          tenantId: resolvedTenantId,
        };
        db.whatsappConversations.unshift(c);
      } else {
        c.lastMessage = `[${resolvedType.toUpperCase()}] ${caption || filename || ''}`.trim();
        c.lastMessageTimestamp = timestamp;
        if (!c.tenantId) c.tenantId = resolvedTenantId;
      }

      whatsappClient.recordDeliveryLog(db, saveDb, {
        correlationId,
        messageId: metaMsgId,
        to: cleanTo,
        operationType: `MEDIA_${resolvedType.toUpperCase()}_SEND`,
        httpStatus: 200,
        metaErrorCode: null,
        metaErrorMessage: null,
        retryCount: 0,
        durationMs,
        success: true,
        tenantId: resolvedTenantId,
      });

      if (!saveDb(db)) {
        return res.status(503).json({ success: false, error: 'Media message dispatched to Meta, but failed to save record.' });
      }

      logAudit(req.admin?.username, 'MEDIA_MESSAGE_SENT', {
        to: cleanTo,
        mediaType: resolvedType,
        messageId: metaMsgId,
      });

      return res.json({
        success: true,
        messageId: metaMsgId,
        status: 'sent',
        data: result.data,
      });
    } else {
      const failId = `FAIL-${Date.now()}`;
      if (!Array.isArray(db.whatsappMessages)) db.whatsappMessages = [];
      db.whatsappMessages.push({
        id: failId,
        conversationId: cleanTo,
        direction: 'outbound',
        type: resolvedType,
        text: caption || `Media (${resolvedType})`,
        status: 'failed',
        timestamp: new Date().toISOString(),
        errorMessage: result.error || 'Failed to dispatch WhatsApp media message.',
        errorCode: result.errorCode || result.data?.error?.code,
        errorSubcode: result.errorSubcode || result.data?.error?.error_subcode,
        errorType: result.errorType || result.data?.error?.type,
        errorDetails: result.errorDetails || result.data?.error?.error_data?.details || result.data?.error?.message,
        fbtraceId: result.fbtraceId || result.data?.error?.fbtrace_id,
        rawPayload: result.data,
      });

      whatsappClient.recordDeliveryLog(db, saveDb, {
        correlationId,
        messageId: null,
        to: cleanTo,
        operationType: `MEDIA_${resolvedType.toUpperCase()}_SEND`,
        httpStatus: result.status || 400,
        metaErrorCode: result.errorCode || result.data?.error?.code,
        metaErrorSubcode: result.errorSubcode || result.data?.error?.error_subcode,
        metaErrorType: result.errorType || result.data?.error?.type,
        metaErrorDetails: result.errorDetails || result.data?.error?.error_data?.details,
        metaErrorMessage: result.error,
        fbtraceId: result.fbtraceId || result.data?.error?.fbtrace_id,
        retryCount: 0,
        durationMs,
        success: false,
      });

      return res.status(result.status || 400).json({
        success: false,
        error: result.error || 'Failed to dispatch WhatsApp media message.',
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

      if (!saveDb(db)) {
        return res.status(503).json({ success: false, error: 'Message retried, but failed to update status in database.' });
      }

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
      if (!saveDb(db)) {
        return res.status(503).json({ success: false, error: 'Templates fetched from Meta, but failed to save templates cache in database.' });
      }

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
      if (!saveDb(db)) {
        return res.status(503).json({ success: false, error: 'Template submitted to Meta, but failed to save template record in database.' });
      }

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
    const { search, consentStatus, tenantId, page = 1, limit = 50 } = req.query;
    const db = getDb();
    let contacts = db.whatsappContacts || [];

    if (tenantId) {
      contacts = contacts.filter((c) => c.tenantId === tenantId || (!c.tenantId && tenantId === 'default'));
    }

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
      tenantId: req.body?.tenantId || db.activeWhatsAppTenantId || 'default',
    };

    db.whatsappContacts.unshift(newContact);
    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'Failed to persist new contact record.' });
    }

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
    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'Failed to persist contact updates.' });
    }

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
    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'Failed to persist contact opt-out suppression.' });
    }

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
    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'Failed to persist contact opt-in status.' });
    }

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
    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'Failed to persist contact deletion.' });
    }

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
      verifyTokenConfigured: isConfigured,
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
    const { operationType, success, search, tenantId, page = 1, limit = 50 } = req.query;
    const db = getDb();
    let logs = db.whatsappDeliveryLogs || [];

    if (tenantId) {
      logs = logs.filter((l) => l.tenantId === tenantId || (!l.tenantId && tenantId === 'default'));
    }
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
    const { tenantId } = req.query;
    const db = getDb();
    let logs = db.whatsappDeliveryLogs || [];
    if (tenantId) {
      logs = logs.filter((l) => l.tenantId === tenantId || (!l.tenantId && tenantId === 'default'));
    }

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
    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'Failed to persist evaluated checklist state.' });
    }

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

    if (!saveDb(db)) {
      return res.status(503).json({ success: false, error: 'Failed to persist checklist item updates.' });
    }

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
    const db = getDb();
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
        code: 200,
        title: 'Permission Denied / Missing Scope',
        description: 'Request lacks whatsapp_business_messaging or whatsapp_business_management permission.',
        solution: 'Grant required permissions to the System User Access Token in Meta Business Manager.',
      },
      {
        code: 100,
        title: 'Invalid Parameter or Unknown Resource ID',
        description: 'Graph API parameter invalid, or requested node / phone number ID does not exist (subcode 33).',
        solution: 'Check Phone Number ID and WABA ID in Configuration against Meta Developer App dashboard.',
      },
      {
        code: 132000,
        title: 'Template Does Not Exist or Unapproved',
        description: 'The requested message template has not been approved or is not present under this WABA.',
        solution: 'Create and submit the message template in Meta WhatsApp Manager and wait for approval.',
      },
      {
        code: 132001,
        title: 'Template Name Not Found for Locale',
        description: 'Template name does not exist in the specified language code (e.g. en_US).',
        solution: 'Verify the template translation exists for the requested language code.',
      },
      {
        code: 133004,
        title: 'Phone Number Not Registered',
        description: 'Phone number has not completed two-step verification PIN registration.',
        solution: 'Register phone number two-step verification PIN via Meta WhatsApp Manager.',
      },
      {
        code: 80007,
        title: 'Rate Limit Exceeded',
        description: 'Messaging throughput tier limit reached.',
        solution: 'Pause automated dispatches; Cloud API will recover automatically in the next window.',
      },
    ];

    // Safely extract historical HTTP 400 and 404 errors preserving Meta error codes without exposing credentials
    const apiLogs = Array.isArray(db?.whatsappApiLogs) ? db.whatsappApiLogs : [];
    const deliveryLogs = Array.isArray(db?.whatsappDeliveryLogs) ? db.whatsappDeliveryLogs : [];
    const historicalErrors = [];
    const seenErrors = new Set();

    for (const log of apiLogs) {
      if (!log.success && (log.responseStatus >= 400 || log.metaErrorCode)) {
        const key = `${log.responseStatus}-${log.metaErrorCode || ''}-${log.endpoint}`;
        if (!seenErrors.has(key)) {
          seenErrors.add(key);
          historicalErrors.push({
            source: 'API_LOG',
            endpoint: log.endpoint,
            method: log.method,
            httpStatus: log.responseStatus,
            metaErrorCode: log.metaErrorCode || log.responseBody?.error?.code || null,
            metaErrorSubcode: log.metaErrorSubcode || log.responseBody?.error?.error_subcode || null,
            metaErrorType: log.metaErrorType || log.responseBody?.error?.type || null,
            metaErrorMessage: log.errorMessage || log.responseBody?.error?.message || null,
            metaErrorDetails: log.metaErrorDetails || log.responseBody?.error?.error_data?.details || null,
            fbtraceId: log.fbtraceId || log.responseBody?.error?.fbtrace_id || null,
            timestamp: log.timestamp,
          });
        }
      }
    }

    for (const dlv of deliveryLogs) {
      if (!dlv.success && (dlv.httpStatus >= 400 || dlv.metaErrorCode)) {
        const key = `DLV-${dlv.httpStatus}-${dlv.metaErrorCode || ''}-${dlv.operationType}`;
        if (!seenErrors.has(key)) {
          seenErrors.add(key);
          historicalErrors.push({
            source: 'DELIVERY_LOG',
            operationType: dlv.operationType,
            httpStatus: dlv.httpStatus,
            metaErrorCode: dlv.metaErrorCode,
            metaErrorSubcode: dlv.metaErrorSubcode || null,
            metaErrorType: dlv.metaErrorType || null,
            metaErrorMessage: dlv.metaErrorMessage,
            metaErrorDetails: dlv.metaErrorDetails || null,
            fbtraceId: dlv.fbtraceId || null,
            timestamp: dlv.timestamp,
          });
        }
      }
    }

    res.json({
      success: true,
      data: errorDictionary,
      historicalErrors,
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
        tokenStorage: config.token
          ? (process.env.WHATSAPP_API_TOKEN ? 'Server environment' : 'Server-side JSON configuration')
          : 'Not configured',
        hasToken: Boolean(config.token),
        hasAppSecret: Boolean(config.appSecret),
        webhookSignatureVerification: Boolean(config.appSecret) ? 'ACTIVE_HMAC_SHA256' : 'APP_SECRET_PENDING',
        dataRetentionPolicy: 'Meta deletion requests are recorded as PENDING. Local data erasure is not automated or confirmed.',
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
