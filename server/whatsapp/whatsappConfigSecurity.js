const crypto = require('crypto');

const LEGACY_DEFAULT_VERIFY_TOKEN_HASH = '6b4ce31b26d2547b7174deefe03b61f570fe14493a38ea3778588682dacfaca7';

function clearLegacyDefaultVerifyToken(db) {
  const token = db?.whatsappConfig?.verifyToken;
  if (typeof token !== 'string') return false;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  if (tokenHash !== LEGACY_DEFAULT_VERIFY_TOKEN_HASH) return false;

  db.whatsappConfig.verifyToken = '';
  return true;
}

function clearUnverifiedWhatsAppClaims(db) {
  const config = db?.whatsappConfig;
  if (!config || typeof config !== 'object' || Array.isArray(config)
      || config.verificationSchemaVersion === 2) {
    return false;
  }

  if (config.status === 'Connected') {
    config.status = 'Pending';
  }
  if (config.qualityRating !== 'UNKNOWN') {
    config.qualityRating = 'UNKNOWN';
  }
  if (config.codeVerificationStatus !== 'NOT_VERIFIED') {
    config.codeVerificationStatus = 'NOT_VERIFIED';
  }
  if (config.messagingLimitTier !== 'UNKNOWN') {
    config.messagingLimitTier = 'UNKNOWN';
  }
  if (config.connectionVerifiedAt) {
    config.connectionVerifiedAt = null;
  }
  if (config.webhookVerified) {
    config.webhookVerified = false;
    config.webhookVerifiedAt = null;
  }
  if (config.webhookSubscriptionStatus === 'Subscribed') {
    config.webhookSubscriptionStatus = 'Pending';
  }
  if (config.privacyPolicyVerified) {
    config.privacyPolicyVerified = false;
  }

  config.verificationSchemaVersion = 2;
  return true;
}

module.exports = { clearLegacyDefaultVerifyToken, clearUnverifiedWhatsAppClaims };
