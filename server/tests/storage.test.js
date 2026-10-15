const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Create isolated scratch test directory
const testDir = path.join(__dirname, 'scratch-storage-test-' + Date.now());
fs.mkdirSync(testDir, { recursive: true });

process.env.DATA_DIR = testDir;
process.env.DB_FILE = path.join(testDir, 'db.json');

const storage = require('../storage');

try {
  // 1. Initial read should seed database
  const db1 = storage.getDb();
  assert.ok(db1.settings);
  assert.strictEqual(db1.settings.brandName, "Astitva Innovation");
  assert.ok(fs.existsSync(storage.DB_FILE), "db.json should exist on disk");

  // 2. Modify and save atomically
  db1.inquiries.push({ id: "TEST-INQ-001", name: "Integration Test Customer" });
  const saveSuccess = storage.saveDb(db1);
  assert.strictEqual(saveSuccess, true);

  const db2 = storage.getDb();
  assert.strictEqual(db2.inquiries.length, 1);
  assert.strictEqual(db2.inquiries[0].id, "TEST-INQ-001");

  // 3. Named backup creation
  const backupResult = storage.createNamedBackup("test-run");
  assert.strictEqual(backupResult.success, true);
  assert.ok(fs.existsSync(backupResult.path));

  // 4. Modify further
  db2.inquiries.push({ id: "TEST-INQ-002", name: "Second Lead" });
  storage.saveDb(db2);
  assert.strictEqual(storage.getDb().inquiries.length, 2);

  // 5. Restore from backup
  const restoreResult = storage.restoreFromBackupFile(backupResult.path);
  assert.strictEqual(restoreResult.success, true);
  const dbRestored = storage.getDb();
  assert.strictEqual(dbRestored.inquiries.length, 1);
  assert.strictEqual(dbRestored.inquiries[0].id, "TEST-INQ-001");

  // 6. Test corruption recovery: write invalid syntax to db.json
  fs.writeFileSync(storage.DB_FILE, "{ corrupt_json: non_terminated_string ... ");
  const recoveredDb = storage.getDb();
  assert.ok(recoveredDb, "Should recover data from backup");
  assert.ok(recoveredDb.inquiries.length >= 1, "Recovered data must preserve inquiries");

  // 7. Verify write rejection on invalid inputs
  assert.strictEqual(storage.saveDb(null), false);
  assert.strictEqual(storage.saveDb("not an object"), false);

  console.log("PASS: storage reliability, atomic writes, corruption recovery, and backup restoration verified");
} finally {
  // Clean up test directory
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch (_) {}
}
