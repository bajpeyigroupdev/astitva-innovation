const crypto = require('crypto');

/**
 * Meta WhatsApp Cloud API Webhook Handler
 * Provides cryptographic HMAC-SHA256 signature verification,
 * idempotent event deduplication, and conversation thread updates.
 */

class WhatsAppWebhookHandler {
  /**
   * Verify Meta GET webhook challenge request
   */
  verifyChallenge(req, res, config) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedToken = config?.verifyToken || process.env.WHATSAPP_VERIFY_TOKEN || '';

    if (expectedToken && mode === 'subscribe' && token === expectedToken) {
      console.log('✓ Meta WhatsApp Webhook GET challenge verified successfully.');
      return res.status(200).send(challenge);
    } else {
      console.warn('✗ Meta WhatsApp Webhook GET challenge failed. Token mismatch.');
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid verification token or missing hub.mode=subscribe',
      });
    }
  }

  /**
   * Cryptographically verify Meta X-Hub-Signature-256 header against raw request body
   */
  verifySignature(req, appSecret) {
    if (!appSecret) {
      // If no app secret is configured yet, signature validation is skipped
      return { verified: true, reason: 'APP_SECRET_NOT_CONFIGURED' };
    }

    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
      return { verified: false, reason: 'MISSING_SIGNATURE_HEADER' };
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      return { verified: false, reason: 'RAW_BODY_UNAVAILABLE' };
    }

    try {
      const hmac = crypto.createHmac('sha256', appSecret);
      const digest = 'sha256=' + hmac.update(rawBody).digest('hex');

      const expectedBuffer = Buffer.from(digest, 'utf8');
      const actualBuffer = Buffer.from(signature, 'utf8');

      if (expectedBuffer.length !== actualBuffer.length) {
        return { verified: false, reason: 'SIGNATURE_LENGTH_MISMATCH' };
      }

      const match = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
      return { verified: match, reason: match ? 'MATCH' : 'SIGNATURE_MISMATCH' };
    } catch (err) {
      return { verified: false, reason: err.message };
    }
  }

  /**
   * Process incoming Meta WhatsApp Webhook POST event
   */
  async handleIncomingEvent(req, res, { db, saveDb, config }) {
    const appSecret = config?.appSecret || process.env.WHATSAPP_APP_SECRET;
    const sigCheck = this.verifySignature(req, appSecret);

    if (appSecret && !sigCheck.verified) {
      console.warn(`[WhatsApp Webhook] Signature verification rejected: ${sigCheck.reason}`);
      return res.status(403).json({ error: 'Signature verification failed', reason: sigCheck.reason });
    }

    // Acknowledge Meta immediately with 200 OK
    res.status(200).json({ status: 'EVENT_RECEIVED' });

    const body = req.body;
    if (!body || body.object !== 'whatsapp_business_account') {
      return;
    }

    const eventId = `WH-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    let eventSummary = 'Unknown Event';
    let processedCount = 0;

    try {
      if (!Array.isArray(db.whatsappMessages)) db.whatsappMessages = [];
      if (!Array.isArray(db.whatsappConversations)) db.whatsappConversations = [];
      if (!Array.isArray(db.whatsappWebhookLogs)) db.whatsappWebhookLogs = [];

      const entries = Array.isArray(body.entry) ? body.entry : [];

      for (const entry of entries) {
        const changes = Array.isArray(entry.changes) ? entry.changes : [];

        for (const change of changes) {
          if (change.field !== 'messages') continue;
          const val = change.value;
          if (!val) continue;

          // Process Contact Information
          const contactsMap = {};
          if (Array.isArray(val.contacts)) {
            for (const c of val.contacts) {
              if (c.wa_id) {
                contactsMap[c.wa_id] = c.profile?.name || c.wa_id;
              }
            }
          }

          // 1. Process Incoming User Messages
          if (Array.isArray(val.messages)) {
            for (const msg of val.messages) {
              const msgId = msg.id;
              const sender = msg.from; // e.g. "919820144556"
              const senderName = contactsMap[sender] || sender;
              const timestamp = msg.timestamp ? new Date(parseInt(msg.timestamp) * 1000).toISOString() : new Date().toISOString();

              // Idempotency check: Skip if already recorded
              const exists = db.whatsappMessages.some((m) => m.id === msgId);
              if (exists) {
                console.log(`[WhatsApp Webhook] Message ${msgId} already exists. Skipping duplicate.`);
                continue;
              }

              let messageText = '';
              let messageType = msg.type || 'text';

              if (msg.type === 'text') {
                messageText = msg.text?.body || '';
              } else if (msg.type === 'interactive') {
                if (msg.interactive?.type === 'button_reply') {
                  messageText = msg.interactive.button_reply.title || msg.interactive.button_reply.id;
                } else if (msg.interactive?.type === 'list_reply') {
                  messageText = msg.interactive.list_reply.title || msg.interactive.list_reply.id;
                }
              } else if (msg.type === 'button') {
                messageText = msg.button?.text || '';
              } else if (['image', 'audio', 'video', 'document', 'sticker'].includes(msg.type)) {
                messageText = `[${msg.type.toUpperCase()}] ${msg[msg.type]?.caption || msg[msg.type]?.filename || ''}`.trim();
              } else {
                messageText = `[${msg.type || 'Unknown'}]`;
              }

              // Store incoming message
              db.whatsappMessages.push({
                id: msgId,
                conversationId: sender,
                direction: 'inbound',
                type: messageType,
                text: messageText,
                status: 'delivered',
                timestamp,
                statusTimestamp: timestamp,
                senderName,
                rawPayload: msg,
              });

              // Process Contact Opt-in / Opt-out Consent Rules
              const upperText = (messageText || '').trim().toUpperCase();
              const isOptOut = ['STOP', 'UNSUBSCRIBE', 'OPT OUT', 'OPTOUT', 'CANCEL', 'QUIT'].includes(upperText);
              const isOptIn = ['START', 'UNSTOP', 'OPT IN', 'OPTIN', 'YES', 'SUBSCRIBE'].includes(upperText);

              if (!Array.isArray(db.whatsappContacts)) db.whatsappContacts = [];
              let contact = db.whatsappContacts.find((c) => c.phone === sender);

              if (isOptOut) {
                if (contact) {
                  contact.consentStatus = 'OPTED_OUT';
                  contact.optOutTimestamp = timestamp;
                  contact.notes = (contact.notes ? `${contact.notes} | ` : '') + `User opted out via inbound keyword "${upperText}" at ${timestamp}`;
                } else {
                  contact = {
                    id: `cnt-${Date.now()}-${sender.slice(-4)}`,
                    phone: sender,
                    name: senderName,
                    consentStatus: 'OPTED_OUT',
                    consentSource: 'INBOUND_STOP_KEYWORD',
                    consentTimestamp: timestamp,
                    optOutTimestamp: timestamp,
                    notes: `Suppression requested via inbound keyword "${upperText}".`,
                    tags: ['Suppressed', 'Opted-Out'],
                  };
                  db.whatsappContacts.unshift(contact);
                }
              } else if (isOptIn) {
                if (contact) {
                  contact.consentStatus = 'OPTED_IN';
                  contact.consentTimestamp = timestamp;
                  contact.optOutTimestamp = null;
                } else {
                  contact = {
                    id: `cnt-${Date.now()}-${sender.slice(-4)}`,
                    phone: sender,
                    name: senderName,
                    consentStatus: 'OPTED_IN',
                    consentSource: 'INBOUND_START_KEYWORD',
                    consentTimestamp: timestamp,
                    optOutTimestamp: null,
                    notes: `Opt-in requested via inbound keyword "${upperText}".`,
                    tags: ['Inbound', 'Verified'],
                  };
                  db.whatsappContacts.unshift(contact);
                }
              } else if (!contact) {
                // Auto-create contact from inbound customer inquiry (User-initiated opt-in)
                contact = {
                  id: `cnt-${Date.now()}-${sender.slice(-4)}`,
                  phone: sender,
                  name: senderName,
                  consentStatus: 'OPTED_IN',
                  consentSource: 'DIRECT_INBOUND_WHATSAPP',
                  consentTimestamp: timestamp,
                  optOutTimestamp: null,
                  notes: 'Created automatically from direct inbound customer message.',
                  tags: ['Direct Inbound'],
                };
                db.whatsappContacts.unshift(contact);
              }

              // Record Inbound Delivery Log
              if (!Array.isArray(db.whatsappDeliveryLogs)) db.whatsappDeliveryLogs = [];
              db.whatsappDeliveryLogs.unshift({
                id: `DLV-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
                correlationId: `COR-IN-${msgId.slice(-8)}`,
                timestamp,
                messageId: msgId,
                to: sender,
                operationType: 'INBOUND_RECEIVE',
                httpStatus: 200,
                metaErrorCode: null,
                metaErrorMessage: null,
                retryCount: 0,
                durationMs: 0,
                success: true,
              });
              if (db.whatsappDeliveryLogs.length > 500) {
                db.whatsappDeliveryLogs = db.whatsappDeliveryLogs.slice(0, 500);
              }

              // Update conversation thread & 24h Customer Care Window
              let convo = db.whatsappConversations.find((c) => c.id === sender);
              if (!convo) {
                convo = {
                  id: sender,
                  contactName: senderName,
                  phone: sender,
                  lastMessage: messageText,
                  lastMessageTimestamp: timestamp,
                  lastInboundTimestamp: timestamp,
                  unreadCount: 1,
                  status: 'active',
                  createdAt: timestamp,
                };
                db.whatsappConversations.unshift(convo);
              } else {
                convo.contactName = senderName || convo.contactName;
                convo.lastMessage = messageText;
                convo.lastMessageTimestamp = timestamp;
                convo.lastInboundTimestamp = timestamp; // Opens / extends 24-hour window!
                convo.unreadCount = (convo.unreadCount || 0) + 1;
              }

              eventSummary = `Incoming message from ${senderName} (${sender}): "${messageText.substring(0, 30)}"`;
              processedCount++;
            }
          }

          // 2. Process Message Status Updates (sent, delivered, read, failed)
          if (Array.isArray(val.statuses)) {
            for (const statusObj of val.statuses) {
              const msgId = statusObj.id;
              const newStatus = statusObj.status; // 'sent' | 'delivered' | 'read' | 'failed'
              const statusTimestamp = statusObj.timestamp ? new Date(parseInt(statusObj.timestamp) * 1000).toISOString() : new Date().toISOString();

              const targetMsg = db.whatsappMessages.find((m) => m.id === msgId);
              if (targetMsg) {
                targetMsg.status = newStatus;
                targetMsg.statusTimestamp = statusTimestamp;

                if (statusObj.pricing) {
                  targetMsg.pricing = statusObj.pricing;
                }

                let errorCode = null;
                let errorMessage = null;
                let errorDetails = '';

                if (newStatus === 'failed' && Array.isArray(statusObj.errors) && statusObj.errors.length > 0) {
                  const err = statusObj.errors[0];
                  errorCode = err.code;
                  errorMessage = err.message || err.title || 'Delivery failed';
                  errorDetails = err.error_data?.details || '';
                  targetMsg.errorCode = errorCode;
                  targetMsg.errorMessage = errorMessage;
                  targetMsg.errorDetails = errorDetails;
                }

                // Record Status Update Delivery Log
                if (!Array.isArray(db.whatsappDeliveryLogs)) db.whatsappDeliveryLogs = [];
                const isFailed = newStatus === 'failed';
                db.whatsappDeliveryLogs.unshift({
                  id: `DLV-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
                  correlationId: `COR-STAT-${msgId.slice(-8)}`,
                  timestamp: statusTimestamp,
                  messageId: msgId,
                  to: targetMsg.conversationId || '',
                  operationType: 'STATUS_UPDATE',
                  httpStatus: isFailed ? 400 : 200,
                  metaErrorCode: errorCode,
                  metaErrorMessage: isFailed ? errorMessage : `Status transitioned to ${newStatus}`,
                  retryCount: 0,
                  durationMs: 0,
                  success: !isFailed,
                });
                if (db.whatsappDeliveryLogs.length > 500) {
                  db.whatsappDeliveryLogs = db.whatsappDeliveryLogs.slice(0, 500);
                }

                eventSummary = `Status update for ${msgId}: ${newStatus.toUpperCase()}`;
                processedCount++;
              }
            }
          }
        }
      }

      // Log webhook event
      db.whatsappWebhookLogs.unshift({
        id: eventId,
        timestamp: new Date().toISOString(),
        eventSummary,
        signatureVerified: sigCheck.verified,
        remoteIp: req.ip || req.connection?.remoteAddress,
        processedCount,
        payload: body,
      });

      // Maintain last 200 webhook logs
      if (db.whatsappWebhookLogs.length > 200) {
        db.whatsappWebhookLogs = db.whatsappWebhookLogs.slice(0, 200);
      }

      saveDb(db);
    } catch (err) {
      console.error('[WhatsApp Webhook] Processing error:', err);
    }
  }
}

module.exports = new WhatsAppWebhookHandler();
