# Astitva Innovation — B2B Admin Access Guide

This guide details how to access and manage the B2B Command Center for **Astitva Innovation**.

---

## 1. Official B2B Access Endpoint

- **Authoritative Production URL**: [https://b2b.astitvainnovation.in/login](https://b2b.astitvainnovation.in/login)
- **Local Development URL**: `http://localhost:5174/login`
- **Dashboard Routes**:
  - `/login` — Administrator Authentication
  - `/` — Operations Overview
  - `/inquiries` — Lead & Inquiry Management
  - `/fintech` — FinTech & Webhook Logs
  - `/proposals` — Statement of Work Generator
  - `/services` — Offerings & Pricing Manager
  - `/server` — VPS & Domain Status
  - `/settings` — Profile & Configuration

---

## 2. Administrator Identity

- **System Admin ID**: `AST-ADMIN-01`
- **Verification Engine**: Server-Side Bcrypt / Argon2id with JWT Bearer tokens
- **Credentials Location**: `server/.env` (Never exposed to client bundles)

---

## 3. Production Hardening Policies

1. **Strict No-Index Rules**:
   - `robots.txt` Disallows all search engines.
   - Nginx delivers `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`.
2. **Session Security**:
   - 8-hour cryptographic JWT session validity.
   - Rate limiting on `/api/auth/login` (max 10 attempts per 15 minutes).
