const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Screenshot and Screencast Evidence Manager for Meta App Review & Technical Audits
 */

const EVIDENCE_DIR = path.join(__dirname, '..', 'data', 'evidence');

// Supported categories as per Meta App Review requirements
const VALID_CATEGORIES = [
  'WhatsApp account connection',
  'Actual outbound test message',
  'Recipient-side message receipt',
  'Actual inbound message',
  'Webhook event processing',
  'Message status update',
  'Template approval',
  'Privacy policy and public business information',
  'Permission-specific user journey',
  'Meta App Review screencast',
  'API errors and troubleshooting',
  'WhatsApp Business Management features',
  'WhatsApp Business Account connection',
  'Phone number registration',
  'Sending a message',
  'Receiving a message',
  'Message delivery status',
  'Webhook events',
];

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
];

class EvidenceManager {
  constructor() {
    this.ensureDirectory();
  }

  ensureDirectory() {
    if (!fs.existsSync(EVIDENCE_DIR)) {
      fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    }
  }

  getEvidenceDir() {
    return EVIDENCE_DIR;
  }

  getValidCategories() {
    return VALID_CATEGORIES;
  }

  /**
   * Save uploaded evidence file from Base64 or Buffer with strict validation
   */
  async saveEvidence({
    fileName,
    mimeType,
    fileData,
    category,
    uploader,
    relatedIntegrationId,
    testRunId,
    evidenceType,
    notes,
    isRedacted = false,
    db,
    saveDb,
  }) {
    this.ensureDirectory();

    if (!fileName || !fileData) {
      throw new Error('File name and file content are required.');
    }

    const cleanMime = (mimeType || 'image/png').toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(cleanMime)) {
      throw new Error(`Unsupported file type "${cleanMime}". Allowed formats: PNG, JPEG, WEBP, MP4, WEBM.`);
    }

    if (!VALID_CATEGORIES.includes(category)) {
      category = 'Meta App Review screencast';
    }

    // Determine clean extension
    let ext = path.extname(fileName).toLowerCase();
    if (!ext) {
      if (cleanMime === 'image/png') ext = '.png';
      else if (cleanMime === 'image/jpeg') ext = '.jpg';
      else if (cleanMime === 'image/webp') ext = '.webp';
      else if (cleanMime === 'video/mp4') ext = '.mp4';
      else if (cleanMime === 'video/webm') ext = '.webm';
      else ext = '.bin';
    }

    const fileId = `EVD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const storageFileName = `${fileId}${ext}`;
    const storagePath = path.join(EVIDENCE_DIR, storageFileName);

    let buffer;
    if (Buffer.isBuffer(fileData)) {
      buffer = fileData;
    } else if (typeof fileData === 'string') {
      // Check for base64 prefix: "data:image/png;base64,..."
      const commaIndex = fileData.indexOf(',');
      const base64Content = commaIndex !== -1 ? fileData.slice(commaIndex + 1) : fileData;
      buffer = Buffer.from(base64Content, 'base64');
    } else {
      throw new Error('Unsupported file data format.');
    }

    // Max 50MB limit
    if (buffer.length > 50 * 1024 * 1024) {
      throw new Error('File size exceeds the 50MB maximum allowable limit.');
    }

    fs.writeFileSync(storagePath, buffer);

    const record = {
      id: fileId,
      fileName: fileName.trim(),
      storageFileName,
      category,
      evidenceType: evidenceType || (cleanMime.startsWith('video/') ? 'SCREENCAST' : 'SCREENSHOT'),
      mimeType: cleanMime,
      fileSize: buffer.length,
      uploadedAt: new Date().toISOString(),
      uploader: uploader || 'AST-ADMIN-01',
      relatedIntegrationId: relatedIntegrationId || 'WABA-ASTITVA-01',
      testRunId: testRunId || null,
      notes: notes || '',
      isRedacted: Boolean(isRedacted),
      url: `/api/whatsapp/evidence/${fileId}/file`,
    };

    if (!Array.isArray(db.whatsappEvidence)) {
      db.whatsappEvidence = [];
    }
    db.whatsappEvidence.unshift(record);
    saveDb(db);

    return record;
  }

  /**
   * Retrieve file path for downloading/previewing
   */
  getFilePath(id, db) {
    const record = (db.whatsappEvidence || []).find((e) => e.id === id);
    if (!record) return null;

    const fullPath = path.join(EVIDENCE_DIR, record.storageFileName);
    if (!fs.existsSync(fullPath)) return null;

    return { record, fullPath };
  }

  /**
   * Update evidence metadata (rename, notes, category, redaction status, test run)
   */
  updateEvidence(id, updates, db, saveDb) {
    if (!Array.isArray(db.whatsappEvidence)) return null;
    const index = db.whatsappEvidence.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const item = db.whatsappEvidence[index];
    if (updates.fileName) item.fileName = updates.fileName.trim();
    if (updates.notes !== undefined) item.notes = updates.notes;
    if (updates.category && VALID_CATEGORIES.includes(updates.category)) item.category = updates.category;
    if (updates.isRedacted !== undefined) item.isRedacted = Boolean(updates.isRedacted);
    if (updates.relatedIntegrationId !== undefined) item.relatedIntegrationId = updates.relatedIntegrationId;
    if (updates.testRunId !== undefined) item.testRunId = updates.testRunId;

    item.updatedAt = new Date().toISOString();
    saveDb(db);
    return item;
  }

  /**
   * Delete evidence file and database record
   */
  deleteEvidence(id, db, saveDb) {
    if (!Array.isArray(db.whatsappEvidence)) return false;
    const index = db.whatsappEvidence.findIndex((e) => e.id === id);
    if (index === -1) return false;

    const [item] = db.whatsappEvidence.splice(index, 1);
    const fullPath = path.join(EVIDENCE_DIR, item.storageFileName);
    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (e) {
      console.warn(`Could not remove evidence file ${fullPath}:`, e.message);
    }

    saveDb(db);
    return true;
  }
}

module.exports = new EvidenceManager();
