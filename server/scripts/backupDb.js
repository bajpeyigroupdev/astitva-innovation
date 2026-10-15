#!/usr/bin/env node
/**
 * Astitva Innovation Database Backup Utility
 * Creates a verified timestamped snapshot of the primary JSON database.
 */

const path = require('path');
const storage = require('../storage');

const tag = process.argv[2] || 'cli-backup';
console.log(`[Backup] Initiating database snapshot with tag: "${tag}"...`);

try {
  const result = storage.createNamedBackup(tag);
  if (result.success) {
    console.log(`✓ Backup successfully created:`);
    console.log(`  File: ${result.filename}`);
    console.log(`  Path: ${result.path}`);
  } else {
    console.error(`✗ Backup failed.`);
    process.exit(1);
  }
} catch (err) {
  console.error(`✗ Backup exception:`, err.message);
  process.exit(1);
}
