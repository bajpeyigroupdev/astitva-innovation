function sanitizeAdminSettings(settings = {}) {
  const { telegramBotToken, clearTelegramBotToken, ...safeSettings } = settings;
  return {
    ...safeSettings,
    hasTelegramBotToken: Boolean(telegramBotToken),
  };
}

function mergeAdminSettings(currentSettings = {}, updates = {}) {
  const {
    telegramBotToken,
    clearTelegramBotToken,
    hasTelegramBotToken,
    ...safeUpdates
  } = updates && typeof updates === "object" && !Array.isArray(updates) ? updates : {};

  const nextSettings = {
    ...currentSettings,
    ...safeUpdates,
    updatedAt: new Date().toISOString(),
  };

  if (clearTelegramBotToken === true) {
    delete nextSettings.telegramBotToken;
  } else if (typeof telegramBotToken === "string" && telegramBotToken.trim()) {
    nextSettings.telegramBotToken = telegramBotToken.trim();
  }

  return nextSettings;
}

module.exports = { sanitizeAdminSettings, mergeAdminSettings };
