const crypto = require('node:crypto');

function verifyMetaSignedRequest(signedRequest, appSecret) {
  if (typeof signedRequest !== 'string' || typeof appSecret !== 'string' || !appSecret) {
    return null;
  }

  const parts = signedRequest.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]
      || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !/^[A-Za-z0-9_-]+$/.test(parts[1])) {
    return null;
  }

  try {
    const signature = Buffer.from(parts[0], 'base64url');
    const expectedSignature = crypto.createHmac('sha256', appSecret).update(parts[1]).digest();
    if (signature.length !== expectedSignature.length
        || !crypto.timingSafeEqual(signature, expectedSignature)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (payload?.algorithm !== 'HMAC-SHA256'
        || typeof payload.user_id !== 'string'
        || payload.user_id.trim().length === 0) {
      return null;
    }

    return {
      requestHash: crypto.createHash('sha256').update(signedRequest).digest('hex'),
      userIdHash: crypto.createHash('sha256').update(payload.user_id).digest('hex'),
    };
  } catch {
    return null;
  }
}

function registerDataDeletionRequest(db, signedRequest, appSecret, requestedAt = new Date().toISOString()) {
  const verified = verifyMetaSignedRequest(signedRequest, appSecret);
  if (!verified) return { error: 'INVALID_SIGNED_REQUEST' };

  if (!Array.isArray(db.metaDataDeletionRequests)) db.metaDataDeletionRequests = [];
  const previousRequest = db.metaDataDeletionRequests.find(
    (request) => request.requestHash === verified.requestHash,
  );
  if (previousRequest) return { request: previousRequest, created: false };

  const request = {
    confirmationCode: `DEL-${crypto.randomBytes(18).toString('hex').toUpperCase()}`,
    requestHash: verified.requestHash,
    userIdHash: verified.userIdHash,
    status: 'PENDING',
    requestedAt,
    updatedAt: requestedAt,
  };
  db.metaDataDeletionRequests.unshift(request);
  return { request, created: true };
}

function getDataDeletionStatus(db, confirmationCode) {
  if (typeof confirmationCode !== 'string' || confirmationCode.length === 0) return null;
  if (!Array.isArray(db.metaDataDeletionRequests)) return null;

  const request = db.metaDataDeletionRequests.find(
    (item) => item.confirmationCode === confirmationCode,
  );
  if (!request) return null;

  return {
    confirmationCode: request.confirmationCode,
    status: request.status,
    requestedAt: request.requestedAt,
    updatedAt: request.updatedAt,
  };
}

module.exports = {
  getDataDeletionStatus,
  registerDataDeletionRequest,
  verifyMetaSignedRequest,
};
