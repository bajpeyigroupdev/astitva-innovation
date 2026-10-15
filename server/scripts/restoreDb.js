#!/usr/bin/env node
/**
 * Astitva Innovation Database Restore & Rollback Utility
 * Safely restores the primary JSON database from a chosen backup snapshot or latest valid backup.
 * Always creates a safety snapshot before modifying production state.
 */

const path = require('path');
const fs = require('fs');
const storage = require('../storage');

const targetPath = process.argv[2];

if (!targetPath) {
  console.log(`[Rollback] No backup path specified. Looking for latest valid backup...`);
  const latest = storage.getLatestValidBackup();
  if (!latest) {
    console.error(`✗ No valid backup snapshots found in ${storage.BACKUPS_DIR}`);
    process.exit(1);
  }
  console.log(`Found candidate backup: ${latest.source}`);
  performRestore(latest.source);
} else {
  const resolvedPath = path.isAbsolute(targetPath) ? targetPath : path.resolve(process.cwd(), targetPath);
  performRestore(resolvedPath);
}

function performRestore(filePath) {
  console.log(`[Rollback] Preparing rollback from: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.error(`✗ Specified backup file does not exist: ${filePath}`);
    process.exit(1);
  }

  const result = storage.restoreFromBackupFile(filePath);
  if (result.success) {
    console.log(`✓ Rollback successfully completed!`);
    console.log(`  Target restored from: ${filePath}`);
    console.log(`  Pre-rollback safety snapshot saved to backups directory.`);
  } else {
    console.error(`✗ Rollback failed: ${result.error}`);
    process.exit(1);
  }
}
