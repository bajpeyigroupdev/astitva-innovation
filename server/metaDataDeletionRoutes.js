const express = require('express');
const { getDataDeletionStatus, registerDataDeletionRequest } = require('./metaDataDeletion');

function createMetaDataDeletionRouter({ getDb, saveDb }) {
  const router = express.Router();

  router.post(['/auth/data-deletion', '/whatsapp/data-deletion'], (req, res) => {
    const db = getDb();
    const appSecret = process.env.WHATSAPP_APP_SECRET || db.whatsappConfig?.appSecret || '';
    if (!appSecret) {
      return res.status(503).json({ error: 'Data deletion callback is not configured.' });
    }

    const result = registerDataDeletionRequest(db, req.body?.signed_request, appSecret);
    if (result.error) {
      return res.status(403).json({ error: 'The signed data deletion request is invalid.' });
    }

    if (result.created && !saveDb(db)) {
      return res.status(503).json({ error: 'The data deletion request could not be recorded. Please retry.' });
    }

    const confirmationCode = result.request.confirmationCode;
    const statusUrl = `https://astitvainnovation.in/api/auth/data-deletion-status?code=${encodeURIComponent(confirmationCode)}`;
    return res.json({ url: statusUrl, confirmation_code: confirmationCode });
  });

  router.get(['/auth/data-deletion-status', '/auth/data-deletion-status/:id'], (req, res) => {
    const code = req.query?.code || req.params?.id;
    const requestStatus = getDataDeletionStatus(getDb(), code);
    if (!requestStatus) {
      return res.status(404).json({ success: false, error: 'Data deletion request not found.' });
    }

    return res.json({
      success: true,
      ...requestStatus,
      message: 'Request received. Data deletion has not been confirmed. Contact privacy@astitvainnovation.in for status.',
      organization: 'Astitva Innovation',
      privacyEmail: 'privacy@astitvainnovation.in',
    });
  });

  return router;
}

module.exports = createMetaDataDeletionRouter;
