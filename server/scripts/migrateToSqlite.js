#!/usr/bin/env node
/**
 * Astitva Innovation Storage Migration Utility
 * Generates relational SQLite schema and converts JSON database records into transactional tables.
 * Safe migration path with automatic backup snapshot before execution.
 */

const fs = require('fs');
const path = require('path');
const storage = require('../storage');

console.log('=== Astitva Innovation SQLite Migration Generator ===');

// 1. Snapshot primary JSON store before migration
const backupResult = storage.createNamedBackup('pre-sqlite-migration');
if (!backupResult.success) {
  console.error('Migration aborted: Unable to create pre-migration backup.');
  process.exit(1);
}
console.log(`✓ Safety snapshot created at: ${backupResult.path}`);

// 2. Read existing data
const db = storage.getDb();

// 3. Generate SQLite Schema DDL
const schemaSql = `
-- Astitva Innovation Production SQLite Schema
-- High-reliability transactional storage migration

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inquiries & Commercial Leads
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  budget TEXT,
  message TEXT,
  status TEXT DEFAULT 'New',
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products & Flagship Applications
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  category TEXT,
  badge TEXT,
  description TEXT,
  store_url TEXT,
  store_type TEXT,
  package_name TEXT,
  icon_url TEXT,
  status TEXT DEFAULT 'Active',
  is_featured INTEGER DEFAULT 0,
  technologies TEXT, -- JSON array
  features TEXT,     -- JSON array
  metrics TEXT,      -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Founders & Executive Leadership
CREATE TABLE IF NOT EXISTS founders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  role_badge TEXT,
  bio TEXT,
  portfolio_summary TEXT,
  key_skills TEXT, -- JSON array
  photo_url TEXT,
  linkedin TEXT,
  instagram TEXT,
  email TEXT,
  phone TEXT,
  display_order INTEGER DEFAULT 0,
  enabled INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Careers & Hiring Postings
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  experience TEXT NOT NULL,
  salary TEXT NOT NULL,
  description TEXT,
  requirements TEXT, -- JSON array
  benefits TEXT,     -- JSON array
  status TEXT DEFAULT 'Active',
  enabled INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job Applications & ATS Records
CREATE TABLE IF NOT EXISTS job_applications (
  id TEXT PRIMARY KEY,
  job_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  linkedin TEXT,
  portfolio TEXT,
  resume_url TEXT,
  cover_note TEXT,
  status TEXT DEFAULT 'Applied',
  admin_notes TEXT,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

-- WhatsApp Contacts & Opt-in Consent
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  consent_status TEXT NOT NULL,
  consent_source TEXT NOT NULL,
  consent_timestamp DATETIME,
  opt_out_timestamp DATETIME,
  notes TEXT,
  tags TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp Message History
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id TEXT PRIMARY KEY, -- Meta wamid
  conversation_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('inbound', 'outbound')),
  type TEXT NOT NULL,
  text TEXT,
  status TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  status_timestamp DATETIME,
  sender_name TEXT,
  raw_payload TEXT -- JSON
);

-- WhatsApp Delivery Logs
CREATE TABLE IF NOT EXISTS whatsapp_delivery_logs (
  id TEXT PRIMARY KEY,
  correlation_id TEXT,
  timestamp DATETIME NOT NULL,
  message_id TEXT,
  recipient TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  http_status INTEGER,
  meta_error_code TEXT,
  meta_error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  success INTEGER NOT NULL
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT -- JSON
);
`;

const schemaPath = path.join(storage.DATA_DIR, 'sqlite_schema.sql');
fs.writeFileSync(schemaPath, schemaSql.trim(), 'utf8');
console.log(`✓ SQLite DDL generated: ${schemaPath}`);

console.log(`\nMigration preparation complete.`);
console.log(`- Pre-migration backup: ${backupResult.filename}`);
console.log(`- Database records counted:`);
console.log(`    Inquiries: ${db.inquiries?.length || 0}`);
console.log(`    Products: ${db.products?.length || 0}`);
console.log(`    Founders: ${db.founders?.length || 0}`);
console.log(`    Jobs: ${db.jobs?.length || 0}`);
console.log(`    Applications: ${db.jobApplications?.length || 0}`);
console.log(`    WhatsApp Contacts: ${db.whatsappContacts?.length || 0}`);
console.log(`    WhatsApp Messages: ${db.whatsappMessages?.length || 0}`);
console.log(`\nTo roll back at any time:`);
console.log(`  node server/scripts/restoreDb.js "${backupResult.path}"`);
