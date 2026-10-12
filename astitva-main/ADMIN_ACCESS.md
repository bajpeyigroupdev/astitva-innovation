# Astitva Innovation — Administrator Access Guide

This guide details how to access the authoritative B2B Administrative Command Center for **Astitva Innovation**.

---

## 1. Official B2B Access Endpoint

- **Authoritative Production URL**: [https://b2b.astitvainnovation.in/login](https://b2b.astitvainnovation.in/login)
- **Local Development URL**: `http://localhost:5174/login` (or port assigned to dashboard)
- **Public Corporate Website**: [https://astitvainnovation.in](https://astitvainnovation.in)

> [!NOTE]
> The Corporate Website (`astitvainnovation.in`) does NOT host the admin panel. All administrative traffic is isolated to the B2B subdomain `b2b.astitvainnovation.in`.

---

## 2. Administrator Identity Format

- **Standard Admin Identity Format**: `AST-ADMIN-XX`
- **Default System Admin ID**: `AST-ADMIN-01`

---

## 3. Server-Side Authentication Architecture

In production, admin credentials are never stored in client bundles or Vite environment variables. Authentication is handled server-side:

```
B2B Dashboard (b2b.astitvainnovation.in)
     │
     ▼ POST /api/auth/login
Express API Server (Port 5000)
     │
     ▼ Bcrypt verification against ADMIN_PASSWORD_HASH
Issued JWT Session Token (8h expiration)
```

Server environment configuration resides in `server/.env`:
```env
ADMIN_USERNAME=AST-ADMIN-01
ADMIN_PASSWORD_HASH=<bcrypt hash>
JWT_SECRET=<secret key>
```

---

## 4. Administrative Security Policies

1. **Expiring Sessions**:
   - Authenticated admin sessions automatically terminate after 8 hours.
2. **Search Engine Protection**:
   - `b2b.astitvainnovation.in` declares `noindex, nofollow, noarchive, nosnippet` in HTML, HTTP headers, and `robots.txt`.
3. **Session Revocation**:
   - Clicking **Sign Out** immediately purges the session token from browser memory.
