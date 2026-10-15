const assert = require("node:assert/strict");
const { mergeAdminSettings, sanitizeAdminSettings } = require("../settingsSecurity");

const sentinelToken = "unit-test-only-telegram-token";
const initial = {
  brandName: "Test Company",
  telegramBotToken: sentinelToken,
  telegramChatId: "test-chat-id",
};

const sanitized = sanitizeAdminSettings(initial);
assert.equal(sanitized.hasTelegramBotToken, true);
assert.equal(Object.hasOwn(sanitized, "telegramBotToken"), false);
assert.equal(JSON.stringify(sanitized).includes(sentinelToken), false);

const keptToken = mergeAdminSettings(initial, {
  brandName: "Updated Company",
  telegramBotToken: "",
  hasTelegramBotToken: false,
});
assert.equal(keptToken.telegramBotToken, sentinelToken);
assert.equal(keptToken.brandName, "Updated Company");

const rotatedToken = mergeAdminSettings(initial, { telegramBotToken: " replacement-token " });
assert.equal(rotatedToken.telegramBotToken, "replacement-token");

const clearedToken = mergeAdminSettings(initial, { clearTelegramBotToken: true });
assert.equal(Object.hasOwn(clearedToken, "telegramBotToken"), false);

console.log("PASS: admin settings redact Telegram tokens and preserve/rotate/clear them safely");
